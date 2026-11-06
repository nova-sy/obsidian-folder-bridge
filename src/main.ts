import { randomBytes } from 'node:crypto';
import { Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { createFolderServer, PORT } from './server';
import type { Server } from 'node:http';

export default class FolderBridge extends Plugin {
  private token = '';
  private server?: Server;

  async onload(): Promise<void> {
    const saved = await this.loadData() as { token?: string } | null;
    this.token = saved?.token || randomBytes(24).toString('hex');
    if (!saved?.token) await this.saveData({ token: this.token });

    this.addSettingTab(new FolderBridgeSettings(this));
    this.server = createFolderServer(
      this.app.vault.getName(),
      () => this.app.vault.getAllFolders().map(folder => folder.path),
      this.token,
    );
    this.server.on('error', error => {
      console.error('Folder Bridge:', error);
      new Notice(`Folder Bridge could not listen on 127.0.0.1:${PORT}`);
    });
    this.server.listen(PORT, '127.0.0.1');
  }

  onunload(): void {
    this.server?.close();
  }

  getToken(): string {
    return this.token;
  }
}

class FolderBridgeSettings extends PluginSettingTab {
  constructor(private bridge: FolderBridge) {
    super(bridge.app, bridge);
  }

  display(): void {
    this.containerEl.empty();
    new Setting(this.containerEl)
      .setName('Connection token')
      .setDesc('Copy once into the folder selector in your Web Clipper fork. The bridge only returns folder names.')
      .addButton(button => button.setButtonText('Copy token').onClick(async () => {
        await navigator.clipboard.writeText(this.bridge.getToken());
        new Notice('Folder Bridge token copied');
      }));
  }
}

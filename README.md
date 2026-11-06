# Folder Bridge for Web Clipper

Desktop-only Obsidian plugin that supplies the vault's folder paths to [this Web Clipper fork](https://github.com/nova-sy/obsidian-clipper). It never returns note content or writes to the vault.

## Install

1. Run `npm ci && npm run build` in this repository.
2. Create `<your vault>/.obsidian/plugins/obsidian-folder-bridge/` and copy `manifest.json` and `main.js` there.
3. Reload Obsidian and enable **Folder Bridge for Web Clipper** under **Settings → Community plugins**.
4. In the plugin settings, copy the connection token. Paste it once into the folder dropdown's **Connect or change token…** option in the Web Clipper fork.

The plugin listens on `127.0.0.1:27124` while this vault is open. It only accepts authenticated requests from Chrome extension origins. One open vault can own the port; if another vault already has it, the plugin reports an error and its folder list is unavailable. The original editable folder field in Web Clipper still works.

## Development

`npm test` checks the local endpoint's authentication and nested paths. `npm run build` produces the Obsidian plugin's `main.js`.

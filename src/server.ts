import { createServer, type Server } from 'node:http';

export const PORT = 27124;

export function createFolderServer(vault: string, folders: () => string[], token: string): Server {
  return createServer((request, response) => {
    const origin = request.headers.origin;
    if (!origin || !/^chrome-extension:\/\/[a-p]{32}$/.test(origin)) {
      response.writeHead(403).end();
      return;
    }

    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Cache-Control', 'no-store');
    if (request.method === 'OPTIONS') {
      response.setHeader('Access-Control-Allow-Methods', 'GET');
      response.setHeader('Access-Control-Allow-Headers', 'X-Folder-Bridge-Token');
      response.writeHead(204).end();
      return;
    }
    if (request.method !== 'GET' || request.url !== '/folders') {
      response.writeHead(404).end();
      return;
    }
    if (request.headers['x-folder-bridge-token'] !== token) {
      response.writeHead(401).end();
      return;
    }
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({ vault, folders: folders().sort((a, b) => a.localeCompare(b)) }));
  });
}

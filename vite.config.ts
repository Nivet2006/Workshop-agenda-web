import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

function localDbPlugin() {
  const dbDir = path.resolve(__dirname, 'db');
  const dbFile = path.resolve(dbDir, 'submissions.json');

  const getSubmissions = () => {
    try {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      if (!fs.existsSync(dbFile)) {
        fs.writeFileSync(dbFile, '[]', 'utf-8');
        return [];
      }
      const raw = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter((item: any) => 
          !item.id?.startsWith('sub-seed-') && 
          item.userEmail !== 'alex.rivers@example.com' &&
          item.userEmail !== 'maya.c@example.com' &&
          item.userEmail !== 'rohan.s@example.com'
        );
        if (clean.length !== parsed.length) {
          fs.writeFileSync(dbFile, JSON.stringify(clean, null, 2), 'utf-8');
        }
        return clean;
      }
      return [];
    } catch (e) {
      console.error('Error reading submissions from db:', e);
      return [];
    }
  };

  const saveSubmissions = (data: any[]) => {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
  };

  return {
    name: 'local-db-api',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url || '';
        if (!url.startsWith('/api/db/submissions')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          const list = getSubmissions();
          res.end(JSON.stringify(list));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });

        req.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};

            if (req.method === 'POST') {
              const list = getSubmissions();
              const newRecord = parsed;
              const existingIdx = list.findIndex((item: any) => 
                (newRecord.id && item.id === newRecord.id) || 
                (item.userId === newRecord.userId && item.key === newRecord.key && item.eventId === newRecord.eventId)
              );
              if (existingIdx >= 0) {
                list[existingIdx] = { ...list[existingIdx], ...newRecord };
              } else {
                list.unshift(newRecord);
              }
              saveSubmissions(list);
              res.end(JSON.stringify({ success: true, record: newRecord }));
              return;
            }

            if (req.method === 'DELETE') {
              const urlObj = new URL(url, 'http://localhost');
              const singleId = urlObj.searchParams.get('id');
              const idsToDelete: string[] = Array.isArray(parsed.ids) 
                ? parsed.ids 
                : (singleId ? [singleId] : (parsed.id ? [parsed.id] : []));

              const list = getSubmissions();
              const beforeCount = list.length;
              const filtered = list.filter((item: any) => !idsToDelete.includes(item.id));
              saveSubmissions(filtered);
              res.end(JSON.stringify({ success: true, deleted: beforeCount - filtered.length, remaining: filtered.length }));
              return;
            }

            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method not allowed' }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), localDbPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      watch: {
        ignored: ['**/db/**', '**/db/submissions.json', '**/db/*']
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

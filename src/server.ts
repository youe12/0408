import { createServer, type IncomingMessage } from 'http';
import type { ParsedUrlQuery } from 'querystring';
import next from 'next';

/** WHATWG URL，避免 Node 警告 DEP0169（url.parse 已弃用） */
function parseRequestUrl(req: IncomingMessage, fallbackHost: string): {
  pathname: string;
  query: ParsedUrlQuery;
} {
  const host = req.headers.host ?? fallbackHost;
  const base = host.includes(':') ? `http://${host}` : `http://${host}`;
  const u = new URL(req.url ?? '/', base);
  const query: ParsedUrlQuery = {};
  for (const key of u.searchParams.keys()) {
    const values = u.searchParams.getAll(key);
    query[key] = values.length <= 1 ? values[0] ?? '' : values;
  }
  return { pathname: u.pathname, query };
}

const dev = process.env.COZE_PROJECT_ENV !== 'PROD';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '5000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parseRequestUrl(req, `${hostname}:${port}`);
      // Next 类型要求完整 Url 对象，运行时仅需 pathname + query（与官方 custom server 示例行为一致）
      await handle(req, res, parsedUrl as Parameters<typeof handle>[2]);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });
  server.once('error', err => {
    console.error(err);
    process.exit(1);
  });
  server.listen(port, () => {
    console.log(
      `> Server listening at http://${hostname}:${port} as ${
        dev ? 'development' : process.env.COZE_PROJECT_ENV
      }`,
    );
  });
});

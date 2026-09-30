# Raw HTTP / HTTPS server

An HTTP server built on `net.createServer()` and an HTTPS server built on `tls.createServer()`. Neither uses `http` or `https`. Both servers share the same request parser and router (`src/handle-connection.js`).

## Requirements

- Node.js v24.21.0 (see `.nvmrc`; run `nvm use` to switch)
- openssl
- curl

No `npm install` needed: the project has no dependencies.

## Self-signed certificate

The HTTPS server reads `key.pem` and `cert.pem` from the repo root. Generate them once, from the repo root:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost"
```

Both files are listed in `.gitignore` and are not committed.

## Run

Run each server in its own terminal, from the repo root:

```bash
node src/server.js         # HTTP  -> http://localhost:3000
node src/https-server.js   # HTTPS -> https://localhost:3443
```

## Try it

```bash
curl -sv http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/nope
curl -s http://localhost:3000/headers -H "X-Demo: abc"
curl -sk -o /dev/null -w "%{http_code}\n" https://localhost:3443/
```

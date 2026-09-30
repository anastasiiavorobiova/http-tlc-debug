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

## Debug session: `openssl s_client`

```
$ openssl s_client -connect localhost:3443 -servername localhost
Connecting to ::1
depth=0 CN=localhost
verify error:num=18:self-signed certificate
verify return:1
depth=0 CN=localhost
verify return:1
CONNECTED(00000005)
---
Certificate chain
 0 s:CN=localhost
   i:CN=localhost
   a:PKEY: RSA, 2048 (bit); sigalg: sha256WithRSAEncryption
   v:NotBefore: Sep 30 12:21:34 2026 GMT; NotAfter: Sep 30 12:21:34 2027 GMT
---
Server certificate
-----BEGIN CERTIFICATE-----
(omitted)
-----END CERTIFICATE-----
subject=CN=localhost
issuer=CN=localhost
---
No client certificate CA names sent
Peer signing digest: SHA256
Peer signature type: rsa_pss_rsae_sha256
Negotiated TLS1.3 group: X25519MLKEM768
---
SSL handshake has read 2425 bytes and written 1622 bytes
Verification error: self-signed certificate
---
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
Protocol: TLSv1.3
Server public key is 2048 bit
This TLS version forbids renegotiation.
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 18 (self-signed certificate)
---
DONE
```

**Why verify error 18:** code 18 (`X509_V_ERR_DEPTH_ZERO_SELF_SIGNED_CERT`) means the server's certificate is signed by itself (subject = issuer = `CN=localhost`) and no trusted CA vouches for it, so the client cannot build a chain of trust. This is expected for a self-signed certificate. The TLS handshake still completes.

For comparison, other common verify codes:

| Code | Meaning                                                              |
| ---- | -------------------------------------------------------------------- |
| 18   | self-signed certificate                                              |
| 19   | self-signed certificate in chain (chain incomplete / untrusted root) |
| 10   | certificate has expired                                              |

const HEADERS_END = "\r\n\r\n";
const MAX_HEADER_SIZE = 8 * 1024;

export function handleConnection(socket) {
  console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

  let buffer = Buffer.alloc(0);
  let handled = false;

  socket.on("data", (chunk) => {
    if (handled) return;

    buffer = Buffer.concat([buffer, chunk]);

    if (buffer.length > MAX_HEADER_SIZE) {
      handled = true;
      socket.end(
        "HTTP/1.1 431 Request Header Fields Too Large\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
      );
      return;
    }

    const end = buffer.indexOf(HEADERS_END);
    if (end === -1) return;

    handled = true;
    const head = buffer.subarray(0, end).toString("latin1");

    const req = parseHead(head);

    console.log("Parsed request:", req);
    socket.end(router(req));
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (err) => {
    console.error(`Socket error: ${err.message}`);
  });
}

//
// Helper functions for parsing, routing, response template.
//

function res(status, statusText, body = "") {
  const bodyBuffer = Buffer.from(body, "latin1");
  const head =
    `HTTP/1.1 ${status} ${statusText}\r\n` +
    `Content-Type: text/plain; charset=utf-8\r\n` +
    `Content-Length: ${bodyBuffer.length}\r\n` +
    `Connection: close\r\n` +
    `\r\n`;

  return Buffer.concat([Buffer.from(head, "latin1"), bodyBuffer]);
}

function router(req) {
  if (!req) return res(400, "Bad Request", "Bad Request\n");

  const pathname = req.route.split("?")[0];

  if (req.method === "GET" && pathname === "/") {
    return res(200, "OK", "Hello from raw HTTP\n");
  }

  if (req.method === "GET" && pathname === "/headers") {
    const body =
      Object.entries(req.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n") + "\n";

    return res(200, "OK", body);
  }

  return res(404, "Not Found", "Not Found\n");
}

function parseHead(head) {
  const [requestLine, ...headerLines] = head.split("\r\n");

  const parts = requestLine.split(" ");

  if (parts.length !== 3 || !parts[2].startsWith("HTTP/")) return null;
  const [method, route, version] = parts;

  const headers = {};

  for (const line of headerLines) {
    const i = line.indexOf(":");

    if (i === -1) continue;

    const key = line.slice(0, i).trim().toLowerCase();

    headers[key] = line.slice(i + 1).trim();
  }

  return { method, route, version, headers };
}

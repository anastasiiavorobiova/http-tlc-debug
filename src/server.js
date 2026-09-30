const net = require("net");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = `http://${HOST}:${PORT}`;

const HEADERS_END = "\r\n\r\n";
const MAX_HEADER_SIZE = 8 * 1024;

const server = net.createServer((socket) => {
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

    console.log("Received request head:", head);

    socket.end(
      "HTTP/1.1 200 OK\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
    );
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (err) => {
    console.error(`Socket error: ${err.message}`);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on ${BASE_URL}`);
});

server.on("error", (err) => {
  console.error(`Server error: ${err.message}`);
});

const net = require("net");

net
  .createServer((socket) => {
    socket.on("data", (chunk) => console.log(JSON.stringify(chunk.toString())));
  })
  .listen(3000);

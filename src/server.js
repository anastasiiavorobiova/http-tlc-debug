import net from "node:net";
import { handleConnection } from "./handle-connection.js";

const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = `http://localhost:${PORT}`;

const server = net.createServer(handleConnection);

server.listen(PORT, () => {
  console.log(`Server listening on ${BASE_URL}`);
});

server.on("error", (err) => {
  console.error(`Server error: ${err.message}`);
});

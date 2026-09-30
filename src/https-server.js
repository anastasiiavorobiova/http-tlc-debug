import tls from "node:tls";
import fs from "node:fs";
import { handleConnection } from "./handle-connection.js";

const PORT = Number(process.env.PORT) || 3443;

const key = fs.readFileSync("key.pem");
const cert = fs.readFileSync("cert.pem");
const opts = {
  key,
  cert,
};

tls.createServer(opts, handleConnection).listen(PORT);

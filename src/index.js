import express from "express";
import path from "path";
import { Server } from "socket.io";
import http from "http";
import Filter from "bad-words";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());

io.on("connection", (socket) => {
  const welcomeMsg = "Welcome";
  socket.emit("message", welcomeMsg);
  socket.broadcast.emit("message", "A new user has joined the Chat!");

  socket.on("newMessage", (clientMessage, ack_callback) => {
    //Filtering Profanity
    const filter = new Filter();
    clientMessage = filter.clean(clientMessage);

    io.emit("message", clientMessage);
    ack_callback();
  });

  socket.on("sendLocation", (loc, ack_callback) => {
    io.emit(
      "locationMessage",
      `https://google.com/maps?q=${loc.lat},${loc.long}`
    );
    ack_callback("Location Shared");
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left the chat");
  });
});

app.use(express.static(path.join(__dirname, "../public")));

server.listen("3000", () => {
  console.log("App is running");
});

import express from "express";
import path from "path";
import { Server } from "socket.io";
import http from "http";
import Filter from "bad-words";
import { fileURLToPath } from "url";
import { generateMsg } from "./utils/generateMsg.js";
import { addUser, removeUser, getUser, getUsersInRoom } from "./utils/user.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());

io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    //user.room is cleaned(trim+lowecase) in the addUser function
    socket.join(user.room);

    socket.emit("message", generateMsg(`Welcome ${user.username}`, "Admin"));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMsg(`${user.username} has joined the Chat!`, "Admin")
      );
  });

  socket.on("newMessage", (clientMessage, ack_callback) => {
    //Filtering Profanity
    const filter = new Filter();
    clientMessage = filter.clean(clientMessage);

    const user = getUser(socket.id);

    io.to(user.room).emit("message", generateMsg(clientMessage, user.username));
    ack_callback();
  });

  socket.on("sendLocation", (loc, ack_callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateMsg(
        `https://google.com/maps?q=${loc.lat},${loc.long}`,
        user.username
      )
    );
    ack_callback("Location Shared");
  });

  socket.on("disconnect", () => {
    const exitUser = removeUser(socket.id);

    if (exitUser) {
      io.to(exitUser.room).emit(
        "message",
        generateMsg(`${exitUser.username} has left the chat`, "Admin")
      );
    }
  });
});

app.use(express.static(path.join(__dirname, "../public")));

server.listen("3000", () => {
  console.log("App is running");
});

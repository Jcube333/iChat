import express from "express"
import path from "path"
import {Server} from "socket.io"
import http from "http"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


const app=express();
const server=http.createServer(app)
const io=new Server(server)
app.use(express.json());

io.on('connection',(socket)=>{
    const welcomeMsg="Welcome"
    socket.emit('message',welcomeMsg);

    socket.on('newMessage',(clientMessage)=>{
        io.emit('message',clientMessage);
    })

})


app.use(express.static(path.join(__dirname,"../public")));

server.listen("3000",()=>{
    console.log("App is running");
})
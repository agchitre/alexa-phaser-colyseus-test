
import {Server} from "colyseus";
import {createServer} from "http";
import { AlexaServer } from "./server/alexa/AlexaServer.js";
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GameRoom } from './server/multiplayer/rooms/GameRoom.js';
import { monitor } from "@colyseus/monitor";

//CHANGE THIS TO YOUR WEB APP URL
const WEB_APP_URL = "https://colyseus-chat.herokuapp.com/";
const PORT = process.env.PORT || 8080;

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));


//SET UP WEB APP
app.use(express.static(__dirname + '/client'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use("/colyseus", monitor());

//SET UP ALEXA
const alexaServer = new AlexaServer(app, WEB_APP_URL);

//SET UP COLYSEUS SERVER
const gameServer = new Server({
    server:  createServer(app)
});
gameServer.listen(PORT);
gameServer.define("gameRoom", GameRoom);

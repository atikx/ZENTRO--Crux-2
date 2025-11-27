import express from "express";
import routes from "./routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import http from "http";
import { Server } from "socket.io";
const app = express();
const PORT = process.env.PORT || 5000; // Middlewares
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public/uploads"))
);
// API routes
app.get("/", (req, res) => {
  res.send("Hello, World Atiksh!");
});
app.use("/api", routes); // ---------------------------------------------------- /
// / NEW PART: attach HTTP + WebSocket server // ----------------------------------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", credentials: true },
});
// SOCKET.IO CONNECTION
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);
  socket.on("broadcaster-join", (roomId) => {
    socket.join(roomId);
    console.log("Broadcaster joined:", roomId);
  });
  socket.on("viewer-join", (roomId) => {
    socket.join(roomId);
    console.log("Viewer joined:", roomId);
    socket.to(roomId).emit("viewer-request-offer", socket.id);
  });
  socket.on("send-offer", ({ to, offer }) => {
    io.to(to).emit("offer", { offer });
  });
  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("send-answer", { answer });
  });
  socket.on("ice", ({ to, candidate, roomId }) => {
    if (to) io.to(to).emit("ice", { candidate });
    else socket.to(roomId).emit("ice", { candidate });
  });
});

// START SERVER
server.listen(PORT, () => {
  console.log(`Socket Server is running on http://localhost:${PORT}`);
});

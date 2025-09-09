// index.js
import express from "express";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: ["http://localhost:5173"], // frontend origin(s) - change port if required
    credentials: true
}));

app.get("/health", (req, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173"], // frontend origin
        methods: ["GET", "POST"],
        credentials: true
    },
    // pingInterval/pingTimeout defaults are fine for dev
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("room:join", (data) => {
        try {
            const { email, room } = data || {};
            if (!room) return socket.emit("error", { message: "room is required" });

            socket.join(room);
            if (email) {
                emailToSocketIdMap.set(email, socket.id);
                socketidToEmailMap.set(socket.id, email);
            }

            // Notify others in the room that a user joined (excluding the joining socket)
            socket.to(room).emit("user:joined", { email, id: socket.id });
            // Confirm to the joining user
            socket.emit("room:join", { email, room, id: socket.id });
        } catch (err) {
            console.error("room:join error", err);
            socket.emit("error", { message: "failed to join room" });
        }
    });

    // Signaling: user calls someone (by socket id)
    socket.on("user:call", (payload) => {
        try {
            const { to, offer } = payload || {};
            if (!to) return socket.emit("error", { message: "missing target socket id" });
            io.to(to).emit("incoming:call", { from: socket.id, offer });
        } catch (err) {
            console.error("user:call error", err);
        }
    });

    socket.on("call:accepted", ({ to, ans }) => {
        try {
            io.to(to).emit("call:accepted", { from: socket.id, ans });
        } catch (err) {
            console.error("call:accepted error", err);
        }
    });

    // Renegotiation flow
    socket.on("peer:nego:needed", ({ to, offer }) => {
        try {
            io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
        } catch (err) {
            console.error("peer:nego:needed error", err);
        }
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
        try {
            io.to(to).emit("peer:nego:final", { from: socket.id, ans });
        } catch (err) {
            console.error("peer:nego:done error", err);
        }
    });

    // ICE candidate exchange
    socket.on("ice-candidate", ({ to, candidate }) => {
        try {
            if (!to || !candidate) return;
            io.to(to).emit("ice-candidate", { from: socket.id, candidate });
        } catch (err) {
            console.error("ice-candidate error", err);
        }
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", socket.id, reason);
        const email = socketidToEmailMap.get(socket.id);
        if (email) {
            emailToSocketIdMap.delete(email);
            socketidToEmailMap.delete(socket.id);
        }
        // broadcast to all rooms that this user left
        socket.rooms.forEach((room) => {
            socket.to(room).emit("user:left", { id: socket.id, email });
        });
    });
});

// Start server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

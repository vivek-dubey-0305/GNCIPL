// Lobby.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../providers/SocketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState(null);
  const socket = useSocket();
  const navigate = useNavigate();

  // *Unnecessay renders are saved via useCallback
  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!room) {
        setError("Please enter a room id");
        return;
      }
      try {
        socket.emit("room:join", { email, room });
      } catch (err) {
        console.error("emit room:join", err);
        setError("Failed to join room");
      }
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      // data has { email, room, id }
      navigate(`/room/${data.room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    socket.on("error", (err) => setError(err?.message || "socket error"));
    return () => {
      socket.off("room:join", handleJoinRoom);
      socket.off("error");
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 to-indigo-800 p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-4">🎧 Join a Room</h1>

        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-sm text-white/80">Email (optional)</label>
            <input
              className="mt-1 w-full rounded-md border border-white/20 bg-white/5 p-2 text-white focus:outline-none"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80">Room ID</label>
            <input
              className="mt-1 w-full rounded-md border border-white/20 bg-white/5 p-2 text-white focus:outline-none"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="room-123"
              required
            />
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}

          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">
              Join
            </button>
            <button
              type="button"
              onClick={() => { setRoom(Math.random().toString(36).slice(2, 8)); setError(null); }}
              className="px-4 py-2 rounded-md border border-white/10 text-white"
            >
              Random Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LobbyScreen;

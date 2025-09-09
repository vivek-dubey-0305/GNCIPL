// Room.jsx
import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSocket } from "../providers/SocketProvider";
import Peer from "../services/Peer";
import { useParams } from "react-router-dom";

const RoomPage = () => {
  const socket = useSocket();
  const { roomId } = useParams();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState("idle");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // When Peer generates local ICE candidates, send them through socket
  useEffect(() => {
    Peer.onIceCandidate = (candidate) => {
      if (!remoteSocketId) return;
      socket.emit("ice-candidate", { to: remoteSocketId, candidate });
    };
  }, [socket, remoteSocketId]);

  // show local stream in local video
  useEffect(() => {
    if (localVideoRef.current && myStream) {
      localVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  // show remote stream in remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // When other user joins the room
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log("user joined", email, id);
    setRemoteSocketId(id);
  }, []);

  // Make a call: create offer, send to remote socket id, attach local tracks
  const handleCallUser = useCallback(async () => {
    try {
      setStatus("getting-media");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);

      // add tracks to peer connection
      stream.getTracks().forEach((t) => Peer.addTrack(t, stream));

      setStatus("creating-offer");
      const offer = await Peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
      setStatus("offer-sent");
    } catch (err) {
      console.error("handleCallUser error", err);
      setStatus("error");
    }
  }, [remoteSocketId, socket]);

  // When receiving incoming call
  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    try {
      setRemoteSocketId(from);
      setStatus("incoming-call");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);

      // add local tracks
      stream.getTracks().forEach((t) => Peer.addTrack(t, stream));

      // get answer and send back
      const ans = await Peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
      setStatus("call-answered");
    } catch (err) {
      console.error("handleIncomingCall error", err);
      setStatus("error");
    }
  }, [socket]);

  // When call accepted by callee (we are caller)
  const handleCallAccepted = useCallback(({ from, ans }) => {
    try {
      Peer.setLocalDescription(ans);
      setStatus("connected");
    } catch (err) {
      console.error("handleCallAccepted", err);
    }
  }, []);

  // Negotiation-needed flow (renegotiate)
  const handleNegoNeeded = useCallback(async () => {
    try {
      if (!remoteSocketId) return;
      const offer = await Peer.getOffer();
      socket.emit("peer:nego:needed", { to: remoteSocketId, offer });
    } catch (err) {
      console.error("handleNegoNeeded", err);
    }
  }, [remoteSocketId, socket]);

  // When other peer asks for negotiation
  const handleNegoNeededIncoming = useCallback(async ({ from, offer }) => {
    try {
      const ans = await Peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    } catch (err) {
      console.error("handleNegoNeededIncoming", err);
    }
  }, [socket]);

  const handleNegoFinal = useCallback(async ({ ans }) => {
    try {
      await Peer.setLocalDescription(ans);
    } catch (err) {
      console.error("handleNegoFinal", err);
    }
  }, []);

  // When receiving remote ICE candidate from server
  const handleRemoteCandidate = useCallback(({ from, candidate }) => {
    try {
      if (!candidate) return;
      Peer.addRemoteCandidate(candidate);
    } catch (err) {
      console.error("handleRemoteCandidate error", err);
    }
  }, []);

  // When we get tracks from remote peer
  useEffect(() => {
    const onTrack = (ev) => {
      // ev.streams is an array; usually use ev.streams[0]
      if (ev.streams && ev.streams[0]) {
        setRemoteStream(ev.streams[0]);
      } else {
        // fallback: build MediaStream from tracks
        const ms = new MediaStream();
        ev.track && ms.addTrack(ev.track);
        setRemoteStream(ms);
      }
    };

    Peer.peer.addEventListener("track", onTrack);
    Peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      Peer.peer.removeEventListener("track", onTrack);
      Peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  // Attach socket listeners
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeededIncoming);
    socket.on("peer:nego:final", handleNegoFinal);
    socket.on("ice-candidate", handleRemoteCandidate);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeededIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
      socket.off("ice-candidate", handleRemoteCandidate);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeededIncoming,
    handleNegoFinal,
    handleRemoteCandidate
  ]);

  // Send local candidate to remote when PeerService reports it
  useEffect(() => {
    Peer.onIceCandidate = (candidate) => {
      if (!remoteSocketId) return;
      socket.emit("ice-candidate", { to: remoteSocketId, candidate });
    };
  }, [remoteSocketId, socket]);

  return (
    <div className="min-h-screen p-6 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Local</h2>
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-64 bg-black rounded-md" />
          <div className="mt-3">
            {myStream ? (
              <button onClick={() => {
                myStream.getTracks().forEach(t => t.enabled = !t.enabled);
              }} className="px-3 py-1 rounded bg-indigo-600">Toggle Tracks</button>
            ) : (
              <button onClick={() => { handleCallUser(); }} className="px-3 py-1 rounded bg-green-600">Get Media & Call</button>
            )}
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Remote</h2>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-64 bg-black rounded-md" />
          <div className="mt-3">
            <div className="text-sm">Status: {status}</div>
            <div className="mt-2">
              {remoteSocketId ? (
                <div>Connected with: {remoteSocketId}</div>
              ) : (
                <div>No peer in room yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;

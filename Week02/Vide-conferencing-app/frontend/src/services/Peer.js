// Peer.js
class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          { urls: ["stun:stun.l.google.com:19302"] }
          // For production add a TURN server here.
        ]
      });

      // Candidate callback placeholder (to be set by consumer)
      this.onIceCandidate = null;

      this.peer.onicecandidate = (event) => {
        if (event.candidate && typeof this.onIceCandidate === "function") {
          this.onIceCandidate(event.candidate);
        }
      };

      // Consumers listen to track events on this.peer directly
    }
  }

  async getOffer() {
    try {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      // Return the local description object (sdp + type)
      return this.peer.localDescription;
    } catch (err) {
      console.error("getOffer error", err);
      throw err;
    }
  }

  async getAnswer(offer) {
    try {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(ans);
      return this.peer.localDescription;
    } catch (err) {
      console.error("getAnswer error", err);
      throw err;
    }
  }

  async setLocalDescription(ans) {
    try {
      await this.peer.setRemoteDescription(ans);
    } catch (err) {
      console.error("setLocalDescription error", err);
    }
  }

  addTrack(track, stream) {
    try {
      return this.peer.addTrack(track, stream);
    } catch (err) {
      console.error("addTrack error", err);
    }
  }

  addRemoteCandidate(candidate) {
    try {
      return this.peer.addIceCandidate(candidate);
    } catch (err) {
      console.error("addRemoteCandidate error", err);
    }
  }
}

export default new PeerService();

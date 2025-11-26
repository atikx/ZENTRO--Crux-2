class PeerService {
  createPeer() {
    return new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  }

  async createOffer(peer: RTCPeerConnection) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(peer: RTCPeerConnection, offer: RTCSessionDescriptionInit) {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  }

  async addAnswer(peer: RTCPeerConnection, answer: RTCSessionDescriptionInit) {
    await peer.setRemoteDescription(answer);
  }
}

export default new PeerService();

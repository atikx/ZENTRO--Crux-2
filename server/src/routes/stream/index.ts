import { Router, Request, Response } from "express";
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from "@koush/wrtc";

const router = Router();

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface BroadcasterData {
  peer: RTCPeerConnection;
  stream: any;
}

interface ViewerData {
  peer: RTCPeerConnection;
}

const broadcasters = new Map<string, BroadcasterData>();
const viewers = new Map<string, ViewerData>(); // viewerId -> ViewerData

// ---------- BROADCAST ----------
router.post("/broadcast/:streamId", async (req: Request, res: Response) => {
  const { streamId } = req.params;
  const peer = new RTCPeerConnection(rtcConfig);

  peer.ontrack = (e: any) => {
    console.log(`📡 Broadcaster track received (${e.track.kind}) for stream ${streamId}`);
    
    const existingBroadcaster = broadcasters.get(streamId);
    if (existingBroadcaster) {
      existingBroadcaster.stream = e.streams[0];
    } else {
      broadcasters.set(streamId, { peer, stream: e.streams[0] });
    }
  };

  peer.onicecandidate = (event: any) => {
    if (event.candidate) {
      console.log(`🧊 Broadcaster ICE candidate: ${event.candidate.type}`);
    } else {
      console.log("🧊 Broadcaster ICE gathering complete");
    }
  };

  peer.oniceconnectionstatechange = () => {
    console.log(`🔌 Broadcaster ICE state: ${peer.iceConnectionState}`);
  };

  const desc = new RTCSessionDescription(req.body.sdp);
  await peer.setRemoteDescription(desc);
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  if (!broadcasters.has(streamId)) {
    broadcasters.set(streamId, { peer, stream: null });
  }

  console.log(`✅ Broadcaster connected for stream ${streamId}`);
  res.json({ sdp: peer.localDescription });
});

// ---------- VIEWER (Server creates offer) ----------
router.post("/view/:streamId", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { viewerId } = req.body; // Client should send a unique viewerId
    
    const broadcasterData = broadcasters.get(streamId);

    if (!broadcasterData || !broadcasterData.stream) {
      return res.status(404).json({ error: "No active stream found" });
    }

    console.log(`👁️ Viewer ${viewerId} connecting to stream ${streamId}`);

    const peer = new RTCPeerConnection(rtcConfig);

    // Store viewer peer connection
    viewers.set(viewerId, { peer });

    // ICE candidate handling
    peer.onicecandidate = (event: any) => {
      if (event.candidate) {
        console.log(`🧊 Viewer ICE candidate: ${event.candidate.type}`);
        // In a real app, you'd send this to the client via WebSocket
      } else {
        console.log("🧊 Viewer ICE gathering complete");
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log(`🔌 Viewer ICE state: ${peer.iceConnectionState}`);
    };

    peer.onconnectionstatechange = () => {
      console.log(`🔗 Viewer connection state: ${peer.connectionState}`);
    };

    // Add all tracks from broadcaster's stream
    broadcasterData.stream.getTracks().forEach((track: any) => {
      console.log(`➡ Adding track to viewer: ${track.kind}`);
      peer.addTrack(track, broadcasterData.stream);
    });

    // SERVER creates the offer
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    console.log(`✅ Created offer for viewer ${viewerId} on stream ${streamId}`);

    res.json({ 
      sdp: peer.localDescription,
      viewerId 
    });
  } catch (error) {
    console.error("Error connecting viewer:", error);
    res.status(500).json({ error: "Failed to connect viewer" });
  }
});

// ---------- VIEWER ANSWER ----------
router.post("/view/:streamId/answer", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { sdp, viewerId } = req.body;

    const viewerData = viewers.get(viewerId);
    if (!viewerData) {
      return res.status(404).json({ error: "Viewer not found" });
    }

    console.log(`📥 Received answer from viewer ${viewerId} for stream ${streamId}`);

    const answer = new RTCSessionDescription(sdp);
    await viewerData.peer.setRemoteDescription(answer);

    console.log(`✅ Set remote description for viewer ${viewerId}`);

    res.json({ success: true });
  } catch (error) {
    console.error("Error processing viewer answer:", error);
    res.status(500).json({ error: "Failed to process answer" });
  }
});

// ---------- ICE CANDIDATE ENDPOINTS ----------
router.post("/broadcast/:streamId/ice", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { candidate } = req.body;

    const broadcasterData = broadcasters.get(streamId);
    if (!broadcasterData) {
      return res.status(404).json({ error: "Broadcaster not found" });
    }

    if (candidate) {
      await broadcasterData.peer.addIceCandidate(new RTCIceCandidate(candidate));
      console.log(`🧊 Added ICE candidate for broadcaster ${streamId}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding broadcaster ICE candidate:", error);
    res.status(500).json({ error: "Failed to add ICE candidate" });
  }
});

router.post("/view/:streamId/ice", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { candidate, viewerId } = req.body;

    const viewerData = viewers.get(viewerId);
    if (!viewerData) {
      return res.status(404).json({ error: "Viewer not found" });
    }

    if (candidate) {
      await viewerData.peer.addIceCandidate(new RTCIceCandidate(candidate));
      console.log(`🧊 Added ICE candidate for viewer ${viewerId}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding viewer ICE candidate:", error);
    res.status(500).json({ error: "Failed to add ICE candidate" });
  }
});

export default router;

// import { Router, Request, Response } from "express";
// import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from "@koush/wrtc";

// const router = Router();

// const rtcConfig = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },
//     { urls: "stun:stun1.l.google.com:19302" },
//   ],
// };

// // Data structures for multiple streams
// interface BroadcasterData {
//   peer: RTCPeerConnection;
//   stream: any;
//   startedAt: Date;
//   viewerCount: number;
// }

// interface ViewerData {
//   peer: RTCPeerConnection;
//   streamId: string;
//   connectedAt: Date;
// }

// // Storage maps
// const broadcasters = new Map<string, BroadcasterData>(); // streamId -> BroadcasterData
// const viewers = new Map<string, ViewerData>(); // viewerId -> ViewerData

// // Helper to get all active streams
// function getActiveStreams() {
//   const streams: any[] = [];
//   broadcasters.forEach((data, streamId) => {
//     if (data.stream) {
//       streams.push({
//         streamId,
//         viewerCount: data.viewerCount,
//         startedAt: data.startedAt,
//         isLive: true,
//       });
//     }
//   });
//   return streams;
// }

// // ========== BROADCASTER ENDPOINTS ==========

// // Start broadcasting
// router.post("/broadcast/:streamId", async (req: Request, res: Response) => {
//   try {
//     const { streamId } = req.params;

//     // Check if stream already exists
//     if (broadcasters.has(streamId)) {
//       return res.status(409).json({
//         error: "Stream ID already in use",
//         message: "This stream ID is currently being used by another broadcaster"
//       });
//     }

//     console.log(`📡 New broadcaster connecting for stream: ${streamId}`);

//     const peer = new RTCPeerConnection(rtcConfig);

//     // Store broadcaster data
//     broadcasters.set(streamId, {
//       peer,
//       stream: null,
//       startedAt: new Date(),
//       viewerCount: 0,
//     });

//     peer.ontrack = (e: any) => {
//       console.log(`📡 Broadcaster track received (${e.track.kind}) for stream ${streamId}`);

//       const broadcasterData = broadcasters.get(streamId);
//       if (broadcasterData) {
//         broadcasterData.stream = e.streams[0];
//       }
//     };

//     peer.onicecandidate = (event: any) => {
//       if (event.candidate) {
//         console.log(`🧊 Broadcaster ICE candidate (${streamId}):`, event.candidate.type);
//       }
//     };

//     peer.oniceconnectionstatechange = () => {
//       console.log(`🔌 Broadcaster ICE state (${streamId}):`, peer.iceConnectionState);

//       // Clean up if connection fails
//       if (peer.iceConnectionState === "failed" || peer.iceConnectionState === "closed") {
//         console.log(`❌ Broadcaster disconnected: ${streamId}`);
//         cleanupBroadcaster(streamId);
//       }
//     };

//     const desc = new RTCSessionDescription(req.body.sdp);
//     await peer.setRemoteDescription(desc);
//     const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);

//     console.log(`✅ Broadcaster connected for stream ${streamId}`);
//     res.json({ sdp: peer.localDescription });
//   } catch (error) {
//     console.error("Error setting up broadcaster:", error);
//     res.status(500).json({ error: "Failed to setup broadcaster" });
//   }
// });

// // Broadcaster ICE candidates
// router.post("/broadcast/:streamId/ice", async (req: Request, res: Response) => {
//   try {
//     const { streamId } = req.params;
//     const { candidate } = req.body;

//     const broadcasterData = broadcasters.get(streamId);
//     if (!broadcasterData) {
//       return res.status(404).json({ error: "Broadcaster not found" });
//     }

//     if (candidate) {
//       await broadcasterData.peer.addIceCandidate(new RTCIceCandidate(candidate));
//       console.log(`🧊 Added ICE candidate for broadcaster ${streamId}`);
//     }

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Error adding broadcaster ICE candidate:", error);
//     res.status(500).json({ error: "Failed to add ICE candidate" });
//   }
// });

// // Stop broadcasting
// router.delete("/broadcast/:streamId", async (req: Request, res: Response) => {
//   const { streamId } = req.params;
//   console.log(`🛑 Stopping broadcast for stream: ${streamId}`);

//   cleanupBroadcaster(streamId);
//   res.json({ success: true, message: "Broadcast stopped" });
// });

// // ========== VIEWER ENDPOINTS ==========

// // Join stream as viewer
// router.post("/view/:streamId", async (req: Request, res: Response) => {
//   try {
//     const { streamId } = req.params;
//     const { viewerId } = req.body;

//     const broadcasterData = broadcasters.get(streamId);

//     if (!broadcasterData) {
//       return res.status(404).json({
//         error: "Stream not found",
//         message: "No active broadcast with this ID"
//       });
//     }

//     if (!broadcasterData.stream) {
//       return res.status(503).json({
//         error: "Stream not ready",
//         message: "Broadcaster is connecting, please try again"
//       });
//     }

//     console.log(`👁️ Viewer ${viewerId} connecting to stream ${streamId}`);

//     const peer = new RTCPeerConnection(rtcConfig);

//     // Store viewer data
//     viewers.set(viewerId, {
//       peer,
//       streamId,
//       connectedAt: new Date(),
//     });

//     // Increment viewer count
//     broadcasterData.viewerCount++;

//     // ICE candidate handling
//     peer.onicecandidate = (event: any) => {
//       if (event.candidate) {
//         console.log(`🧊 Viewer ICE candidate (${viewerId}):`, event.candidate.type);
//       }
//     };

//     peer.oniceconnectionstatechange = () => {
//       console.log(`🔌 Viewer ICE state (${viewerId}):`, peer.iceConnectionState);

//       // Clean up if connection fails
//       if (peer.iceConnectionState === "failed" || peer.iceConnectionState === "closed") {
//         console.log(`❌ Viewer disconnected: ${viewerId}`);
//         cleanupViewer(viewerId);
//       }
//     };

//     // Add broadcaster's tracks to viewer's peer connection
//     broadcasterData.stream.getTracks().forEach((track: any) => {
//       console.log(`➡ Adding track to viewer ${viewerId}: ${track.kind}`);
//       peer.addTrack(track, broadcasterData.stream);
//     });

//     // Create offer for viewer
//     const offer = await peer.createOffer();
//     await peer.setLocalDescription(offer);

//     console.log(`✅ Created offer for viewer ${viewerId} on stream ${streamId}`);

//     res.json({
//       sdp: peer.localDescription,
//       viewerId,
//       streamInfo: {
//         streamId,
//         viewerCount: broadcasterData.viewerCount,
//         startedAt: broadcasterData.startedAt,
//       },
//     });
//   } catch (error) {
//     console.error("Error connecting viewer:", error);
//     res.status(500).json({ error: "Failed to connect viewer" });
//   }
// });

// // Viewer answer
// router.post("/view/:streamId/answer", async (req: Request, res: Response) => {
//   try {
//     const { streamId } = req.params;
//     const { sdp, viewerId } = req.body;

//     const viewerData = viewers.get(viewerId);
//     if (!viewerData) {
//       return res.status(404).json({ error: "Viewer not found" });
//     }

//     console.log(`📥 Received answer from viewer ${viewerId} for stream ${streamId}`);

//     const answer = new RTCSessionDescription(sdp);
//     await viewerData.peer.setRemoteDescription(answer);

//     console.log(`✅ Set remote description for viewer ${viewerId}`);

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Error processing viewer answer:", error);
//     res.status(500).json({ error: "Failed to process answer" });
//   }
// });

// // Viewer ICE candidates
// router.post("/view/:streamId/ice", async (req: Request, res: Response) => {
//   try {
//     const { streamId } = req.params;
//     const { candidate, viewerId } = req.body;

//     const viewerData = viewers.get(viewerId);
//     if (!viewerData) {
//       return res.status(404).json({ error: "Viewer not found" });
//     }

//     if (candidate) {
//       await viewerData.peer.addIceCandidate(new RTCIceCandidate(candidate));
//       console.log(`🧊 Added ICE candidate for viewer ${viewerId}`);
//     }

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Error adding viewer ICE candidate:", error);
//     res.status(500).json({ error: "Failed to add ICE candidate" });
//   }
// });

// // Leave stream
// router.delete("/view/:viewerId", async (req: Request, res: Response) => {
//   const { viewerId } = req.params;
//   console.log(`👋 Viewer leaving: ${viewerId}`);

//   cleanupViewer(viewerId);
//   res.json({ success: true, message: "Left stream" });
// });

// // ========== INFO ENDPOINTS ==========

// // Get all active streams
// router.get("/streams", (req: Request, res: Response) => {
//   const streams = getActiveStreams();
//   res.json({ streams, total: streams.length });
// });

// // Get stream info
// router.get("/streams/:streamId", (req: Request, res: Response) => {
//   const { streamId } = req.params;
//   const broadcasterData = broadcasters.get(streamId);

//   if (!broadcasterData) {
//     return res.status(404).json({ error: "Stream not found" });
//   }

//   res.json({
//     streamId,
//     isLive: !!broadcasterData.stream,
//     viewerCount: broadcasterData.viewerCount,
//     startedAt: broadcasterData.startedAt,
//   });
// });

// // ========== CLEANUP FUNCTIONS ==========

// function cleanupBroadcaster(streamId: string) {
//   const broadcasterData = broadcasters.get(streamId);
//   if (!broadcasterData) return;

//   // Close broadcaster's peer connection
//   broadcasterData.peer.close();

//   // Disconnect all viewers watching this stream
//   const viewersToRemove: string[] = [];
//   viewers.forEach((viewerData, viewerId) => {
//     if (viewerData.streamId === streamId) {
//       viewerData.peer.close();
//       viewersToRemove.push(viewerId);
//     }
//   });

//   viewersToRemove.forEach(viewerId => viewers.delete(viewerId));

//   // Remove broadcaster
//   broadcasters.delete(streamId);

//   console.log(`🧹 Cleaned up stream ${streamId} and ${viewersToRemove.length} viewers`);
// }

// function cleanupViewer(viewerId: string) {
//   const viewerData = viewers.get(viewerId);
//   if (!viewerData) return;

//   // Decrement viewer count for the stream
//   const broadcasterData = broadcasters.get(viewerData.streamId);
//   if (broadcasterData) {
//     broadcasterData.viewerCount = Math.max(0, broadcasterData.viewerCount - 1);
//   }

//   // Close viewer's peer connection
//   viewerData.peer.close();

//   // Remove viewer
//   viewers.delete(viewerId);

//   console.log(`🧹 Cleaned up viewer ${viewerId}`);
// }

// // Periodic cleanup for stale connections
// setInterval(() => {
//   const now = Date.now();
//   const TIMEOUT = 5 * 60 * 1000; // 5 minutes

//   // Check broadcasters
//   broadcasters.forEach((data, streamId) => {
//     if (now - data.startedAt.getTime() > TIMEOUT && data.viewerCount === 0) {
//       console.log(`🧹 Auto-cleaning inactive stream: ${streamId}`);
//       cleanupBroadcaster(streamId);
//     }
//   });

//   // Check viewers
//   viewers.forEach((data, viewerId) => {
//     if (now - data.connectedAt.getTime() > TIMEOUT) {
//       console.log(`🧹 Auto-cleaning stale viewer: ${viewerId}`);
//       cleanupViewer(viewerId);
//     }
//   });
// }, 60000); // Run every minute

// export default router;

import { Router } from "express";
import createStreamRouter from "./create";
import getInitialDataRouter from "./getInitialData";
import { authenticateToken } from "../../middlewares/jwtAuth";
import db from "../../../db";
import { streams } from "../../../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.use("/create", authenticateToken, createStreamRouter);
router.use("/getInitialData", authenticateToken, getInitialDataRouter);

router.get("/", async (req, res) => {
  try {
    // const ActtiveStreams = await db
    //   .select()
    //   .from(streams)
    //   .where(eq(streams.status, "live"));

    const ActtiveStreams = await db.query.streams.findMany({
      where: eq(streams.status, "live"),
      with: { host: true },
    });

    res.json({
      streams: ActtiveStreams,
      message: "Fetched streams successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch streams" });
    console.error("Error fetching streams:", error);
    1;
  }
});

router.get("/userStreams", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.dbId;
    const userStreams = await db.query.streams.findMany({
      where: eq(streams.hostId, userId),
      with: { host: true },
    });

    res.json({
      streams: userStreams,
      message: "Fetched user streams successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user streams" });
    console.error("Error fetching user streams:", error);
  }
});

router.post(
  "/setStreamToStarted/:streamId",
  authenticateToken,
  async (req: any, res) => {
    try {
      const { streamId } = req.params;

      // check for stream
      const [stream] = await db
        .select()
        .from(streams)
        .where(eq(streams.id, streamId));

      if (!stream) {
        return res.status(404).json({ error: "Stream not found" });
      }

      // check if the user is the host
      if (stream.hostId !== req.user.dbId) {
        return res
          .status(403)
          .json({ error: "You are not authorized to start this stream" });
      }

      // update stream status to 'live'
      await db
        .update(streams)
        .set({ status: "live" })
        .where(eq(streams.id, streamId));

      res.json({ message: "Stream set to started successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to set stream to started" });
      console.error("Error setting stream to started:", error);
    }
  }
);

router.post(
  "/setStreamToEnded/:streamId",
  authenticateToken,
  async (req: any, res) => {
    try {
      const { streamId } = req.params;

      // check for stream
      const [stream] = await db
        .select()
        .from(streams)
        .where(eq(streams.id, streamId));

      if (!stream) {
        return res.status(404).json({ error: "Stream not found" });
      }

      // check if the user is the host
      if (stream.hostId !== req.user.dbId) {
        return res
          .status(403)
          .json({ error: "You are not authorized to start this stream" });
      }

      // update stream status to 'live'
      await db
        .update(streams)
        .set({ status: "ended" })
        .where(eq(streams.id, streamId));

      res.json({ message: "Stream set to ended successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to set stream to ended" });
      console.error("Error setting stream to ended:", error);
    }
  }
);

export default router;

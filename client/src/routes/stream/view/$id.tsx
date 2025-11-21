import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/stream/view/$id")({
  component: ViewerPage,
});

function ViewerPage() {
  const { id } = Route.useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected");
  const viewerIdRef = useRef<string>(Math.random().toString(36).substring(7));

  async function startViewing() {
    console.log("🎬 Starting to view stream:", id);
    setIsConnecting(true);

    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      // ICE candidate handler - CRITICAL for connection
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log("🧊 Local ICE candidate:", event.candidate.type);
          
          // Send ICE candidate to server
          try {
            await fetch(`http://localhost:5000/api/stream/view/${id}/ice`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                candidate: event.candidate,
                viewerId: viewerIdRef.current,
              }),
            });
          } catch (error) {
            console.error("❌ Error sending ICE candidate:", error);
          }
        } else {
          console.log("🧊 ICE gathering complete");
        }
      };

      // Track handler
      pc.ontrack = (event) => {
        console.log("✅ Received track:", event.track.kind);
        console.log("📺 Received streams:", event.streams.length);

        if (videoRef.current && event.streams[0]) {
          console.log("🎥 Setting video srcObject");
          videoRef.current.srcObject = event.streams[0];

          videoRef.current.play().catch((err) => {
            console.error("❌ Error playing video:", err);
          });
        }
      };

      // Connection state monitoring
      pc.onconnectionstatechange = () => {
        console.log("🔌 Connection state:", pc.connectionState);
        setConnectionState(pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log("🧊 ICE connection state:", pc.iceConnectionState);
      };

      pc.onicegatheringstatechange = () => {
        console.log("🔍 ICE gathering state:", pc.iceGatheringState);
      };

      // Request offer from server
      const offerRes = await fetch(`http://localhost:5000/api/stream/view/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewerId: viewerIdRef.current }),
      });

      if (!offerRes.ok) {
        throw new Error("Failed to get offer from server");
      }

      const offerData = await offerRes.json();
      console.log("📩 Received offer from server");

      // Set remote description (the offer from server)
      await pc.setRemoteDescription(new RTCSessionDescription(offerData.sdp));

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log("📤 Sending answer to server");

      // Send answer back to server
      await fetch(`http://localhost:5000/api/stream/view/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: answer,
          viewerId: viewerIdRef.current,
        }),
      });

      console.log("✅ Answer sent, waiting for ICE connection...");
    } catch (error) {
      console.error("❌ Error connecting to stream:", error);
      setConnectionState("failed");
    } finally {
      setIsConnecting(false);
    }
  }

  useEffect(() => {
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Viewing Stream: {id}</h1>
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={startViewing}
          disabled={isConnecting}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isConnecting ? "Connecting..." : "Join Stream"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm">Status:</span>
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${
              connectionState === "connected"
                ? "bg-green-100 text-green-800"
                : connectionState === "connecting"
                ? "bg-yellow-100 text-yellow-800"
                : connectionState === "failed"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {connectionState}
          </span>
        </div>
      </div>
      <div className="border border-gray-300 bg-black rounded">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          className="w-full max-w-4xl"
        />
      </div>
    </div>
  );
}

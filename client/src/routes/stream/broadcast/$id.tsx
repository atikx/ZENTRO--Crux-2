import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/stream/broadcast/$id")({
  component: StreamerPage,
});

function StreamerPage() {
  const { id } = Route.useParams();
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function startStreaming() {
    try {
      console.log("🎬 Starting broadcast for stream:", id);
      setIsStreaming(true);

      // Simplified for Brave compatibility - no displaySurface constraint
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      // Check what was actually shared
      const videoTrack = screen.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const sharedSurface = settings.displaySurface;
      
      console.log(`✅ Sharing: ${sharedSurface}`);
      console.log(`📐 Resolution: ${settings.width}x${settings.height}`);
      
      // Warn and offer retry if not sharing entire screen
      if (sharedSurface !== "monitor") {
        const retry = confirm(
          `⚠️ You selected a ${sharedSurface === "browser" ? "browser tab" : "window"} instead of entire screen.\n\n` +
          `For full screen streaming:\n` +
          `1. Click the "Entire Screen" tab at the TOP of the picker dialog\n` +
          `2. Then select your monitor from the thumbnails below\n` +
          `3. Click "Share"\n\n` +
          `Click OK to try again, or Cancel to continue with ${sharedSurface}.`
        );
        
        if (retry) {
          screen.getTracks().forEach(t => t.stop());
          setIsStreaming(false);
          setTimeout(() => startStreaming(), 100);
          return;
        }
      }

      // Get webcam
      const webcam = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: true,
      });

      // Merge screen + webcam tracks
      const finalStream = new MediaStream([
        ...screen.getVideoTracks(),
        ...webcam.getVideoTracks(),
        ...screen.getAudioTracks(),
        ...webcam.getAudioTracks(),
      ]);

      streamRef.current = finalStream;

      // Local preview
      const video = document.getElementById("preview") as HTMLVideoElement;
      if (video) {
        video.srcObject = finalStream;
        await video.play();
      }

      // Create PeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log("🧊 Broadcaster ICE candidate:", event.candidate.type);
          try {
            await fetch(`http://localhost:5000/api/stream/broadcast/${id}/ice`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ candidate: event.candidate }),
            });
          } catch (error) {
            console.error("❌ Error sending ICE candidate:", error);
          }
        }
      };

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log("🔌 Connection state:", pc.connectionState);
        setConnectionState(pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log("🧊 ICE connection state:", pc.iceConnectionState);
      };

      // Handle stream end
      screen.getVideoTracks()[0].onended = () => {
        console.log("📺 Screen sharing stopped by user");
        stopStreaming();
      };

      // Add tracks
      finalStream.getTracks().forEach((track) => {
        console.log(`➕ Adding track: ${track.kind}`);
        pc.addTrack(track, finalStream);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send to server
      const res = await fetch(`http://localhost:5000/api/stream/broadcast/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdp: offer }),
      });

      if (!res.ok) throw new Error("Failed to connect to server");

      const data = await res.json();
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

      console.log("✅ Streaming started!");
    } catch (error) {
      console.error("❌ Error starting stream:", error);
      setIsStreaming(false);
      setConnectionState("failed");

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          alert("Permission denied. Please allow screen sharing and camera access.");
        } else if (error.name === "NotFoundError") {
          alert("No camera or screen available.");
        } else {
          alert(`Error: ${error.message}`);
        }
      }
    }
  }

  function stopStreaming() {
    console.log("🛑 Stopping broadcast");

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    const video = document.getElementById("preview") as HTMLVideoElement;
    if (video) video.srcObject = null;

    setIsStreaming(false);
    setConnectionState("disconnected");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Broadcasting Stream</h1>
        <p className="text-gray-600">Stream ID: <span className="font-mono">{id}</span></p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        {!isStreaming ? (
          <button
            onClick={startStreaming}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🎥 Start Stream
          </button>
        ) : (
          <button
            onClick={stopStreaming}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🛑 Stop Stream
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              connectionState === "connected"
                ? "bg-green-100 text-green-800"
                : connectionState === "connecting"
                ? "bg-yellow-100 text-yellow-800"
                : connectionState === "failed"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {isStreaming ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-current animate-pulse mr-2" />
                {connectionState}
              </>
            ) : (
              "offline"
            )}
          </span>
        </div>
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-black">
        <video
          id="preview"
          className="w-full"
          autoPlay
          muted
          playsInline
        />
        {!isStreaming && (
          <div className="aspect-video flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg">Stream preview will appear here</p>
              <p className="text-sm mt-2">Click "Start Stream" to begin broadcasting</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2 text-lg">
          <span className="text-2xl">⚠️</span>
          IMPORTANT: How to Select Entire Screen (Brave Browser)
        </h3>
        <div className="text-sm text-yellow-900 space-y-3">
          <p className="font-semibold">When the screen picker appears:</p>
          <ol className="list-decimal ml-5 space-y-2 bg-yellow-100 p-3 rounded">
            <li><strong>Look at the THREE TABS at the TOP</strong> of the picker window</li>
            <li><strong>Click the "Entire Screen"</strong> (or "Your Entire Screen") tab</li>
            <li>Select your monitor from the thumbnails below</li>
            <li>Click the "Share" button</li>
          </ol>
          <div className="bg-red-50 border border-red-200 p-2 rounded mt-2">
            <p className="text-xs text-red-800">
              <strong>Brave Browser Issue:</strong> If Brave keeps selecting the browser tab automatically, 
              try using <strong>Chrome or Edge</strong> instead. This is a known Brave bug.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Viewer URL: <code className="bg-blue-100 px-1 rounded">/stream/view/{id}</code></li>
          <li>• Both screen and webcam will be captured</li>
          <li>• Connection status will show above</li>
        </ul>
      </div>
    </div>
  );
}

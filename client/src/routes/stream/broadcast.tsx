// Streamer.tsx
import { useRef, useState } from "react";

export default function Streamer({ streamId }: { streamId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  async function startStreaming() {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // 1. Capture local stream
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = localStream;
    }

    // Add tracks to peer connection
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    // 2. Create OFFER
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // 3. Send OFFER to backend
    const res = await fetch(
      `http://localhost:5000/api/stream/broadcast/${streamId}`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdp: offer }),
      }
    );

    const data = await res.json();

    // 4. Set backend ANSWER
    await pc.setRemoteDescription(data.sdp);

    setIsStreaming(true);
  }

  return (
    <div>
      <h2>Streamer</h2>

      <video ref={videoRef} muted autoPlay playsInline className="w-96" />

      {!isStreaming && (
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={startStreaming}
        >
          Start Stream
        </button>
      )}
    </div>
  );
}

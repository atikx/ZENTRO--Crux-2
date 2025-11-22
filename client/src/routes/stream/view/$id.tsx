import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Circle, Wifi, WifiOff, AlertCircle, CheckCircle2, Loader2, Eye, Monitor, Radio, Maximize2, Volume2 } from "lucide-react";

export const Route = createFileRoute("/stream/view/$id")({
  component: ViewerPage,
});

function ViewerPage() {
  const { id } = Route.useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [isWatching, setIsWatching] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
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

      // ICE candidate handler
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log("🧊 Local ICE candidate:", event.candidate.type);
          
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
          setIsWatching(true);

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

      // Set viewer count if available
      if (offerData.streamInfo?.viewerCount) {
        setViewerCount(offerData.streamInfo.viewerCount);
      }

      // Set remote description
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
    // Auto-join stream on mount
    startViewing();

    return () => {
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, []);

  const getStatusConfig = () => {
    switch (connectionState) {
      case "connected":
        return { icon: CheckCircle2, color: "from-green-500 to-emerald-600", bg: "bg-green-50", border: "border-green-200", text: "text-green-700", label: "Connected", pulse: true };
      case "connecting":
        return { icon: Loader2, color: "from-yellow-500 to-orange-500", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", label: "Connecting", pulse: false };
      case "failed":
        return { icon: AlertCircle, color: "from-red-500 to-rose-600", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "Failed", pulse: false };
      default:
        return { icon: Circle, color: "from-gray-400 to-gray-500", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", label: "Disconnected", pulse: false };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Same animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />

      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-pink-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-soft-light pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 backdrop-blur-xl bg-white/70 border-2 border-gray-200/60 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-2xl blur-lg opacity-30" />
                  <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/90 to-purple-600/90 border border-white/20 rounded-2xl p-3 shadow-lg">
                    <Play className="h-7 w-7 text-white fill-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent tracking-tight">
                    Live Stream
                  </h1>
                  <p className="text-gray-600 text-sm font-mono flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Stream ID: <span className="text-gray-900 font-semibold">{id}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Status cards */}
            <div className="flex items-center gap-3">
              {/* Live indicator */}
              {connectionState === "connected" && (
                <div className="backdrop-blur-xl bg-red-50 border-2 border-red-200 rounded-2xl px-5 py-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-md animate-pulse" />
                      <Radio className="h-5 w-5 text-red-600 relative" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Status</p>
                      <p className="text-red-600 text-xl font-bold flex items-center gap-2">
                        Live
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Viewer count */}
              <div className="backdrop-blur-xl bg-white/70 border-2 border-gray-200/60 rounded-2xl px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-md" />
                    <Eye className="h-5 w-5 text-primary relative" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Viewers</p>
                    <p className="text-gray-900 text-2xl font-bold">{viewerCount}</p>
                  </div>
                </div>
              </div>

              {/* Connection status */}
              <div className={`backdrop-blur-xl ${status.bg} border-2 ${status.border} rounded-2xl px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {status.pulse && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${status.color} rounded-full blur-md animate-pulse`} />
                    )}
                    <StatusIcon className={`h-5 w-5 ${status.text} relative ${connectionState === 'connecting' ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Connection</p>
                    <p className={`${status.text} text-xl font-bold flex items-center gap-2`}>
                      {status.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main video player */}
        <div className="space-y-6">
          {/* Video container */}
          <div className="group relative backdrop-blur-xl bg-white/70 border-2 border-gray-200/60 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl hover:border-primary/40 transition-all duration-500">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                controls
                className="w-full aspect-video object-cover bg-gradient-to-br from-gray-900 to-black"
              />
              
              {/* Loading overlay */}
              {!isWatching && connectionState !== "failed" && (
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-gradient-to-br from-gray-50/90 to-gray-100/90">
                  <div className="text-center space-y-6 p-8">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                      <div className="relative backdrop-blur-xl bg-white/90 border-2 border-gray-200/60 rounded-full p-8 shadow-2xl">
                        <Loader2 className="h-20 w-20 text-primary animate-spin" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {isConnecting ? "Connecting to Stream..." : "Loading..."}
                      </h3>
                      <p className="text-gray-600">
                        Please wait while we connect you to the broadcast
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {connectionState === "failed" && (
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-gradient-to-br from-red-50/90 to-red-100/90">
                  <div className="text-center space-y-6 p-8">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-30" />
                      <div className="relative backdrop-blur-xl bg-white/90 border-2 border-red-200/60 rounded-full p-8 shadow-2xl">
                        <WifiOff className="h-20 w-20 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Connection Failed
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Unable to connect to the stream. Please try again.
                      </p>
                      <button
                        onClick={startViewing}
                        className="backdrop-blur-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        Retry Connection
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Live badge overlay */}
              {isWatching && connectionState === "connected" && (
                <div className="absolute top-6 left-6 z-10">
                  <div className="flex items-center gap-3 backdrop-blur-xl bg-red-500 border-2 border-red-400/50 rounded-full px-5 py-2.5 shadow-2xl">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white rounded-full blur-md animate-pulse" />
                      <div className="relative w-3 h-3 bg-white rounded-full" />
                    </div>
                    <span className="text-white font-bold text-sm uppercase tracking-wider">
                      Live
                    </span>
                  </div>
                </div>
              )}

              {/* Fullscreen button */}
              {isWatching && (
                <button
                  onClick={toggleFullscreen}
                  className="absolute top-6 right-6 z-10 backdrop-blur-xl bg-black/40 hover:bg-black/60 border border-white/20 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <Maximize2 className="h-5 w-5 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Stream info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Wifi className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Quality</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">1080p HD</p>
              <p className="text-sm text-gray-600">30 FPS</p>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Volume2 className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-gray-900">Audio</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">Stereo</p>
              <p className="text-sm text-gray-600">High Quality</p>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-pink-50 to-pink-100/50 border-2 border-pink-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Radio className="h-5 w-5 text-pink-600" />
                <h3 className="font-bold text-gray-900">Protocol</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">WebRTC</p>
              <p className="text-sm text-gray-600">Low Latency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

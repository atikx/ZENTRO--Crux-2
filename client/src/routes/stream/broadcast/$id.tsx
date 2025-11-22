import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Radio, Circle, Wifi, WifiOff, AlertCircle, CheckCircle2, Loader2, Video, Monitor, Eye } from "lucide-react";

export const Route = createFileRoute("/stream/broadcast/$id")({
  component: StreamerPage,
});

function StreamerPage() {
  const { id } = Route.useParams();
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [viewerCount, setViewerCount] = useState(0);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function startStreaming() {
    try {
      console.log("🎬 Starting broadcast for stream:", id);
      setIsStreaming(true);

      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      const videoTrack = screen.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const sharedSurface = settings.displaySurface;
      
      console.log(`✅ Sharing: ${sharedSurface}`);
      console.log(`📐 Resolution: ${settings.width}x${settings.height}`);
      
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

      const webcam = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: true,
      });

      const finalStream = new MediaStream([
        ...screen.getVideoTracks(),
        ...webcam.getVideoTracks(),
        ...screen.getAudioTracks(),
        ...webcam.getAudioTracks(),
      ]);

      streamRef.current = finalStream;

      const video = document.getElementById("preview") as HTMLVideoElement;
      if (video) {
        video.srcObject = finalStream;
        await video.play();
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

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

      pc.onconnectionstatechange = () => {
        console.log("🔌 Connection state:", pc.connectionState);
        setConnectionState(pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log("🧊 ICE connection state:", pc.iceConnectionState);
      };

      screen.getVideoTracks()[0].onended = () => {
        console.log("📺 Screen sharing stopped by user");
        stopStreaming();
      };

      finalStream.getTracks().forEach((track) => {
        console.log(`➕ Adding track: ${track.kind}`);
        pc.addTrack(track, finalStream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

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

  const getStatusConfig = () => {
    switch (connectionState) {
      case "connected":
        return { icon: CheckCircle2, color: "from-green-500 to-emerald-600", bg: "bg-green-50", border: "border-green-200", text: "text-green-700", label: "Live", pulse: true };
      case "connecting":
        return { icon: Loader2, color: "from-yellow-500 to-orange-500", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", label: "Connecting", pulse: false };
      case "failed":
        return { icon: AlertCircle, color: "from-red-500 to-rose-600", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "Failed", pulse: false };
      default:
        return { icon: Circle, color: "from-gray-400 to-gray-500", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", label: "Offline", pulse: false };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Same animated gradient background as homepage */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />

      {/* Ambient orbs - matching homepage */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-pink-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-soft-light pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with glassmorphism */}
        <div className="mb-8 backdrop-blur-xl bg-white/70 border-2 border-gray-200/60 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-2xl blur-lg opacity-30" />
                  <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/90 to-purple-600/90 border border-white/20 rounded-2xl p-3 shadow-lg">
                    <Radio className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent tracking-tight">
                    Broadcast Studio
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

              {/* Status indicator */}
              <div className={`backdrop-blur-xl ${status.bg} border-2 ${status.border} rounded-2xl px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {status.pulse && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${status.color} rounded-full blur-md animate-pulse`} />
                    )}
                    <StatusIcon className={`h-5 w-5 ${status.text} relative ${connectionState === 'connecting' ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Status</p>
                    <p className={`${status.text} text-xl font-bold flex items-center gap-2`}>
                      {status.label}
                      {status.pulse && <span className="w-2 h-2 rounded-full bg-current animate-pulse" />}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video preview - takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video container */}
            <div className="group relative backdrop-blur-xl bg-white/70 border-2 border-gray-200/60 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl hover:border-primary/40 transition-all duration-500">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              
              <div className="relative">
                <video
                  id="preview"
                  className="w-full aspect-video object-cover bg-gradient-to-br from-gray-100 to-gray-200"
                  autoPlay
                  muted
                  playsInline
                />
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-gradient-to-br from-gray-50/90 to-gray-100/90">
                    <div className="text-center space-y-6 p-8">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                        <div className="relative backdrop-blur-xl bg-white/90 border-2 border-gray-200/60 rounded-full p-8 shadow-2xl">
                          <Video className="h-20 w-20 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Ready to Go Live?
                        </h3>
                        <p className="text-gray-600 max-w-md">
                          Click the start button to begin broadcasting to your audience
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live indicator overlay */}
                {isStreaming && connectionState === "connected" && (
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
              </div>
            </div>

            {/* Stream info */}
            <div className="backdrop-blur-xl bg-white/70 border-2 border-gray-200/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                Stream Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border-2 border-blue-200/60 hover:scale-105 transition-transform duration-300">
                  <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Resolution</p>
                  <p className="text-gray-900 text-lg font-bold">1920x1080</p>
                </div>
                <div className="backdrop-blur-xl bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border-2 border-purple-200/60 hover:scale-105 transition-transform duration-300">
                  <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Frame Rate</p>
                  <p className="text-gray-900 text-lg font-bold">30 FPS</p>
                </div>
                <div className="backdrop-blur-xl bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl p-4 border-2 border-pink-200/60 hover:scale-105 transition-transform duration-300">
                  <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Codec</p>
                  <p className="text-gray-900 text-lg font-bold">VP8</p>
                </div>
                <div className="backdrop-blur-xl bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-4 border-2 border-green-200/60 hover:scale-105 transition-transform duration-300">
                  <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Protocol</p>
                  <p className="text-gray-900 text-lg font-bold">WebRTC</p>
                </div>
              </div>
            </div>
          </div>

          {/* Control panel */}
          <div className="space-y-6">
            {/* Primary action */}
            <div className="backdrop-blur-xl bg-white/70 border-2 border-gray-200/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-gray-900 font-bold text-lg mb-4">Broadcast Control</h3>
              {!isStreaming ? (
                <button
                  onClick={startStreaming}
                  className="group w-full relative overflow-hidden backdrop-blur-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-2 border-primary/20 rounded-2xl px-6 py-5 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center gap-3">
                    <Radio className="h-6 w-6 text-white" />
                    <span className="text-white font-bold text-lg">Start Broadcast</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={stopStreaming}
                  className="group w-full relative overflow-hidden backdrop-blur-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-2 border-red-400/20 rounded-2xl px-6 py-5 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center gap-3">
                    <WifiOff className="h-6 w-6 text-white" />
                    <span className="text-white font-bold text-lg">End Broadcast</span>
                  </div>
                </button>
              )}
            </div>

            {/* Instructions */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-50 to-orange-50/50 border-2 border-yellow-200/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-gray-900 font-bold text-lg mb-2">Important</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    When prompted, select <span className="font-bold text-yellow-700">"Entire Screen"</span> for full screen broadcasting
                  </p>
                </div>
              </div>
              <ol className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">1.</span>
                  <span>Click the <span className="text-gray-900 font-semibold">"Entire Screen"</span> tab</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">2.</span>
                  <span>Select your monitor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">3.</span>
                  <span>Click <span className="text-gray-900 font-semibold">"Share"</span></span>
                </li>
              </ol>
            </div>

            {/* Quick tips */}
            <div className="backdrop-blur-xl bg-white/70 border-2 border-gray-200/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-gray-900 font-bold text-lg mb-4">Quick Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-gray-600 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p>Stable internet connection recommended</p>
                </div>
                <div className="flex items-start gap-3 text-gray-600 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p>Close unnecessary applications</p>
                </div>
                <div className="flex items-start gap-3 text-gray-600 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p>Check your audio levels before going live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSocket, SocketProvider } from '@/context/SocketProvider'
import PeerService from '@/services/PeerService'
import api from '@/configs/axiosinstance'
import { toast } from 'sonner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Radio, StopCircle, Users, Clock, MonitorPlay } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const Route = createFileRoute('/stream/broadcast/$id')({
  component: () => (
    <SocketProvider>
      <Broadcaster />
    </SocketProvider>
  ),
})

type StreamData = {
  id: string
  title: string
  description: string
  hostId: string
  status: string
  thumbnail?: string
}

export default function Broadcaster() {
  const socket = useSocket()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { id: roomId } = Route.useParams()
  const navigate = useNavigate()
  const [streamData, setStreamData] = useState<StreamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [streamDuration, setStreamDuration] = useState(0)
  const [viewerCount, setViewerCount] = useState(0)
  const [isStarting, setIsStarting] = useState(false)
  const startTimeRef = useRef<number | null>(null)

  const getInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get(`/stream/getInitialData/${roomId}`)
      const data = response.data as { stream: StreamData }
      setStreamData(data.stream)
      return true
    } catch (error: any) {
      console.error('Error fetching initial data:', error)

      const status = error?.response?.status ?? error?.status

      if (status === 404) {
        toast.error('Stream not found, please create stream first')
        navigate({ to: '/stream/create' })
      } else if (status === 400) {
        toast.error('Stream already started or ended')
        navigate({ to: '/profile' })
      } else {
        toast.error('Failed to fetch initial stream data')
        navigate({ to: '/' })
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [roomId, navigate])

  const setStreamToStarted = async () => {
    try {
      const res = await api.post(`/stream/setStreamToStarted/${roomId}`)
      console.log('Stream set to started:', res.data)
      setIsLive(true)
      startTimeRef.current = Date.now()
      toast.success('Stream is now live!')
    } catch (error) {
      console.log('Error starting stream', error)
      toast.error('Failed to set stream as live')
    }
  }

  const setStreamToEnded = async () => {
    try {
      const res = await api.post(`/stream/setStreamToEnded/${roomId}`)
      console.log('Stream set to ended:', res.data)
      toast.success('Stream ended successfully')

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      navigate({ to: '/profile' })
    } catch (error) {
      console.log('Error ending stream', error)
      toast.error('Failed to end stream')
    }
  }

  const handleEndStream = () => {
    setShowEndDialog(true)
  }

  const confirmEndStream = () => {
    setShowEndDialog(false)
    setStreamToEnded()
  }

  const startBroadcast = async () => {
    if (!socket || !roomId || !streamData) return

    setIsStarting(true)
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })

      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream

      // Set stream to started only after user shares screen
      await setStreamToStarted()

      socket.emit('broadcaster-join', roomId)

      // Listen for viewer count updates
      socket.on('viewer-count', (count: number) => {
        setViewerCount(count)
      })

      socket.on('viewer-request-offer', async (viewerId) => {
        console.log('Viewer wants offer:', viewerId)

        const peer = PeerService.createPeer()

        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream)
        })

        peer.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit('ice', {
              to: viewerId,
              candidate: e.candidate,
            })
          }
        }

        const offer = await PeerService.createOffer(peer)

        socket.emit('send-offer', {
          to: viewerId,
          offer,
        })

        socket.on('send-answer', ({ answer }) => {
          peer.setRemoteDescription(answer)
        })

        socket.on('ice', ({ candidate }) => {
          peer.addIceCandidate(candidate)
        })
      })

      // Handle when user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        toast.info('Screen sharing stopped')
        setStreamToEnded()
      }
    } catch (err: any) {
      console.error(err)
      if (err.name === 'NotAllowedError') {
        toast.error('Screen share permission denied')
      } else {
        toast.error('Failed to start screen share')
      }
    } finally {
      setIsStarting(false)
    }
  }

  // Update stream duration
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setStreamDuration(
          Math.floor((Date.now() - startTimeRef.current) / 1000),
        )
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLive])

  useEffect(() => {
    getInitialData()
  }, [getInitialData])

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-sm">Loading stream details...</div>
      </div>
    )
  }

  if (!streamData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-500">Stream not available</CardTitle>
            <CardDescription>
              Unable to load this stream. Please try again or create a new
              stream.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end">
            <Button
              onClick={() => navigate({ to: '/stream/create' })}
              variant="outline"
            >
              Go to create stream
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Live Badge */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {streamData.title}
            </h1>
            {isLive && (
              <Badge className="bg-red-500 text-white border-0 shadow-lg animate-pulse">
                <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5" />
                LIVE
              </Badge>
            )}
          </div>
          <Button
            onClick={handleEndStream}
            variant="destructive"
            size="lg"
            className="shadow-lg"
            disabled={!isLive}
          >
            <StopCircle className="h-5 w-5 mr-2" />
            End Stream
          </Button>
        </div>

        {/* Stats Bar */}
        {isLive && (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="py-4">
              <div className="flex items-center justify-around gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Duration</p>
                    <p className="text-lg font-bold text-slate-900 font-mono">
                      {formatDuration(streamDuration)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Viewers</p>
                    <p className="text-lg font-bold text-slate-900">
                      {viewerCount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-50">
                    <Radio className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="text-lg font-bold text-green-600">
                      Broadcasting
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-6 items-start">
          {/* Video area */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">
                Broadcast preview
              </CardTitle>
              <CardDescription>
                This is what your viewers will see from your screen share.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                {!isLive ? (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className="p-6 rounded-full bg-primary/10">
                      <MonitorPlay className="h-16 w-16 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Ready to go live?
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Click the button below to start sharing your screen
                      </p>
                      <Button
                        onClick={startBroadcast}
                        disabled={isStarting}
                        size="lg"
                        className="shadow-lg"
                      >
                        <Radio className="h-5 w-5 mr-2" />
                        {isStarting ? 'Starting...' : 'Start Broadcasting'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain bg-black"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stream details card */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">
                Stream details
              </CardTitle>
              <CardDescription>
                Overview of your stream configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Thumbnail */}
              {streamData.thumbnail && (
                <div className="rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={streamData.thumbnail}
                    alt={streamData.title}
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}

              {/* Meta data */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Title</span>
                  <span className="font-medium text-right text-slate-900">
                    {streamData.title}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500">Description</span>
                  <p className="text-slate-800 text-sm leading-relaxed bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                    {streamData.description || 'No description provided.'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Stream ID</span>
                  <span className="font-mono text-xs bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-800">
                    {streamData.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  <Badge
                    variant="outline"
                    className={
                      isLive
                        ? 'border-green-400 text-green-600 bg-green-50'
                        : 'border-amber-400 text-amber-600 bg-amber-50'
                    }
                  >
                    {isLive ? 'Live' : streamData.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-slate-500">
                Share the stream link with your audience to let them watch.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* End Stream Confirmation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>End stream?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop your broadcast and end the stream for all viewers.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEndStream}
              className="bg-red-500 hover:bg-red-600"
            >
              End Stream
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

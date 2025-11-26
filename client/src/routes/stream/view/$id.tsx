import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { SocketProvider, useSocket } from '@/context/SocketProvider'
import PeerService from '@/services/PeerService'

export const Route = createFileRoute('/stream/view/$id')({
  component: () => (
    <SocketProvider>
      <Viewer />
    </SocketProvider>
  ),
})

export default function Viewer() {
  const socket = useSocket()
  const videoRef = useRef<HTMLVideoElement>(null)
  const { id: roomId } = Route.useParams()

  useEffect(() => {
    socket.emit('viewer-join', roomId)

    const peer = PeerService.createPeer()

    peer.ontrack = (e) => {
      console.log('Track received', e.streams)
      if (videoRef.current) {
        videoRef.current.srcObject = e.streams[0]

        // 🔥 Force play to bypass autoplay restrictions
        videoRef.current.muted = false
        videoRef.current.play().catch((err) => {
          console.warn('Video play failed:', err)
        })
      }
    }

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice', {
          roomId,
          candidate: e.candidate,
        })
      }
    }

    socket.on('offer', async ({ offer }) => {
      console.log('Received offer')

      await peer.setRemoteDescription(offer)
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)

      socket.emit('answer', { answer, roomId })
    })

    socket.on('ice', async ({ candidate }) => {
      await peer.addIceCandidate(candidate)
    })
  }, [])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-[400px] bg-black"
      controls
    />
  )
}

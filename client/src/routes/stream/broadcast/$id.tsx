import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSocket, SocketProvider } from '@/context/SocketProvider'
import PeerService from '@/services/PeerService'

export const Route = createFileRoute('/stream/broadcast/$id')({
  component: () => (
    <SocketProvider>
      <Broadcaster />
    </SocketProvider>
  ),
})

export default function Broadcaster() {
  const socket = useSocket()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { id: roomId } = Route.useParams()

  useEffect(() => {
    const startBroadcast = async () => {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })

      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream

      socket.emit('broadcaster-join', roomId)

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
    }

    startBroadcast()
  }, [])

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted className="w-96 h-96" />
    </div>
  )
}

// routes/profile/$username.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import {
  Mail,
  User,
  Video,
  Upload,
  X,
  Camera,
  ZoomIn,
  RotateCw,
  Play,
  Radio,
} from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import { useAuthStore } from '@/lib/store'
import api from '@/configs/axiosinstance'
import { toast } from 'sonner'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

interface Host {
  id: string
  name: string
  email: string
  username: string
  avatar: string | null
}

interface Stream {
  id: string
  title: string
  description: string
  hostId: string
  status: string
  thumbnail?: string
  host: Host
}

// Helper function to create cropped image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5,
  )

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
    0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y,
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
    }, 'image/png')
  })
}

function ProfilePage() {
  const initialUser = useAuthStore.getState().user
  const [currentUser, setCurrentUser] = useState(initialUser)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)

  const getUsersStreams = async () => {
    try {
      setLoading(true)
      const res = await api.get('/stream/userStreams')
      console.log('Fetched user streams:', res.data)
      setStreams(res.data.streams || [])
    } catch (error) {
      console.error('Error fetching user streams:', error)
      setStreams([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUsersStreams()
  }, [])

  const totalStreams = streams.length
  const liveStreams = streams.filter((stream) => stream.status === 'live').length

  // Handle image drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: false,
    maxSize: 5242880, // 5MB
  })

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    [],
  )

  const handleSaveAvatar = async () => {
    if (!selectedImage || !croppedAreaPixels) return

    try {
      const croppedBlob = await getCroppedImg(
        selectedImage,
        croppedAreaPixels,
        rotation,
      )

      // Create FormData for upload
      const formData = new FormData()
      formData.append('image', croppedBlob, 'avatar.png')

      // Create preview URL for immediate UI update
      const previewUrl = URL.createObjectURL(croppedBlob)
      setCurrentUser({ ...currentUser, avatar: previewUrl })

      // Reset and close dialog
      setIsAvatarDialogOpen(false)
      setSelectedImage(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
      setCroppedAreaPixels(null)

      // API call
      const res = await api.post('/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Avatar updated successfully!')
      setCurrentUser({ ...currentUser, avatar: res.data.avatarUrl })

      URL.revokeObjectURL(previewUrl)
    } catch (error: any) {
      console.error('Error uploading avatar:', error)

      setCurrentUser((prev) => ({ ...prev }))

      if (error.response) {
        toast.error(error.response.data.message || 'Failed to upload avatar')
      } else if (error.request) {
        toast.error('Network error. Please check your connection.')
      } else {
        toast.error('Failed to process image. Please try again.')
      }
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <Badge className="bg-red-500 text-white border-0 animate-pulse">
            <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5" />
            LIVE
          </Badge>
        )
      case 'ended':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700">
            Ended
          </Badge>
        )
      case 'justCreated':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
            Created
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-gradient-shift" />

      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float-delayed" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <main className="container mx-auto px-4 py-12 relative z-10 max-w-6xl">
        {/* Profile Header Card */}
        <Card className="border-0 backdrop-blur-xl bg-white/80 shadow-2xl mb-8 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative group">
                  <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-white shadow-xl">
                    <AvatarImage
                      src={currentUser?.avatar}
                      alt={currentUser?.name}
                    />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-purple-600 text-white">
                      {currentUser?.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setIsAvatarDialogOpen(true)}
                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xl bg-white/90 border border-gray-200 shadow-lg hover:scale-110"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {currentUser?.name}
                  </h1>
                  <div className="flex flex-col gap-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">@{currentUser?.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{currentUser?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <Video className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Streams</p>
                      <p className="text-xl font-bold text-gray-900">
                        {totalStreams}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-50">
                      <Radio className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Live Now</p>
                      <p className="text-xl font-bold text-gray-900">
                        {liveStreams}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avatar Upload Dialog */}
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogContent className="sm:max-w-[650px] backdrop-blur-xl bg-white/95">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Update Profile Picture
              </DialogTitle>
              <DialogDescription>
                Upload a new avatar. Drag and drop or click to browse.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {!selectedImage ? (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                    transition-all duration-300 hover:border-primary hover:bg-primary/5
                    ${isDragActive ? 'border-primary bg-primary/10 scale-105' : 'border-gray-300'}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {isDragActive ? (
                        <Upload className="h-8 w-8 text-primary animate-bounce" />
                      ) : (
                        <Camera className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-1">
                        {isDragActive
                          ? 'Drop your image here'
                          : 'Drag & drop your image here'}
                      </p>
                      <p className="text-sm text-gray-600">
                        or click to browse files
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Supports: JPG, PNG, GIF, WebP (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cropper Container */}
                  <div
                    className="relative bg-gray-900 rounded-xl overflow-hidden"
                    style={{ height: '400px' }}
                  >
                    <Cropper
                      image={selectedImage}
                      crop={crop}
                      zoom={zoom}
                      rotation={rotation}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onRotationChange={setRotation}
                      onCropComplete={onCropComplete}
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-lg z-10 backdrop-blur-xl bg-white/90"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Controls */}
                  <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <ZoomIn className="h-4 w-4" />
                          Zoom
                        </label>
                        <span className="text-sm text-gray-600">
                          {zoom.toFixed(1)}x
                        </span>
                      </div>
                      <Slider
                        value={[zoom]}
                        onValueChange={(value) => setZoom(value[0])}
                        min={1}
                        max={3}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <RotateCw className="h-4 w-4" />
                          Rotate
                        </label>
                        <span className="text-sm text-gray-600">
                          {rotation}°
                        </span>
                      </div>
                      <Slider
                        value={[rotation]}
                        onValueChange={(value) => setRotation(value[0])}
                        min={0}
                        max={360}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <input {...getInputProps()} />
                    <p className="text-sm text-gray-600">
                      <Upload className="h-4 w-4 inline mr-1" />
                      Click or drag to upload a different image
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAvatarDialogOpen(false)
                  handleRemoveImage()
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAvatar}
                disabled={!selectedImage}
                className="shadow-lg"
              >
                Save Avatar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Streaming History Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" />
              My Streams
            </h2>
            <Badge variant="outline" className="text-gray-600">
              {totalStreams} {totalStreams === 1 ? 'stream' : 'streams'}
            </Badge>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-6 text-gray-600 font-medium">Loading streams...</p>
            </div>
          ) : streams.length === 0 ? (
            <Card className="border-0 backdrop-blur-xl bg-white/70 shadow-lg">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No streams yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your first stream to see it here
                </p>
                <Link to="/stream/create">
                  <Button className="shadow-lg">
                    <Radio className="h-4 w-4 mr-2" />
                    Create Stream
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {streams.map((stream) => (
                <Card
                  key={stream.id}
                  className="group cursor-pointer overflow-hidden border-0 backdrop-blur-xl bg-white/70 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row gap-0">
                      {/* Thumbnail */}
                      <div className="relative sm:w-80 aspect-video sm:aspect-auto overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10">
                        {stream.thumbnail ? (
                          <img
                            src={stream.thumbnail.replace(/"/g, '')}
                            alt={stream.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Radio className="h-16 w-16 text-gray-300" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          {getStatusBadge(stream.status)}
                        </div>

                        {/* Play overlay on hover */}
                        {stream.status === 'live' && (
                          <Link to="/stream/view/$id" params={{ id: stream.id }}>
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white rounded-full p-4 transform scale-100 group-hover:scale-110 transition-transform duration-300">
                                <Play className="h-8 w-8 text-primary fill-primary" />
                              </div>
                            </div>
                          </Link>
                        )}
                      </div>

                      {/* Stream Info */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div className="space-y-3">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                            {stream.title}
                          </h3>

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {stream.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {stream.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-4">
                          {stream.status === 'live' && (
                            <Link to="/stream/view/$id" params={{ id: stream.id }}>
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                              >
                                <Play className="h-3.5 w-3.5 mr-1.5" />
                                Watch
                              </Button>
                            </Link>
                          )}
                          {stream.status === 'justCreated' && (
                            <Link to="/stream/broadcast/$id" params={{ id: stream.id }}>
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                              >
                                <Radio className="h-3.5 w-3.5 mr-1.5" />
                                Start
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-40px) translateX(-20px);
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

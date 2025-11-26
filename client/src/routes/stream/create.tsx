import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Upload, X, Image as ImageIcon } from 'lucide-react'
import { authGuard } from '@/lib/authGuard'
import api from '@/configs/axiosinstance'
import { toast } from 'sonner'

export const Route = createFileRoute('/stream/create')({
  beforeLoad: () => {
    authGuard()
  },
  component: RouteComponent,
})

const formSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  thumbnail: z.any().refine((file) => file !== null, 'Thumbnail is required'),
})

function RouteComponent() {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)



  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail: null,
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        setThumbnailFile(file)
        const url = URL.createObjectURL(file)
        setThumbnailPreview(url)
        form.setValue('thumbnail', file)
        form.clearErrors('thumbnail')
      }
    },
    [form],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    multiple: false,
  })

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
    form.setValue('thumbnail', null)
  }
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('image', thumbnailFile)

      const res = await api.post('/stream/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.success('Stream created successfully!')
      navigate({ to: `/stream/broadcast/${res.data.stream.id}` })
    } catch (error) {
      console.error('Error creating stream:', error)
      toast.error('Failed to create stream. Please try again.')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background - pink theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-50 animate-gradient-shift" />

      {/* Ambient orbs - pink theme */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-fuchsia-400/8 rounded-full blur-3xl animate-float-slow" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-soft-light pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 backdrop-blur-sm shadow-sm mb-4">
            <Sparkles className="h-4 w-4 text-pink-600" />
            <span className="text-sm font-semibold text-gray-700">
              Start Broadcasting
            </span>
          </div>
          <h2 className="text-6xl font-black mb-3 bg-gradient-to-r from-gray-900 via-pink-600 to-rose-600 bg-clip-text text-transparent leading-tight">
            Create Stream
          </h2>
          <p className="text-gray-600 text-lg flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-lg shadow-pink-500/50" />
            Set up your stream details and go live
          </p>
        </div>

        {/* Form Card */}
        <Card className="group cursor-default overflow-hidden border-0 transition-all duration-700 bg-transparent">
          <CardContent className="p-0 relative">
            {/* Card Background */}
            <div className="absolute inset-0 backdrop-blur-xl bg-white/70 border-2 border-gray-200/60 rounded-2xl shadow-2xl shadow-pink-500/5 transition-all duration-500" />

            {/* Subtle glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-fuchsia-500/5 rounded-2xl opacity-50 blur-xl" />

            <div className="relative p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Title Field */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 font-semibold text-base">
                          Stream Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your stream title"
                            className="h-12 backdrop-blur-xl bg-white/60 border-2 border-gray-200/60 hover:border-pink-500/40 focus:border-pink-500 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all duration-300 shadow-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Give your stream a catchy title
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description Field */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 font-semibold text-base">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what your stream is about"
                            className="resize-none h-24 backdrop-blur-xl bg-white/60 border-2 border-gray-200/60 hover:border-pink-500/40 focus:border-pink-500 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all duration-300 shadow-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Tell viewers what to expect from your stream
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Thumbnail Dropzone */}
                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 font-semibold text-base">
                          Stream Thumbnail
                        </FormLabel>
                        <FormControl>
                          <div>
                            {!thumbnailPreview ? (
                              <div
                                {...getRootProps()}
                                className={`
                                  relative h-48 backdrop-blur-xl bg-white/60 border-2 border-dashed 
                                  ${isDragActive ? 'border-pink-500 bg-pink-50/50' : 'border-gray-300'}
                                  hover:border-pink-500/60 hover:bg-pink-50/30
                                  rounded-xl transition-all duration-300 cursor-pointer
                                  flex flex-col items-center justify-center gap-3
                                  group/dropzone
                                `}
                              >
                                <input {...getInputProps()} />
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 flex items-center justify-center group-hover/dropzone:from-pink-500/20 group-hover/dropzone:to-rose-500/20 transition-all duration-300">
                                  <Upload className="h-8 w-8 text-pink-500 group-hover/dropzone:scale-110 transition-transform duration-300" />
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-700 font-semibold mb-1">
                                    {isDragActive
                                      ? 'Drop the image here'
                                      : 'Drag & drop your thumbnail'}
                                  </p>
                                  <p className="text-gray-500 text-sm">
                                    or click to browse files
                                  </p>
                                </div>
                                <div className="flex gap-2 text-xs text-gray-400">
                                  <span className="px-3 py-1 bg-white/50 rounded-full">
                                    PNG
                                  </span>
                                  <span className="px-3 py-1 bg-white/50 rounded-full">
                                    JPG
                                  </span>
                                  <span className="px-3 py-1 bg-white/50 rounded-full">
                                    GIF
                                  </span>
                                  <span className="px-3 py-1 bg-white/50 rounded-full">
                                    WEBP
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="relative rounded-xl overflow-hidden border-2 border-pink-500/30 shadow-xl shadow-pink-500/10 group/preview animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <img
                                  src={thumbnailPreview}
                                  alt="Thumbnail preview"
                                  className="w-full h-auto max-h-96 object-cover group-hover/preview:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300" />

                                {/* Remove button */}
                                <button
                                  type="button"
                                  onClick={removeThumbnail}
                                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg hover:scale-110 opacity-0 group-hover/preview:opacity-100"
                                >
                                  <X className="h-5 w-5" />
                                </button>

                                {/* File info */}
                                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300">
                                  <div className="backdrop-blur-xl bg-white/90 rounded-lg px-4 py-3 flex items-center gap-3">
                                    <ImageIcon className="h-5 w-5 text-pink-600" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 truncate">
                                        {thumbnailFile?.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {thumbnailFile &&
                                          (
                                            thumbnailFile.size /
                                            1024 /
                                            1024
                                          ).toFixed(2)}{' '}
                                        MB
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Upload an eye-catching thumbnail (recommended:
                          1920x1080)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 text-white font-bold shadow-lg shadow-pink-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/40 rounded-xl"
                    >
                      Start Stream
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 backdrop-blur-xl bg-white/60 border-2 border-gray-200/60 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-pink-500/40 hover:text-gray-900 transition-all duration-300 rounded-xl font-semibold"
                    >
                      Save as Draft
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>

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
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, -30px) scale(1.1);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, 30px) scale(1.1);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, 20px) scale(1.05);
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

        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Eye,
  X,
  TrendingUp,
  Sparkles,
  Users,
  Radio,
  Play,
  Plus,
  User,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '@/configs/axiosinstance'

export const Route = createFileRoute('/')({
  component: App,
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

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchStreams() {
    try {
      const res = await api.get('/stream')
      const data = res.data
      console.log('Fetched streams:', data)
      setStreams(data.streams || [])
    } catch (error) {
      console.error('Error fetching streams:', error)
      setStreams([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStreams()
  }, [])

  const filteredStreams = streams.filter(
    (stream) =>
      stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.host.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const liveStreams = streams.filter((stream) => stream.status === 'live')

  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />

      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-8 mb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 backdrop-blur-sm shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-gray-700">
                  Top Live Streams
                </span>
              </div>
              <h2 className="text-6xl font-black mb-3 bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent leading-tight">
                Live Streams
              </h2>
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-gray-600 text-lg flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                  {liveStreams.length}{' '}
                  {liveStreams.length === 1 ? 'stream' : 'streams'} live
                </p>
                <div className="flex items-center gap-2 text-gray-600">
                  <Radio className="h-5 w-5" />
                  <span className="font-semibold">{streams.length}</span>
                  <span className="text-sm">total streams</span>
                </div>
              </div>
            </div>

            {/* Start Broadcasting Button */}
            <Link to="/stream/create">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-14 px-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="flex items-center gap-3 relative z-10">
                  <Radio className="h-5 w-5" />
                  <span className="font-semibold text-base">
                    Start Broadcasting
                  </span>
                  <Plus className="h-5 w-5" />
                </div>
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative mx-auto">
            <div
              className={`relative transition-all duration-500 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}
            >
              <div
                className={`absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl transition-opacity duration-500 ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`}
              />

              <div className="relative backdrop-blur-xl bg-white/60 border-2 border-gray-200/60 hover:border-primary/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <Search
                  className={`absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-all duration-300 z-10 ${isSearchFocused ? 'text-primary scale-110' : 'text-gray-400'}`}
                />
                <Input
                  placeholder="Search by title, host, description or ID..."
                  className="pl-14 pr-14 h-14 bg-transparent border-0 text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() =>
                    setTimeout(() => setIsSearchFocused(false), 200)
                  }
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-all duration-300 z-10 hover:rotate-90"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="mt-6 text-gray-600 font-medium">Loading streams...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && streams.length === 0 && (
          <div className="text-center py-20">
            <div className="backdrop-blur-xl bg-white/60 border-2 border-gray-200/60 rounded-3xl p-12 max-w-2xl mx-auto shadow-2xl">
              <div className="backdrop-blur-xl bg-white/80 p-6 rounded-full inline-block mb-6">
                <Radio className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                No Live Streams Yet
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Be the first to start broadcasting!
              </p>
              <Link to="/stream/create">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-14 px-8"
                >
                  <Radio className="h-5 w-5 mr-2" />
                  Start Your First Stream
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && streams.length > 0 && filteredStreams.length === 0 && (
          <div className="text-center py-20">
            <div className="backdrop-blur-xl bg-white/60 border-2 border-gray-200/60 rounded-3xl p-12 max-w-xl mx-auto">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                No streams found
              </h3>
              <p className="text-gray-600">Try adjusting your search query</p>
            </div>
          </div>
        )}

        {/* Streams Grid */}
        {!loading && filteredStreams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStreams.map((stream) => (
              <Link
                key={stream.id}
                to="/stream/view/$id"
                params={{ id: stream.id }}
              >
                <Card
                  onMouseEnter={() => setHoveredCard(stream.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`group relative overflow-hidden backdrop-blur-xl bg-white/80 border-2 transition-all duration-500 cursor-pointer ${
                    hoveredCard === stream.id
                      ? 'border-primary/50 shadow-2xl scale-105 -translate-y-2'
                      : 'border-gray-200/60 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10">
                    {stream.thumbnail ? (
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Radio className="h-16 w-16 text-gray-300" />
                      </div>
                    )}

                    {/* Live Badge */}
                    {stream.status === 'live' && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 shadow-lg animate-pulse">
                        <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5" />
                        LIVE
                      </Badge>
                    )}

                    {/* Status Badge */}
                    {stream.status !== 'live' && (
                      <Badge
                        variant="outline"
                        className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border-gray-300"
                      >
                        {stream.status}
                      </Badge>
                    )}

                    {/* Play overlay on hover */}
                    <div
                      className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
                        hoveredCard === stream.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      }`}
                    >
                      <div className="bg-white rounded-full p-4 transform scale-100 group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-8 w-8 text-primary fill-primary" />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-primary transition-colors duration-300">
                      {stream.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {stream.description}
                    </p>

                    {/* Host Info */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        {stream.host.avatar && (
                          <AvatarImage src={stream.host.avatar} alt={stream.host.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-xs font-semibold">
                          {getInitials(stream.host.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {stream.host.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{stream.host.username}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

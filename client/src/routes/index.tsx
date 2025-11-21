import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Eye, X, TrendingUp, Sparkles, Users, Radio, Play } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: App,
})

const liveStreams = [
  {
    id: '1',
    title: 'Coding Session - Building React App',
    username: 'johndoe',
    thumbnail: 'https://placehold.co/400x225/1e293b/white?text=Stream+1',
    avatar: 'https://placehold.co/100x100/3b82f6/white?text=JD',
    viewers: 234,
    isLive: true,
    category: 'Programming',
  },
  {
    id: '2',
    title: 'Game Development Tutorial',
    username: 'janesmit',
    thumbnail: 'https://placehold.co/400x225/1e293b/white?text=Stream+2',
    avatar: 'https://placehold.co/100x100/8b5cf6/white?text=JS',
    viewers: 512,
    isLive: true,
    category: 'Gaming',
  },
  {
    id: '3',
    title: 'Design Review & Feedback',
    username: 'alexchen',
    thumbnail: 'https://placehold.co/400x225/1e293b/white?text=Stream+3',
    avatar: 'https://placehold.co/100x100/ec4899/white?text=AC',
    viewers: 89,
    isLive: true,
    category: 'Design',
  },
  {
    id: '4',
    title: 'Music Production Live',
    username: 'sarahmusic',
    thumbnail: 'https://placehold.co/400x225/1e293b/white?text=Stream+4',
    avatar: 'https://placehold.co/100x100/f59e0b/white?text=SM',
    viewers: 1205,
    isLive: true,
    category: 'Music',
  },
  {
    id: '5',
    title: 'Algorithm Practice Session',
    username: 'codewizard',
    thumbnail: 'https://placehold.co/400x225/1e293b/white?text=Stream+5',
    avatar: 'https://placehold.co/100x100/10b981/white?text=CW',
    viewers: 342,
    isLive: true,
    category: 'Programming',
  },
  {
    id: '6',
    title: '3D Modeling Workshop',
    username: 'artcreator',
    thumbnail: 'https://placehold.co/400x225/1e293b/white?text=Stream+6',
    avatar: 'https://placehold.co/100x100/ef4444/white?text=AC',
    viewers: 678,
    isLive: true,
    category: 'Art',
  },
]

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const filteredStreams = liveStreams.filter((stream) =>
    stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stream.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stream.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const trendingSearches = ['Programming', 'Gaming', 'Music', 'Art']
  const totalViewers = liveStreams.reduce((sum, stream) => sum + stream.viewers, 0)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background - inspired by auth page */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-gradient-shift" />

      {/* Ambient orbs - light theme version */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-pink-400/8 rounded-full blur-3xl animate-float-slow" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Noise texture overlay for premium feel */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-soft-light pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

     
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Header Section with Search */}
        <div className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-8 mb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 backdrop-blur-sm shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-gray-700">Top Live Streams</span>
              </div>
              <h2 className="text-6xl font-black mb-3 bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent leading-tight">
                Live Streams
              </h2>
              <p className="text-gray-600 text-lg flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                {filteredStreams.length} {filteredStreams.length === 1 ? 'stream' : 'streams'} broadcasting now
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <div className={`
                relative transition-all duration-500
                ${isSearchFocused ? 'scale-105' : 'scale-100'}
              `}>
                {/* Glow effect on focus */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl transition-opacity duration-500 ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`} />
                
                <div className="relative backdrop-blur-xl bg-white/60 border-2 border-gray-200/60 hover:border-primary/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <Search className={`
                    absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-all duration-300 z-10
                    ${isSearchFocused ? 'text-primary scale-110' : 'text-gray-400'}
                  `} />
                  <Input
                    placeholder="Search streams, creators, categories..."
                    className="pl-14 pr-14 h-14 bg-transparent border-0 text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
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

              {/* Search Suggestions Dropdown */}
              {isSearchFocused && !searchQuery && (
                <div className="absolute top-full mt-3 w-full backdrop-blur-2xl bg-white/80 border-2 border-gray-200/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 z-50">
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {trendingSearches.map((term, idx) => (
                        <button
                          key={term}
                          onMouseDown={() => setSearchQuery(term)}
                          className="group px-5 py-2.5 backdrop-blur-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-primary/10 hover:to-purple-500/10 border border-gray-200 hover:border-primary/40 rounded-xl text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg text-gray-700 hover:text-gray-900 font-medium"
                          style={{
                            animationDelay: `${idx * 50}ms`,
                          }}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Streams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStreams.map((stream, index) => (
            <Card
              key={stream.id}
              onMouseEnter={() => setHoveredCard(stream.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ 
                animationDelay: `${index * 80}ms`,
              }}
              className="group cursor-pointer overflow-hidden border-0 transition-all duration-700 bg-transparent animate-in fade-in slide-in-from-bottom-6 hover:-translate-y-3 hover:scale-105"
            >
              <CardContent className="p-0 relative">
                {/* Card Background with subtle gradient */}
                <div className="absolute inset-0 backdrop-blur-xl bg-white/70 border-2 border-gray-200/60 rounded-2xl group-hover:bg-white/90 group-hover:border-primary/40 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10" />
                
                {/* Subtle glow effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />

                <div className="relative">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-60" />
                        <div className="relative w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                          <Play className="h-7 w-7 text-primary ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Live Badge */}
                    {stream.isLive && (
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="destructive"
                          className="flex items-center gap-2 shadow-xl bg-red-500 border-0 px-3 py-1.5 font-bold text-xs tracking-wider"
                        >
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                          </span>
                          LIVE
                        </Badge>
                      </div>
                    )}

                    {/* Category Badge */}
                    <Badge
                      variant="secondary"
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 shadow-lg font-semibold px-3 py-1 hover:bg-white transition-all duration-300"
                    >
                      {stream.category}
                    </Badge>

                    {/* Viewer Count */}
                    <div className="absolute bottom-4 right-4 backdrop-blur-xl bg-white/90 border border-gray-200 text-gray-900 text-sm px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                      <Eye className="h-4 w-4 text-red-500" />
                      <span className="font-bold">{stream.viewers.toLocaleString()}</span>
                    </div>

                    {/* Trending Indicator */}
                    {stream.viewers > 500 && (
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-in slide-in-from-top-2">
                        <div className="backdrop-blur-xl bg-gradient-to-r from-yellow-400 to-orange-400 border border-yellow-300/50 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl font-bold">
                          <TrendingUp className="h-3 w-3" />
                          TRENDING
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stream Info */}
                  <div className="p-5 relative">
                    <div className="flex gap-3">
                      <div className="relative group/avatar">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-full opacity-0 group-hover/avatar:opacity-50 blur transition-opacity duration-500" />
                        <Avatar className="h-12 w-12 border-2 border-gray-200 group-hover:border-primary/60 transition-all duration-500 shadow-md relative">
                          <AvatarImage src={stream.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                            {stream.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online Indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold line-clamp-2 mb-1.5 text-gray-900 group-hover:text-primary transition-colors duration-300 text-base leading-snug">
                          {stream.title}
                        </h3>
                        <p className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-300 font-medium">
                          @{stream.username}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredStreams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center backdrop-blur-xl bg-white/70 border-2 border-gray-200/60 rounded-3xl shadow-xl">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full flex items-center justify-center border-2 border-gray-200">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-3 text-gray-900">
              No Streams Found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md text-lg">
              No streams match <span className="text-primary font-semibold">"{searchQuery}"</span>
              <br />
              Try different keywords or check back later!
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="group px-6 py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
            >
              Clear Search
            </button>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-40px) translateX(-20px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) translateX(30px) scale(1.1);
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

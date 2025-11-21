import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Video,
  Eye,
  Radio,
  TrendingUp,
  Users,
  Clock,
  Play,
  Settings,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  // Mock data - replace with your actual data fetching
  const user = {
    name: 'Atiksh',
    username: '@atiksh',
    avatar: '/avatar.jpg',
    totalStreams: 12,
    totalViews: 1547,
  }

  const activeStreams = [
    {
      id: 'stream-1',
      name: 'Building a React App',
      thumbnail: '/thumb1.jpg',
      viewers: 23,
      duration: '45:32',
      isLive: true,
    },
    {
      id: 'stream-2',
      name: 'Gaming Session',
      thumbnail: '/thumb2.jpg',
      viewers: 156,
      duration: '1:23:15',
      isLive: true,
    },
  ]

  const recentStreams = [
    {
      id: 'past-1',
      name: 'Code Review Session',
      views: 89,
      date: '2 hours ago',
    },
    {
      id: 'past-2',
      name: 'Tutorial: WebRTC Basics',
      views: 234,
      date: '1 day ago',
    },
    {
      id: 'past-3',
      name: 'Live Coding Challenge',
      views: 312,
      date: '3 days ago',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}


      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-muted-foreground">
            Manage your streams and view your analytics
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button size="lg" className="w-full h-20 text-lg" asChild>
            <Link to="/">
              <Radio className="mr-2 h-5 w-5" />
              Start Live Stream
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full h-20 text-lg"
            asChild
          >
            <Link to="/">
              <Play className="mr-2 h-5 w-5" />
              Browse Streams
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full h-20 text-lg"
            asChild
          >
            <Link to="/">
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Streams
              </CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.totalStreams}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Live Now</CardTitle>
              <Radio className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStreams.length}</div>
              <p className="text-xs text-muted-foreground">Active streams</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Streams</TabsTrigger>
            <TabsTrigger value="recent">Recent Streams</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeStreams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeStreams.map((stream) => (
                  <Card key={stream.id} className="overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={stream.thumbnail}
                        alt={stream.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        <Radio className="h-3 w-3 mr-1" />
                        LIVE
                      </Badge>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                        {stream.duration}
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{stream.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {stream.viewers} viewers
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" asChild>
                        <Link to={`/`}>View Stream</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Radio className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No active streams</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start broadcasting to see your stream here
                  </p>
                  <Button asChild>
                    <Link to="/">Start Streaming</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Stream History</CardTitle>
                <CardDescription>
                  Your past broadcasts and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStreams.map((stream) => (
                    <div
                      key={stream.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{stream.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {stream.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{stream.views} views</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1"
                          asChild
                        >
                          <Link to={`/stream/${stream.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stream Analytics</CardTitle>
                <CardDescription>
                  Detailed insights about your streaming performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Analytics coming soon
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We're working on detailed analytics for your streams
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

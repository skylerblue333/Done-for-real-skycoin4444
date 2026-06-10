import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Search, Users } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

export default function SocialMedia() {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: feed, isLoading } = trpc.social.getFeed.useQuery({ limit: 20 });
  const { data: users } = trpc.social.getTrending.useQuery({ limit: 5 });
  const createPost = trpc.social.createPost.useMutation();
  const followUser = trpc.social.followUser.useMutation();

  const handlePostSubmit = () => {
    if (postContent.trim()) {
      createPost.mutate({ content: postContent });
      setPostContent('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-cyan-400" />
            Community Feed
          </h1>
          <p className="text-gray-400">Connect with millions of creators and learners</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            {user && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-700 p-6">
                <div className="flex gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:border-cyan-500 focus:outline-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setPostContent('')}
                    disabled={!postContent.trim()}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePostSubmit}
                    disabled={!postContent.trim() || createPost.isPending}
                    className="bg-gradient-to-r from-cyan-600 to-purple-600"
                  >
                    {createPost.isPending ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Feed */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
              </div>
            ) : feed && feed.length === 0 ? (
              <Card className="bg-gray-900 border-gray-700 p-12 text-center">
                <p className="text-gray-400">No posts yet. Be the first to share!</p>
              </Card>
            ) : (
              feed?.map((post: any) => (
                <Card
                  key={post.id}
                  className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-700 p-6 hover:border-cyan-500/50 transition-all"
                >
                  {/* Post Header */}
                  <div className="flex gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {post.authorName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{post.authorName}</h3>
                        <span className="text-gray-500 text-sm">@{post.authorHandle}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{post.createdAt}</p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-white mb-4 whitespace-pre-wrap">{post.content}</p>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full rounded-lg mb-4 max-h-96 object-cover"
                    />
                  )}

                  {/* Post Stats */}
                  <div className="flex gap-6 text-sm text-gray-400 mb-4 py-3 border-t border-b border-gray-700">
                    <span>{post.likes} likes</span>
                    <span>{post.comments} comments</span>
                    <span>{post.shares} shares</span>
                  </div>

                  {/* Post Actions */}
                  <div className="flex gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 text-gray-400 hover:text-red-400 transition-colors py-2">
                      <Heart className="w-5 h-5" />
                      Like
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors py-2">
                      <MessageCircle className="w-5 h-5" />
                      Reply
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 text-gray-400 hover:text-green-400 transition-colors py-2">
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <Card className="bg-gray-900 border-gray-700 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </Card>

            {/* Suggested Users */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Suggested Users</h3>
              <div className="space-y-4">
                {users?.map((suggestedUser: any) => (
                  <div key={suggestedUser.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 flex items-center justify-center text-white font-bold">
                        {suggestedUser.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{suggestedUser.name}</p>
                        <p className="text-gray-400 text-xs">@{suggestedUser.handle}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => followUser.mutate({ userId: suggestedUser.id })}
                      disabled={followUser.isPending}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Trending */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">🔥 Trending</h3>
              <div className="space-y-3">
                {['#SKYCOIN4444', '#AI', '#Web3', '#Crypto', '#Community'].map((tag) => (
                  <div
                    key={tag}
                    className="p-3 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-cyan-400">{tag}</p>
                    <p className="text-gray-400 text-xs">Trending worldwide</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

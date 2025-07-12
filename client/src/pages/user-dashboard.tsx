import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ReviewCard from "@/components/ReviewCard";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, ThumbsUp } from "lucide-react";
import type { ReviewWithRelations } from "@shared/schema";

interface UserStats {
  totalReviews: number;
  avgRating: number;
  totalHelpfulVotes: number;
}

export default function UserDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: myReviews = [] } = useQuery<ReviewWithRelations[]>({
    queryKey: ['/api/reviews', { authorId: user?.id, isDraft: false }],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/reviews?authorId=${user!.id}&isDraft=false`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
  });

  const { data: myDrafts = [] } = useQuery<ReviewWithRelations[]>({
    queryKey: ['/api/reviews', { authorId: user?.id, isDraft: true }],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/reviews?authorId=${user!.id}&isDraft=true`);
      if (!response.ok) throw new Error('Failed to fetch drafts');
      return response.json();
    },
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/users', user?.id, 'stats'],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/users/${user!.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch user stats');
      return response.json();
    },
  });

  const getCategoryColor = (categoryName: string) => {
    const colorMap: Record<string, string> = {
      'Restaurants': 'bg-blue-100 text-blue-600',
      'Technology': 'bg-green-100 text-green-600',
      'Travel': 'bg-purple-100 text-purple-600',
      'Beauty': 'bg-pink-100 text-pink-600',
      'Shopping': 'bg-orange-100 text-orange-600',
      'Health': 'bg-red-100 text-red-600',
    };
    return colorMap[categoryName] || 'bg-gray-100 text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Review Dashboard</h1>
            <p className="text-xl text-gray-600">Manage your reviews and track your reputation</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* User Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage
                        src={user?.profileImageUrl || ''}
                        alt={`${user?.firstName} ${user?.lastName}`}
                      />
                      <AvatarFallback className="text-2xl">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-600">Trusted Reviewer</p>
                    <div className="flex items-center justify-center space-x-1 mt-2">
                      <StarRating rating={userStats?.avgRating || 0} readonly size="small" />
                      <span className="text-lg font-semibold ml-2">
                        {userStats?.avgRating || 0}
                      </span>
                      <span className="text-gray-500">avg rating</span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {userStats?.totalReviews || 0}
                      </div>
                      <div className="text-sm text-gray-500">Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {userStats?.totalHelpfulVotes || 0}
                      </div>
                      <div className="text-sm text-gray-500">Helpful Votes</div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="space-y-3">
                    <Button asChild className="w-full">
                      <a href="/write">
                        <Plus className="w-4 h-4 mr-2" />
                        Write New Review
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Dashboard Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <Tabs defaultValue="reviews" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                      <TabsTrigger value="drafts">Drafts ({myDrafts.length})</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="reviews" className="space-y-4 mt-6">
                      {myReviews.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">You haven't written any reviews yet.</p>
                          <Button asChild>
                            <a href="/write">Write Your First Review</a>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myReviews.map((review) => (
                            <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{review.title}</h3>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <StarRating rating={review.rating} readonly size="small" />
                                    {review.category && (
                                      <Badge className={getCategoryColor(review.category.name)}>
                                        {review.category.name}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {review.content}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Posted {formatDate(review.createdAt!)}</span>
                                <div className="flex items-center space-x-4">
                                  <span>
                                    <Eye className="w-3 h-3 inline mr-1" />
                                    {review.views} views
                                  </span>
                                  <span>
                                    <ThumbsUp className="w-3 h-3 inline mr-1" />
                                    {review.helpfulVotes} helpful
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="drafts" className="space-y-4 mt-6">
                      {myDrafts.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600">No drafts found.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myDrafts.map((review) => (
                            <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {review.title || "Untitled Draft"}
                                  </h3>
                                  <Badge variant="secondary">Draft</Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={`/write?draft=${review.id}`}>
                                      <Edit className="w-4 h-4 mr-1" />
                                      Continue
                                    </a>
                                  </Button>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {review.content || "No content yet..."}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Last saved {formatDate(review.updatedAt!)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="analytics" className="mt-6">
                      <div className="text-center py-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                        <p className="text-gray-600">
                          We're working on detailed analytics to help you understand your impact on the community.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

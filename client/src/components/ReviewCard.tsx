import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import StarRating from "./StarRating";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Eye, Calendar } from "lucide-react";
import type { ReviewWithRelations } from "@shared/schema";

interface ReviewCardProps {
  review: ReviewWithRelations;
  mode?: 'grid' | 'list' | 'featured';
  getCategoryColor: (categoryName: string) => string;
}

export default function ReviewCard({ review, mode = 'grid', getCategoryColor }: ReviewCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voteReviewMutation = useMutation({
    mutationFn: async (isHelpful: boolean) => {
      const response = await apiRequest("POST", `/api/reviews/${review.id}/vote`, { isHelpful });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({
        title: "Vote recorded",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleVote = (isHelpful: boolean) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on reviews.",
      });
      return;
    }
    voteReviewMutation.mutate(isHelpful);
  };

  const renderImage = () => {
    if (!review.images || review.images.length === 0) return null;
    
    return (
      <div className="mb-4">
        <img
          src={review.images[0]}
          alt="Review"
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>
    );
  };

  if (mode === 'featured') {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={review.author.profileImageUrl || ''}
                  alt={`${review.author.firstName} ${review.author.lastName}`}
                />
                <AvatarFallback>
                  {review.author.firstName?.[0]}{review.author.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {review.author.firstName} {review.author.lastName}
                </h4>
                <p className="text-sm text-gray-500">Trusted Reviewer</p>
              </div>
            </div>
            <StarRating rating={review.rating} readonly />
          </div>
          
          <h5 className="font-semibold text-lg text-gray-900 mb-2">{review.title}</h5>
          <p className="text-gray-600 mb-4 line-clamp-3">{review.content}</p>
          
          {renderImage()}
          
          <div className="flex items-center justify-between">
            {review.category && (
              <Badge className={getCategoryColor(review.category.name)}>
                {review.category.name}
              </Badge>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(true)}
                disabled={voteReviewMutation.isPending}
                className="flex items-center space-x-1 hover:text-green-600"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{review.helpfulVotes}</span>
              </Button>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(review.createdAt!)}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={review.author.profileImageUrl || ''}
                alt={`${review.author.firstName} ${review.author.lastName}`}
              />
              <AvatarFallback>
                {review.author.firstName?.[0]}{review.author.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <StarRating rating={review.rating} readonly size="small" />
                  {review.category && (
                    <Badge className={getCategoryColor(review.category.name)}>
                      {review.category.name}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-gray-500">{formatDate(review.createdAt!)}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              <p className="text-gray-600 mb-3 line-clamp-2">{review.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  by {review.author.firstName} {review.author.lastName}
                </span>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{review.views}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(true)}
                    disabled={voteReviewMutation.isPending}
                    className="flex items-center space-x-1 hover:text-green-600"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{review.helpfulVotes}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default grid mode
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <StarRating rating={review.rating} readonly size="small" />
          {review.category && (
            <Badge className={getCategoryColor(review.category.name)}>
              {review.category.name}
            </Badge>
          )}
        </div>
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{review.content}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            by {review.author.firstName} {review.author.lastName?.charAt(0)}.
          </span>
          <span>{formatDate(review.createdAt!)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

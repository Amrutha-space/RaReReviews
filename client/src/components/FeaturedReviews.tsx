import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ReviewCard from "./ReviewCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { ReviewWithRelations } from "@shared/schema";

export default function FeaturedReviews() {
  const { data: reviews = [], isLoading } = useQuery<ReviewWithRelations[]>({
    queryKey: ['/api/reviews', { featured: true }],
    queryFn: async () => {
      const response = await fetch('/api/reviews?sortBy=helpful&limit=3');
      if (!response.ok) throw new Error('Failed to fetch featured reviews');
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

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Featured Reviews</h3>
              <p className="text-xl text-gray-600">Top-rated reviews from our community</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Featured Reviews</h3>
            <p className="text-xl text-gray-600">Top-rated reviews from our community</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/browse">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No featured reviews available at the moment.</p>
            <Button asChild>
              <Link href="/write">Write the First Review</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                mode="featured"
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

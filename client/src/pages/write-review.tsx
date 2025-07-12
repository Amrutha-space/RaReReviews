import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import StarRating from "@/components/StarRating";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema } from "@shared/schema";
import type { Category, InsertReview } from "@shared/schema";
import { z } from "zod";

const reviewFormSchema = insertReviewSchema.extend({
  categoryId: z.number().min(1, "Please select a category"),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

export default function WriteReview() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      isDraft: false,
      images: [],
    },
  });

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

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const reviewData = {
        ...data,
        images: uploadedImages,
      };
      const response = await apiRequest("POST", "/api/reviews", reviewData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review published!",
        description: "Your review has been successfully published.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      window.location.href = "/dashboard";
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
        description: "Failed to publish review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: Partial<ReviewFormData>) => {
      const draftData = {
        ...data,
        isDraft: true,
        images: uploadedImages,
      };
      const response = await apiRequest("POST", "/api/reviews", draftData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Draft saved!",
        description: "Your review has been saved as a draft.",
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
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    createReviewMutation.mutate(data);
  };

  const onSaveDraft = () => {
    const currentData = watch();
    if (currentData.title && currentData.content) {
      saveDraftMutation.mutate(currentData);
    } else {
      toast({
        title: "Cannot save draft",
        description: "Please add a title and content before saving as draft.",
        variant: "destructive",
      });
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setValue("categoryId", categoryId);
  };

  const handleRatingChange = (rating: number) => {
    setValue("rating", rating);
  };

  const handleContentChange = (content: string) => {
    setValue("content", content);
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, string> = {
      'Restaurants': 'fas fa-utensils',
      'Technology': 'fas fa-laptop',
      'Travel': 'fas fa-plane',
      'Beauty': 'fas fa-spa',
      'Shopping': 'fas fa-shopping-bag',
      'Health': 'fas fa-heart',
    };
    return iconMap[categoryName] || 'fas fa-star';
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
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Write a Review</h1>
            <p className="text-xl text-gray-600">Share your honest experience with the community</p>
          </div>
          
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySelect(category.id)}
                        className={`p-3 border rounded-lg text-center transition-colors group ${
                          selectedCategory === category.id
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-300 hover:border-primary hover:bg-blue-50'
                        }`}
                      >
                        <i className={`${getCategoryIcon(category.name)} ${
                          selectedCategory === category.id ? 'text-primary' : 'text-gray-400 group-hover:text-primary'
                        } text-lg mb-1`}></i>
                        <div className={`text-xs font-medium ${
                          selectedCategory === category.id ? 'text-primary' : ''
                        }`}>
                          {category.name}
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.categoryId && (
                    <p className="text-red-600 text-sm mt-1">{errors.categoryId.message}</p>
                  )}
                </div>
                
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title
                  </label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Give your review a descriptive title"
                    className="text-lg"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>
                
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                  <StarRating
                    rating={watch("rating") || 5}
                    onRatingChange={handleRatingChange}
                    size="large"
                  />
                </div>
                
                {/* Review Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <RichTextEditor
                    value={watch("content") || ""}
                    onChange={handleContentChange}
                    placeholder="Share your detailed experience. What did you like? What could be improved? Be honest and helpful!"
                  />
                  <p className="text-sm text-gray-500 mt-2">Minimum 50 characters required</p>
                  {errors.content && (
                    <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
                  )}
                </div>
                
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Photos (Optional)
                  </label>
                  <ImageUpload
                    onImagesChange={setUploadedImages}
                    maxImages={5}
                    maxSizeMB={10}
                  />
                </div>
                
                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onSaveDraft}
                      disabled={saveDraftMutation.isPending}
                    >
                      {saveDraftMutation.isPending ? "Saving..." : "Save as Draft"}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.history.back()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createReviewMutation.isPending}
                    >
                      {createReviewMutation.isPending ? "Publishing..." : "Publish Review"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

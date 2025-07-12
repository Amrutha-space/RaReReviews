import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import type { Category } from "@shared/schema";

export default function Categories() {
  const [, setLocation] = useLocation();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

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

  const getCategoryColor = (categoryName: string) => {
    const colorMap: Record<string, string> = {
      'Restaurants': 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      'Technology': 'bg-green-100 text-green-600 hover:bg-green-200',
      'Travel': 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      'Beauty': 'bg-pink-100 text-pink-600 hover:bg-pink-200',
      'Shopping': 'bg-orange-100 text-orange-600 hover:bg-orange-200',
      'Health': 'bg-red-100 text-red-600 hover:bg-red-200',
    };
    return colorMap[categoryName] || 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  };

  const handleCategoryClick = (categoryId: number) => {
    setLocation(`/browse?category=${categoryId}`);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 text-center animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h3>
          <p className="text-xl text-gray-600">Find reviews for anything you're looking for</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center transition-colors ${getCategoryColor(category.name)}`}>
                  <i className={`${getCategoryIcon(category.name)} text-xl`}></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{category.name}</h4>
                <p className="text-sm text-gray-500">
                  {category.reviewCount.toLocaleString()} reviews
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

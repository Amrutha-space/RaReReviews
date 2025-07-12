import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Hero() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation("/browse");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-6xl font-bold mb-6">
          Honest Reviews About <span className="text-yellow-300">Everything</span>
        </h2>
        <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
          Discover genuine experiences and share your honest opinions about products, services, and experiences that matter.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for reviews, products, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-4 text-gray-900 rounded-xl text-lg pr-14"
            />
            <Button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold">50K+</div>
            <div className="text-blue-200">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">12K+</div>
            <div className="text-blue-200">Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">200+</div>
            <div className="text-blue-200">Categories</div>
          </div>
        </div>
      </div>
    </section>
  );
}

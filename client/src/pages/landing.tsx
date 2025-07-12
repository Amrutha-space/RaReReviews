import { Button } from "@/components/ui/button";
import { Star, Users, MessageCircle, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-700 text-white">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-300" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold">RaReReviews</h1>
          </div>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="bg-white text-primary hover:bg-gray-100"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Honest Reviews About <span className="text-yellow-300">Everything</span>
          </h2>
          <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Discover genuine experiences and share your honest opinions about products, services, and experiences that matter.
          </p>
          
          <Button 
            onClick={() => window.location.href = "/api/login"}
            size="lg"
            className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 text-lg px-8 py-4 mb-12"
          >
            Join RaReReviews
          </Button>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mb-16">
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

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Users className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Trusted Community</h3>
              <p className="text-blue-100">
                Connect with a community of honest reviewers who share genuine experiences.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <MessageCircle className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Detailed Reviews</h3>
              <p className="text-blue-100">
                Read and write comprehensive reviews with photos and detailed insights.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <TrendingUp className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Ratings</h3>
              <p className="text-blue-100">
                Our community-driven rating system helps you make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-white/20">
        <div className="max-w-7xl mx-auto text-center text-blue-200">
          <p>&copy; 2024 RaReReviews. Built with ❤️ for honest reviewers everywhere.</p>
        </div>
      </footer>
    </div>
  );
}

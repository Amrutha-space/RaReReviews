import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedReviews from "@/components/FeaturedReviews";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <Categories />
      <FeaturedReviews />
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-star text-white text-lg"></i>
                </div>
                <h4 className="text-2xl font-bold">RaReReviews</h4>
              </div>
              <p className="text-gray-300 mb-6">
                Your trusted platform for honest reviews about everything that matters.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h5 className="font-semibold text-lg mb-4">Quick Links</h5>
              <ul className="space-y-2">
                <li><a href="/browse" className="text-gray-300 hover:text-white transition-colors">Browse Reviews</a></li>
                <li><a href="/write" className="text-gray-300 hover:text-white transition-colors">Write a Review</a></li>
                <li><a href="/dashboard" className="text-gray-300 hover:text-white transition-colors">My Dashboard</a></li>
              </ul>
            </div>
            
            {/* Categories */}
            <div>
              <h5 className="font-semibold text-lg mb-4">Popular Categories</h5>
              <ul className="space-y-2">
                <li><a href="/browse?category=restaurants" className="text-gray-300 hover:text-white transition-colors">Restaurants</a></li>
                <li><a href="/browse?category=technology" className="text-gray-300 hover:text-white transition-colors">Technology</a></li>
                <li><a href="/browse?category=travel" className="text-gray-300 hover:text-white transition-colors">Travel</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h5 className="font-semibold text-lg mb-4">Support</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 pt-8 text-center">
            <p className="text-gray-300">
              &copy; 2024 RaReReviews. All rights reserved. Built with ❤️ for honest reviewers everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

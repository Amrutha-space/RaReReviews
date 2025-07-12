import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertReviewSchema, insertReviewVoteSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { mkdir } from "fs/promises";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  try {
    await mkdir("uploads", { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    // Add cache headers for uploaded images
    res.set("Cache-Control", "public, max-age=31536000");
    next();
  });

  // Auth middleware
  await setupAuth(app);

  // Initialize categories if empty
  app.get("/api/init", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      if (categories.length === 0) {
        const defaultCategories = [
          { name: "Restaurants", slug: "restaurants", icon: "utensils", color: "blue" },
          { name: "Technology", slug: "technology", icon: "laptop", color: "green" },
          { name: "Travel", slug: "travel", icon: "plane", color: "purple" },
          { name: "Beauty", slug: "beauty", icon: "spa", color: "pink" },
          { name: "Shopping", slug: "shopping", icon: "shopping-bag", color: "orange" },
          { name: "Health", slug: "health", icon: "heart", color: "red" },
        ];

        for (const category of defaultCategories) {
          await storage.createCategory(category);
        }
      }
      res.json({ message: "Categories initialized" });
    } catch (error) {
      res.status(500).json({ message: "Failed to initialize categories" });
    }
  });

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Reviews routes
  app.get("/api/reviews", async (req, res) => {
    try {
      const {
        categoryId,
        authorId,
        isDraft,
        minRating,
        search,
        sortBy,
        limit,
        offset,
      } = req.query;

      const options = {
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        authorId: authorId as string,
        isDraft: isDraft === "true",
        minRating: minRating ? parseInt(minRating as string) : undefined,
        search: search as string,
        sortBy: (sortBy as any) || "recent",
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
      };

      const reviews = await storage.getReviews(options);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const review = await storage.getReviewById(id);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Increment views if not the author viewing their own review
      const user = (req as any).user;
      if (!user || user.claims?.sub !== review.authorId) {
        await storage.incrementReviewViews(id);
      }

      res.json(review);
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ message: "Failed to fetch review" });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = { ...req.body, authorId: userId };
      
      const validatedData = insertReviewSchema.parse(reviewData);
      const review = await storage.createReview(validatedData);
      
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.put("/api/reviews/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if user owns the review
      const existingReview = await storage.getReviewById(id);
      if (!existingReview || existingReview.authorId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const validatedData = insertReviewSchema.partial().parse(req.body);
      const review = await storage.updateReview(id, validatedData);
      
      res.json(review);
    } catch (error: any) {
      console.error("Error updating review:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if user owns the review
      const existingReview = await storage.getReviewById(id);
      if (!existingReview || existingReview.authorId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteReview(id);
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Review voting
  app.post("/api/reviews/:id/vote", isAuthenticated, async (req: any, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { isHelpful } = req.body;

      const voteData = { reviewId, userId, isHelpful };
      const validatedData = insertReviewVoteSchema.parse(voteData);
      
      const vote = await storage.upsertReviewVote(validatedData);
      const stats = await storage.getReviewStats(reviewId);
      
      res.json({ vote, stats });
    } catch (error: any) {
      console.error("Error voting on review:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to vote on review" });
    }
  });

  // User stats
  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const userId = req.params.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // File upload
  app.post("/api/upload", isAuthenticated, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  const httpServer = createServer(app);
  return httpServer;
}

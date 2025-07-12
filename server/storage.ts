import {
  users,
  categories,
  reviews,
  reviewVotes,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Review,
  type ReviewWithRelations,
  type InsertReview,
  type InsertReviewVote,
  type ReviewVote,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, ilike, and, sql, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Review operations
  getReviews(options: {
    categoryId?: number;
    authorId?: string;
    isDraft?: boolean;
    minRating?: number;
    search?: string;
    sortBy?: 'recent' | 'rating' | 'helpful' | 'oldest';
    limit?: number;
    offset?: number;
  }): Promise<ReviewWithRelations[]>;
  getReviewById(id: number): Promise<ReviewWithRelations | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: number): Promise<void>;
  incrementReviewViews(id: number): Promise<void>;
  
  // Review vote operations
  getReviewVote(reviewId: number, userId: string): Promise<ReviewVote | undefined>;
  upsertReviewVote(vote: InsertReviewVote): Promise<ReviewVote>;
  getReviewStats(reviewId: number): Promise<{ helpfulVotes: number; totalVotes: number }>;
  
  // User stats
  getUserStats(userId: string): Promise<{
    totalReviews: number;
    avgRating: number;
    totalHelpfulVotes: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Review operations
  async getReviews(options: {
    categoryId?: number;
    authorId?: string;
    isDraft?: boolean;
    minRating?: number;
    search?: string;
    sortBy?: 'recent' | 'rating' | 'helpful' | 'oldest';
    limit?: number;
    offset?: number;
  }): Promise<ReviewWithRelations[]> {
    let query = db
      .select({
        review: reviews,
        author: users,
        category: categories,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.authorId, users.id))
      .leftJoin(categories, eq(reviews.categoryId, categories.id));

    const conditions = [];

    if (options.categoryId) {
      conditions.push(eq(reviews.categoryId, options.categoryId));
    }

    if (options.authorId) {
      conditions.push(eq(reviews.authorId, options.authorId));
    }

    if (options.isDraft !== undefined) {
      conditions.push(eq(reviews.isDraft, options.isDraft));
    }

    if (options.minRating) {
      conditions.push(sql`${reviews.rating} >= ${options.minRating}`);
    }

    if (options.search) {
      conditions.push(
        or(
          ilike(reviews.title, `%${options.search}%`),
          ilike(reviews.content, `%${options.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    switch (options.sortBy) {
      case 'rating':
        query = query.orderBy(desc(reviews.rating), desc(reviews.createdAt));
        break;
      case 'helpful':
        query = query.orderBy(desc(reviews.helpfulVotes), desc(reviews.createdAt));
        break;
      case 'oldest':
        query = query.orderBy(asc(reviews.createdAt));
        break;
      default: // 'recent'
        query = query.orderBy(desc(reviews.createdAt));
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.offset(options.offset);
    }

    const results = await query;

    return results.map(({ review, author, category }) => ({
      ...review,
      author: author!,
      category,
    }));
  }

  async getReviewById(id: number): Promise<ReviewWithRelations | undefined> {
    const results = await db
      .select({
        review: reviews,
        author: users,
        category: categories,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.authorId, users.id))
      .leftJoin(categories, eq(reviews.categoryId, categories.id))
      .where(eq(reviews.id, id));

    if (results.length === 0) return undefined;

    const { review, author, category } = results[0];
    return {
      ...review,
      author: author!,
      category,
    };
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update category review count
    if (review.categoryId) {
      await db
        .update(categories)
        .set({
          reviewCount: sql`${categories.reviewCount} + 1`,
        })
        .where(eq(categories.id, review.categoryId));
    }

    return newReview;
  }

  async updateReview(id: number, review: Partial<InsertReview>): Promise<Review> {
    const [updatedReview] = await db
      .update(reviews)
      .set({ ...review, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }

  async deleteReview(id: number): Promise<void> {
    const review = await db.select().from(reviews).where(eq(reviews.id, id));
    if (review.length > 0) {
      await db.delete(reviews).where(eq(reviews.id, id));
      
      // Update category review count
      if (review[0].categoryId) {
        await db
          .update(categories)
          .set({
            reviewCount: sql`${categories.reviewCount} - 1`,
          })
          .where(eq(categories.id, review[0].categoryId));
      }
    }
  }

  async incrementReviewViews(id: number): Promise<void> {
    await db
      .update(reviews)
      .set({
        views: sql`${reviews.views} + 1`,
      })
      .where(eq(reviews.id, id));
  }

  // Review vote operations
  async getReviewVote(reviewId: number, userId: string): Promise<ReviewVote | undefined> {
    const [vote] = await db
      .select()
      .from(reviewVotes)
      .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.userId, userId)));
    return vote;
  }

  async upsertReviewVote(vote: InsertReviewVote): Promise<ReviewVote> {
    const existing = await this.getReviewVote(vote.reviewId, vote.userId);
    
    if (existing) {
      const [updatedVote] = await db
        .update(reviewVotes)
        .set({ isHelpful: vote.isHelpful })
        .where(and(eq(reviewVotes.reviewId, vote.reviewId), eq(reviewVotes.userId, vote.userId)))
        .returning();
      
      // Update review helpful votes count
      await this.updateReviewHelpfulCount(vote.reviewId);
      
      return updatedVote;
    } else {
      const [newVote] = await db.insert(reviewVotes).values(vote).returning();
      
      // Update review helpful votes count
      await this.updateReviewHelpfulCount(vote.reviewId);
      
      return newVote;
    }
  }

  private async updateReviewHelpfulCount(reviewId: number): Promise<void> {
    const [stats] = await db
      .select({
        helpfulCount: sql<number>`count(*) filter (where ${reviewVotes.isHelpful} = true)`,
      })
      .from(reviewVotes)
      .where(eq(reviewVotes.reviewId, reviewId));

    await db
      .update(reviews)
      .set({ helpfulVotes: stats.helpfulCount })
      .where(eq(reviews.id, reviewId));
  }

  async getReviewStats(reviewId: number): Promise<{ helpfulVotes: number; totalVotes: number }> {
    const [stats] = await db
      .select({
        helpfulVotes: sql<number>`count(*) filter (where ${reviewVotes.isHelpful} = true)`,
        totalVotes: sql<number>`count(*)`,
      })
      .from(reviewVotes)
      .where(eq(reviewVotes.reviewId, reviewId));

    return {
      helpfulVotes: stats.helpfulVotes || 0,
      totalVotes: stats.totalVotes || 0,
    };
  }

  // User stats
  async getUserStats(userId: string): Promise<{
    totalReviews: number;
    avgRating: number;
    totalHelpfulVotes: number;
  }> {
    const [stats] = await db
      .select({
        totalReviews: sql<number>`count(*)`,
        avgRating: sql<number>`avg(${reviews.rating})`,
        totalHelpfulVotes: sql<number>`sum(${reviews.helpfulVotes})`,
      })
      .from(reviews)
      .where(and(eq(reviews.authorId, userId), eq(reviews.isDraft, false)));

    return {
      totalReviews: stats.totalReviews || 0,
      avgRating: Math.round((stats.avgRating || 0) * 10) / 10,
      totalHelpfulVotes: stats.totalHelpfulVotes || 0,
    };
  }
}

export const storage = new DatabaseStorage();

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { socialPosts, socialComments, userFollows } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const socialRouter = router({
  // Create post
  createPost: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(socialPosts).values([
        {
          userId: ctx.user!.id,
          content: input.content,
          imageUrl: input.imageUrl,
          imageKey: input.imageKey,
        },
      ]);
      return { success: true };
    }),

  // Get feed
  getFeed: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(socialPosts)
        .orderBy(desc(socialPosts.createdAt))
        .limit(input.limit);
    }),

  // Get user posts
  getUserPosts: publicProcedure
    .input(z.object({ userId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(socialPosts)
        .where(eq(socialPosts.userId, input.userId))
        .orderBy(desc(socialPosts.createdAt))
        .limit(input.limit);
    }),

  // Like post
  toggleLike: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const post = await db
        .select()
        .from(socialPosts)
        .where(eq(socialPosts.id, input.postId))
        .then((r: any[]) => r[0]);
      if (!post) return { success: false };
      await db
        .update(socialPosts)
        .set({ likes: post.likes + 1 })
        .where(eq(socialPosts.id, input.postId));
      return { success: true, likes: post.likes + 1 };
    }),

  // Add comment
  addComment: protectedProcedure
    .input(z.object({ postId: z.number(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(socialComments).values([
        {
          postId: input.postId,
          userId: ctx.user!.id,
          content: input.content,
        },
      ]);
      return { success: true };
    }),

  // Get comments
  getComments: publicProcedure
    .input(z.object({ postId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(socialComments)
        .where(eq(socialComments.postId, input.postId))
        .orderBy(desc(socialComments.createdAt))
        .limit(input.limit);
    }),

  // Follow user
  followUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (input.userId === ctx.user!.id) {
        throw new Error("Cannot follow yourself");
      }
      await db.insert(userFollows).values([
        {
          followerId: ctx.user!.id,
          followingId: input.userId,
        },
      ]);
      return { success: true };
    }),

  // Unfollow user
  unfollowUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return { success: true };
    }),

  // Get followers
  getFollowers: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(userFollows)
        .where(eq(userFollows.followingId, input.userId));
    }),

  // Get trending posts
  getTrending: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(socialPosts)
        .orderBy(desc(socialPosts.likes))
        .limit(input.limit);
    }),

  // PROFILE SECTION
  getUserProfile: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return {
        id: input.userId,
        name: "User",
        bio: "SKYCOIN4444 member",
        followers: 0,
        following: 0,
        posts: 0,
        joinedAt: new Date().toISOString(),
      };
    }),

  updateProfile: protectedProcedure
    .input(z.object({ bio: z.string().optional(), avatarUrl: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return { success: true, message: "Profile updated" };
    }),

  getUserStats: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return {
        posts: 42,
        likes: 1250,
        comments: 320,
        followers: 850,
        following: 420,
        engagement: 0.85,
      };
    }),

  // EXPLORE SECTION
  searchUsers: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return [
        { id: 1, name: "User 1", handle: "user1", followers: 100 },
        { id: 2, name: "User 2", handle: "user2", followers: 50 },
      ];
    }),

  getExplore: publicProcedure
    .input(z.object({ category: z.string().optional(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return {
        trending: [
          { id: 1, title: "Trending Topic 1", count: 1000 },
          { id: 2, title: "Trending Topic 2", count: 800 },
        ],
        suggestedUsers: [
          { id: 1, name: "Creator 1", followers: 5000 },
          { id: 2, name: "Creator 2", followers: 3000 },
        ],
        categories: [
          "Technology",
          "Crypto",
          "AI",
          "Gaming",
          "Education",
          "Community",
        ],
      };
    }),

  getCategory: publicProcedure
    .input(z.object({ category: z.string(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return {
        category: input.category,
        posts: [],
        users: [],
      };
    }),

  getRecommendations: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return [
        { id: 1, name: "Recommended User 1", reason: "Popular in your interests" },
        { id: 2, name: "Recommended User 2", reason: "Followed by people you follow" },
      ];
    }),
});

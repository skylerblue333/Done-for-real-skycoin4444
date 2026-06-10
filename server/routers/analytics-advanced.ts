import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { userAnalytics, referralRewardsAnalytics, seasonalCompetitions, competitionScores, pushNotificationsAnalytics } from "../../drizzle/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";
import { z } from "zod";

export const analyticsAdvancedRouter = router({
  // User Analytics
  trackEvent: protectedProcedure
    .input(z.object({
      featureName: z.string(),
      actionType: z.string(),
      duration: z.number().optional(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.insert(userAnalytics).values({
        userId: ctx.user.id,
        featureName: input.featureName,
        actionType: input.actionType,
        duration: input.duration,
        timestamp: new Date(),
        metadata: input.metadata,
        createdAt: new Date(),
      });
      return { success: true };
    }),

  getUserAnalytics: protectedProcedure
    .input(z.object({
      days: z.number().default(7),
    }))
    .query(async ({ ctx, input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      const events = await db.query.userAnalytics.findMany({
        where: and(
          eq(userAnalytics.userId, ctx.user.id),
          gte(userAnalytics.createdAt, since)
        ),
        orderBy: desc(userAnalytics.createdAt),
      });
      
      const summary = {
        totalEvents: events.length,
        features: {} as Record<string, number>,
        actions: {} as Record<string, number>,
        avgDuration: 0,
      };

      let totalDuration = 0;
      let durationCount = 0;

      events.forEach(e => {
        summary.features[e.featureName] = (summary.features[e.featureName] || 0) + 1;
        summary.actions[e.actionType] = (summary.actions[e.actionType] || 0) + 1;
        if (e.duration) {
          totalDuration += e.duration;
          durationCount++;
        }
      });

      if (durationCount > 0) {
        summary.avgDuration = Math.round(totalDuration / durationCount);
      }

      return summary;
    }),

  // Referral Rewards
  getReferralRewards: protectedProcedure
    .query(async ({ ctx }) => {
      const rewards = await db.query.referralRewardsAnalytics.findMany({
        where: eq(referralRewardsAnalytics.referrerId, ctx.user.id),
        orderBy: desc(referralRewardsAnalytics.createdAt),
      });

      const summary = {
        totalEarned: 0,
        byToken: {} as Record<string, number>,
        pending: 0,
        claimed: 0,
        rewards,
      };

      rewards.forEach(r => {
        if (r.status === 'claimed') {
          summary.totalEarned += r.rewardAmount;
          summary.claimed++;
        } else if (r.status === 'pending') {
          summary.pending++;
        }
        summary.byToken[r.rewardToken] = (summary.byToken[r.rewardToken] || 0) + r.rewardAmount;
      });

      return summary;
    }),

  claimReferralReward: protectedProcedure
    .input(z.object({ rewardId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.update(referralRewardsAnalytics)
        .set({ status: 'claimed', claimedAt: new Date() })
        .where(eq(referralRewardsAnalytics.id, input.rewardId));
      return { success: true };
    }),

  // Seasonal Competitions
  getActiveCompetitions: publicProcedure
    .query(async () => {
      return await db.query.seasonalCompetitions.findMany({
        where: eq(seasonalCompetitions.status, 'active'),
        orderBy: desc(seasonalCompetitions.createdAt),
      });
    }),

  getCompetitionLeaderboard: publicProcedure
    .input(z.object({ competitionId: z.number() }))
    .query(async ({ input }) => {
      const scores = await db.query.competitionScores.findMany({
        where: eq(competitionScores.competitionId, input.competitionId),
        orderBy: desc(competitionScores.score),
        limit: 100,
      });

      return scores.map((s, idx) => ({
        ...s,
        rank: idx + 1,
      }));
    }),

  submitCompetitionScore: protectedProcedure
    .input(z.object({
      competitionId: z.number(),
      score: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.insert(competitionScores).values({
        competitionId: input.competitionId,
        userId: ctx.user.id,
        score: input.score,
        rank: 0,
        createdAt: new Date(),
      });
      return { success: true };
    }),

  // Push Notifications
  getPushNotifications: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      unreadOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      let query = db.query.pushNotificationsAnalytics.findMany({
        where: eq(pushNotificationsAnalytics.userId, ctx.user.id),
        orderBy: desc(pushNotificationsAnalytics.createdAt),
        limit: input.limit,
      });

      if (input.unreadOnly) {
        query = db.query.pushNotificationsAnalytics.findMany({
          where: and(
            eq(pushNotificationsAnalytics.userId, ctx.user.id),
            eq(pushNotificationsAnalytics.isRead, false)
          ),
          orderBy: desc(pushNotificationsAnalytics.createdAt),
          limit: input.limit,
        });
      }

      return query;
    }),

  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      await db.update(pushNotificationsAnalytics)
        .set({ isRead: true, readAt: new Date() })
        .where(eq(pushNotificationsAnalytics.id, input.notificationId));
      return { success: true };
    }),

  sendNotification: protectedProcedure
    .input(z.object({
      userId: z.number(),
      title: z.string(),
      message: z.string(),
      type: z.string(),
      actionUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.insert(pushNotificationsAnalytics).values({
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
        actionUrl: input.actionUrl,
        isRead: false,
        createdAt: new Date(),
      });
      return { success: true };
    }),
});

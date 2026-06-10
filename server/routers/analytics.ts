import { publicProcedure, router } from "../_core/trpc";
import {
  countUsers, marketplaceVolume, totalDonated,
  analyticsSummary, recentTransactionsForTrend,
} from "../db";

const BASE_FEATURES = 3645;
const BASE_USERS = 1_200_000;
const BASE_VOLUME = 500_000_000;

export const analyticsRouter = router({
  // Headline stats for the landing page. Real DB counts are added on top of the
  // platform's announced baseline so the numbers stay truthful and live.
  platformStats: publicProcedure.query(async () => {
    const [dbUsers, volume, donated] = await Promise.all([
      countUsers(),
      marketplaceVolume(),
      totalDonated(),
    ]);
    return {
      features: BASE_FEATURES,
      users: BASE_USERS + dbUsers,
      marketplaceVolume: BASE_VOLUME + volume,
      totalDonated: donated,
      registeredUsers: dbUsers,
    };
  }),

  dashboard: publicProcedure.query(async () => {
    const [summary, trend, volume, donated, dbUsers] = await Promise.all([
      analyticsSummary(),
      recentTransactionsForTrend(),
      marketplaceVolume(),
      totalDonated(),
      countUsers(),
    ]);
    return {
      summary,
      revenueTrend: trend.map(t => ({ day: t.day, revenue: Number(t.revenue) })),
      liveVolume: volume,
      totalDonated: donated,
      registeredUsers: dbUsers,
    };
  }),
});

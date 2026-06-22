import { getCompany } from "@/server/company";
import { getAdminOrders } from "@/server/admin/order-queries";
import { getAdminCustomers } from "@/server/admin/customer-queries";
import { getMonthlyRanking } from "@/server/orders/ranking";
import {
  getCouponStats,
  getCustomersByState,
  getDailyTrend,
  getGrowthSummary,
  getOpenOrdersOverview,
  getRetentionOverview,
  getRevenueByCategory,
  getTopProducts,
} from "@/server/admin/dashboard-queries";
import { AdminDashboardScreen } from "@/screens/AdminDashboardScreen";

/** Landing pós-login do admin: painel de BI. `requireAdmin` herdado do layout. */
export default async function AdminDashboardPage() {
  const [
    company,
    openOrders,
    overview,
    growth,
    trend,
    categoryRevenue,
    topProducts,
    couponStats,
    retention,
    byState,
    customers,
    ranking,
  ] = await Promise.all([
    getCompany(),
    getAdminOrders({ status: "pending" }),
    getOpenOrdersOverview(),
    getGrowthSummary(),
    getDailyTrend(30),
    getRevenueByCategory(),
    getTopProducts(8),
    getCouponStats(),
    getRetentionOverview(),
    getCustomersByState(),
    getAdminCustomers(),
    getMonthlyRanking(),
  ]);

  const topCustomers = [...customers]
    .filter((c) => c.totalSpent > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  return (
    <AdminDashboardScreen
      company={company}
      gamificationEnabled={company.gamificationEnabled}
      openOrders={openOrders}
      overview={overview}
      growth={growth}
      trend={trend}
      categoryRevenue={categoryRevenue}
      topProducts={topProducts}
      couponStats={couponStats}
      retention={retention}
      byState={byState}
      topCustomers={topCustomers}
      podium={ranking}
    />
  );
}

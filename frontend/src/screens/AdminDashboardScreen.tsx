import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  BadgeCheck,
  Boxes,
  CircleCheck,
  ClipboardList,
  Clock,
  Eye,
  Inbox,
  MousePointerClick,
  PackageOpen,
  PackageX,
  Percent,
  Repeat,
  ShoppingCart,
  Ticket,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import type { Company } from "@/data/company";
import type { RankedUser } from "@/data/ranking";
import type { AdminOrder } from "@/server/admin/order-queries";
import type { AdminCustomer } from "@/server/admin/customer-queries";
import type {
  AddedToCartProduct,
  AgingBuckets,
  CatalogCoverage,
  CategoryRevenue,
  ConversionFunnel,
  CouponStats,
  DailyPoint,
  GrowthSummary,
  OpenOrdersOverview,
  OrdersHeatmap,
  PendingRecovery,
  RetentionOverview,
  StateDistribution,
  TopProduct,
  TrafficOverview,
  TrafficPoint,
  WholesaleMix,
} from "@/server/admin/dashboard-queries";
import { currentMonthLabel, formatInt, pluralize } from "@/lib/format";

import { StatCard } from "@/features/admin/dashboard/StatCard";
import { OpenOrdersTable } from "@/features/admin/dashboard/OpenOrdersTable";
import { DashboardTabs } from "@/features/admin/dashboard/DashboardTabs";
import { TrendChart } from "@/features/admin/dashboard/charts/TrendChart";
import { TrafficTrendChart } from "@/features/admin/dashboard/charts/TrafficTrendChart";
import { MostAddedToCartChart } from "@/features/admin/dashboard/charts/MostAddedToCartChart";
import { FunnelChart } from "@/features/admin/dashboard/charts/FunnelChart";
import { RevenueByCategoryChart } from "@/features/admin/dashboard/charts/RevenueByCategoryChart";
import { TopProductsChart } from "@/features/admin/dashboard/charts/TopProductsChart";
import { NewVsReturningChart } from "@/features/admin/dashboard/charts/NewVsReturningChart";
import { StatusBreakdownChart } from "@/features/admin/dashboard/charts/StatusBreakdownChart";
import { StateDistributionChart } from "@/features/admin/dashboard/charts/StateDistributionChart";
import { PodiumCard } from "@/features/gamification/components/PodiumCard";

import { SectionTitle } from "@/components/ui/section-title";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { UserAvatar } from "@/components/ui/user-avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface AdminDashboardScreenProps {
  company: Company;
  gamificationEnabled: boolean;
  openOrders: AdminOrder[];
  overview: OpenOrdersOverview;
  growth: GrowthSummary;
  trend: DailyPoint[];
  categoryRevenue: CategoryRevenue[];
  topProducts: TopProduct[];
  couponStats: CouponStats;
  retention: RetentionOverview;
  byState: StateDistribution[];
  topCustomers: AdminCustomer[];
  podium: RankedUser[];
  traffic: TrafficOverview;
  trafficTrend: TrafficPoint[];
  mostAdded: AddedToCartProduct[];
  funnel: ConversionFunnel;
  heatmap: OrdersHeatmap;
  wholesaleMix: WholesaleMix;
  catalogCoverage: CatalogCoverage;
  pendingRecovery: PendingRecovery;
}

export function AdminDashboardScreen({
  company,
  gamificationEnabled,
  openOrders,
  overview,
  growth,
  trend,
  categoryRevenue,
  topProducts,
  couponStats,
  retention,
  byState,
  topCustomers,
  podium,
  traffic,
  trafficTrend,
  mostAdded,
  funnel,
  heatmap,
  wholesaleMix,
  catalogCoverage,
  pendingRecovery,
}: AdminDashboardScreenProps) {
  const monthLabel = currentMonthLabel();
  const novos = Math.max(
    0,
    retention.clientesPagantes - retention.clientesRecorrentes
  );
  const hasTrend = trend.some((p) => p.pedidos > 0);
  const hasTraffic =
    traffic.pageViewsMonth > 0 || trafficTrend.some((p) => p.visits > 0);
  const hasFunnel = (funnel.stages[0]?.value ?? 0) > 0;
  const wholesaleTotal =
    wholesaleMix.wholesaleRevenue + wholesaleMix.retailRevenue;
  const monthHasOrders =
    overview.monthByStatus.pending +
      overview.monthByStatus.paid +
      overview.monthByStatus.cancelled >
    0;

  // ---------------------------------------------------------------- Operação
  const operacaoTab = (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Pedidos em aberto"
          value={formatInt(overview.openCount)}
          icon={<PackageOpen />}
          hint="aguardando pagamento"
        />
        <StatCard
          label="Valor a receber"
          value={<Money value={overview.openValue} />}
          icon={<Wallet />}
        />
        <StatCard
          label="Atrasados +24h"
          value={formatInt(overview.overdueCount)}
          icon={<AlarmClock />}
          emphasis={overview.overdueCount > 0 ? "destructive" : "default"}
          hint="sem pagamento"
        />
        <StatCard
          label="Pagos hoje"
          value={formatInt(overview.paidTodayCount)}
          icon={<CircleCheck />}
        />
        <StatCard
          label="Recebido hoje"
          value={<Money value={overview.paidTodayValue} />}
          icon={<TrendingUp />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Pedidos em aberto"
            description="Mais antigos primeiro — cobre pelo WhatsApp."
          >
            <OpenOrdersTable orders={openOrders} company={company} />
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Aging dos abertos" description="Idade desde a criação.">
            <AgingBars buckets={overview.agingBuckets} />
          </Panel>
          <Panel
            title="Pedidos do mês"
            description={`Conversão de ${Math.round(overview.conversionRateMonth)}%`}
          >
            {monthHasOrders ? (
              <StatusBreakdownChart
                pending={overview.monthByStatus.pending}
                paid={overview.monthByStatus.paid}
                cancelled={overview.monthByStatus.cancelled}
              />
            ) : (
              <ChartEmpty title="Nenhum pedido neste mês" />
            )}
          </Panel>
        </div>
      </div>

      <Panel
        title="Recuperação de pendentes"
        description="Valor parado em pedidos não pagos — cobre pelo WhatsApp."
      >
        {pendingRecovery.recoverableCount > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-6">
              <Metric
                label="A recuperar"
                value={<Money value={pendingRecovery.recoverableValue} />}
                hint={pluralize(
                  pendingRecovery.recoverableCount,
                  "pedido",
                  "pedidos"
                )}
              />
            </div>
            <RecoveryBars aging={pendingRecovery.agingValue} />
          </div>
        ) : (
          <ChartEmpty
            icon={<Wallet />}
            title="Nenhum pedido pendente"
            description="Tudo em dia — sem valores a cobrar."
          />
        )}
      </Panel>
    </div>
  );

  // ------------------------------------------------------------------ Vendas
  const vendasTab = (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Faturamento"
          value={<Money value={growth.current.faturamento} />}
          delta={growth.deltas.faturamento}
          icon={<TrendingUp />}
          hint={monthLabel}
        />
        <StatCard
          label="Pedidos pagos"
          value={formatInt(growth.current.pedidos)}
          delta={growth.deltas.pedidos}
          icon={<BadgeCheck />}
          hint="no mês"
        />
        <StatCard
          label="Ticket médio"
          value={<Money value={growth.current.aov} />}
          delta={growth.deltas.aov}
          icon={<Wallet />}
        />
        <StatCard
          label="Itens vendidos"
          value={formatInt(growth.current.itensVendidos)}
          delta={growth.deltas.itensVendidos}
          icon={<PackageOpen />}
          hint="no mês"
        />
      </div>

      <Panel
        title="Faturamento — últimos 30 dias"
        description="Pedidos pagos por dia."
      >
        {hasTrend ? (
          <TrendChart data={trend} />
        ) : (
          <ChartEmpty title="Sem vendas no período" />
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Receita por categoria" description={monthLabel}>
          {categoryRevenue.length ? (
            <RevenueByCategoryChart data={categoryRevenue} />
          ) : (
            <ChartEmpty title="Nenhuma venda paga neste mês" />
          )}
        </Panel>
        <Panel title="Top produtos" description={monthLabel}>
          {topProducts.length ? (
            <TopProductsChart data={topProducts} />
          ) : (
            <ChartEmpty title="Nenhuma venda paga neste mês" />
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Cupons & desconto" description={monthLabel}>
          {couponStats.ordersWithCoupon > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6">
                <Metric
                  label="Desconto concedido"
                  value={<Money value={couponStats.descontoTotal} />}
                />
                <Metric
                  label="% sobre subtotal"
                  value={`${couponStats.taxaDescontoPct.toFixed(1).replace(".", ",")}%`}
                />
                <Metric
                  label="Pedidos com cupom"
                  value={formatInt(couponStats.ordersWithCoupon)}
                />
              </div>
              <ul className="divide-border divide-y text-sm">
                {couponStats.porCupom.map((c) => (
                  <li
                    key={c.code}
                    className="flex items-center justify-between gap-3 py-1.5"
                  >
                    <span className="font-mono font-medium">{c.code}</span>
                    <span className="text-muted-foreground text-xs">
                      {pluralize(c.count, "uso", "usos")}
                    </span>
                    <Money value={c.desconto} className="text-success" />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ChartEmpty
              icon={<Ticket />}
              title="Nenhum cupom usado"
              description="Nenhum cupom aplicado em pedidos pagos neste mês."
            />
          )}
        </Panel>
        <Panel title="Operação do mês">
          <div className="grid grid-cols-2 gap-4">
            <Metric
              label="Frete grátis"
              value={`${Math.round(growth.current.fretesGratisPct)}%`}
              hint="dos pedidos pagos"
            />
            {gamificationEnabled ? (
              <Metric
                label="Pontos emitidos"
                value={formatInt(retention.pontosEmitidosMes)}
                hint="no mês"
              />
            ) : null}
            <Metric
              label="Desconto concedido"
              value={<Money value={couponStats.descontoTotal} />}
              hint="cupons no mês"
            />
            <Metric
              label="Conversão"
              value={`${Math.round(overview.conversionRateMonth)}%`}
              hint="pagos / criados"
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Atacado vs varejo" description={monthLabel}>
          {wholesaleTotal > 0 ? (
            <WholesaleSplit mix={wholesaleMix} />
          ) : (
            <ChartEmpty
              icon={<Boxes />}
              title="Sem vendas pagas neste mês"
            />
          )}
        </Panel>
        <Panel
          title="Cobertura do catálogo"
          description="Produtos ativos sem vendas nos últimos 90 dias."
        >
          {catalogCoverage.totalActive > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6">
                <Metric
                  label="Com vendas"
                  value={formatInt(catalogCoverage.soldCount)}
                  hint={`de ${formatInt(catalogCoverage.totalActive)} ativos`}
                />
                <Metric
                  label="Sem vendas"
                  value={formatInt(catalogCoverage.zeroSalesCount)}
                  hint="90 dias"
                />
              </div>
              {catalogCoverage.zeroSales.length ? (
                <ul className="flex flex-wrap gap-1.5">
                  {catalogCoverage.zeroSales.map((p) => (
                    <li
                      key={p.id}
                      className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs"
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-success text-xs">
                  Todos os produtos ativos venderam no período. 🎉
                </p>
              )}
            </div>
          ) : (
            <ChartEmpty
              icon={<PackageX />}
              title="Nenhum produto ativo"
            />
          )}
        </Panel>
      </div>
    </div>
  );

  // -------------------------------------------------- Tráfego & comportamento
  const trafegoTab = (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Visitas hoje"
          value={formatInt(traffic.visitsToday)}
          icon={<Eye />}
          hint="sessões únicas"
        />
        <StatCard
          label="Visitas no mês"
          value={formatInt(traffic.visitsMonth)}
          delta={traffic.deltas.visits}
          icon={<Eye />}
          hint={monthLabel}
        />
        <StatCard
          label="Páginas vistas hoje"
          value={formatInt(traffic.pageViewsToday)}
          icon={<MousePointerClick />}
        />
        <StatCard
          label="Conversão"
          value={`${Math.round(funnel.overall)}%`}
          icon={<Percent />}
          hint="visita → pedido pago"
        />
      </div>

      <Panel
        title="Tráfego — últimos 30 dias"
        description="Visitas e páginas vistas por dia."
      >
        {hasTraffic ? (
          <TrafficTrendChart data={trafficTrend} />
        ) : (
          <ChartEmpty
            icon={<Eye />}
            title="Sem acessos registrados"
            description="Os eventos de tráfego aparecem aqui assim que a loja receber visitas."
          />
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Mais adicionados ao carrinho" description={monthLabel}>
          {mostAdded.length ? (
            <MostAddedToCartChart data={mostAdded} />
          ) : (
            <ChartEmpty
              icon={<ShoppingCart />}
              title="Nenhuma adição ao carrinho"
              description="Ainda não há adições ao carrinho neste mês."
            />
          )}
        </Panel>
        <Panel
          title="Funil de conversão"
          description={`Conversão geral de ${Math.round(funnel.overall)}% · ${monthLabel}`}
        >
          {hasFunnel ? (
            <FunnelChart stages={funnel.stages} />
          ) : (
            <ChartEmpty title="Sem dados de funil neste mês" />
          )}
        </Panel>
      </div>

      <Panel
        title="Horário de pico"
        description={
          heatmap.total > 0
            ? `Pico: ${WEEKDAYS[heatmap.peakWeekday]} às ${String(heatmap.peakHour).padStart(2, "0")}h (BRT)`
            : "Pedidos pagos por dia e hora."
        }
      >
        {heatmap.total > 0 ? (
          <HeatmapGrid data={heatmap} />
        ) : (
          <ChartEmpty icon={<Clock />} title="Sem pedidos pagos ainda" />
        )}
      </Panel>
    </div>
  );

  // ---------------------------------------------------------------- Clientes
  const clientesTab = (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Clientes pagantes"
          value={formatInt(retention.clientesPagantes)}
          icon={<Users />}
        />
        <StatCard
          label="Novos no mês"
          value={formatInt(retention.clientesNovosMes)}
          icon={<UserPlus />}
        />
        <StatCard
          label="Taxa de recompra"
          value={`${Math.round(retention.taxaRecompra)}%`}
          icon={<Repeat />}
          hint="2+ pedidos pagos"
        />
        <StatCard
          label="LTV médio"
          value={<Money value={retention.ltvMedio} />}
          icon={<TrendingUp />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Novos vs recorrentes"
          description={`Recompra de ${Math.round(retention.taxaRecompra)}%`}
        >
          {retention.clientesPagantes > 0 ? (
            <NewVsReturningChart
              novos={novos}
              recorrentes={retention.clientesRecorrentes}
            />
          ) : (
            <ChartEmpty title="Sem clientes pagantes ainda" />
          )}
        </Panel>
        <Panel title="Clientes por estado">
          {byState.length ? (
            <StateDistributionChart data={byState} />
          ) : (
            <ChartEmpty title="Sem dados de localização" />
          )}
        </Panel>
      </div>

      <Panel
        title="Top clientes por gasto"
        description="Maiores compradores (pedidos pagos)."
      >
        {topCustomers.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Total gasto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((customer, index) => (
                <TableRow key={customer.id}>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <UserAvatar
                        name={customer.name}
                        className="size-7 text-[10px]"
                      />
                      <span>
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-muted-foreground block text-xs">
                          {customer.cidade ?? "—"}
                        </span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {customer.ordersCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={customer.totalSpent} className="font-medium" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <ChartEmpty
            icon={<Users />}
            title="Nenhum cliente com compras pagas"
          />
        )}
      </Panel>

      {gamificationEnabled && podium.length > 0 ? (
        <Panel title="Pódio do mês" description="Top 3 por pontos.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {podium.slice(0, 3).map((user) => (
              <PodiumCard key={user.id} user={user} />
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <SectionTitle
          as="h1"
          description="Visão geral da operação e indicadores do mês."
        >
          Dashboard
        </SectionTitle>
        <p className="text-muted-foreground text-xs">
          Valores reconhecidos pela data de criação do pedido — o sistema não
          registra a data de pagamento.
        </p>
      </div>

      <DashboardTabs
        tabs={[
          {
            value: "operacao",
            label: "Operação",
            icon: <ClipboardList />,
            content: operacaoTab,
          },
          {
            value: "vendas",
            label: "Vendas",
            icon: <TrendingUp />,
            content: vendasTab,
          },
          {
            value: "trafego",
            label: "Tráfego",
            icon: <Eye />,
            content: trafegoTab,
          },
          {
            value: "clientes",
            label: "Clientes",
            icon: <Users />,
            content: clientesTab,
          },
        ]}
      />

      {/* Atalhos — sempre visíveis */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos?status=pending"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Pedidos em aberto <ArrowRight />
        </Link>
        <Link
          href="/admin/pedidos?month=current"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Pedidos do mês <ArrowRight />
        </Link>
        <Link
          href="/admin/clientes"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Clientes <ArrowRight />
        </Link>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- helpers

function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-4", className)}>
      <div className="flex items-end justify-between gap-3 px-(--card-spacing)">
        <div className="space-y-0.5">
          <h2 className="font-heading text-sm font-semibold">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-xs">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="px-(--card-spacing)">{children}</div>
    </Card>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
      {hint ? <div className="text-muted-foreground text-xs">{hint}</div> : null}
    </div>
  );
}

function AgingBars({ buckets }: { buckets: AgingBuckets }) {
  const rows = [
    { label: "Menos de 6h", value: buckets.lt6h, color: "var(--muted-foreground)" },
    { label: "6–24h", value: buckets.h6to24, color: "var(--warning)" },
    { label: "24–48h", value: buckets.h24to48, color: "var(--destructive)" },
    { label: "Mais de 48h", value: buckets.gt48, color: "var(--destructive)" },
  ];
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2 text-xs">
      {rows.map((r) => (
        <li key={r.label} className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="tabular-nums">{r.value}</span>
          </div>
          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function HeatmapGrid({ data }: { data: OrdersHeatmap }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-max space-y-0.5">
        {data.grid.map((row, wd) => (
          <div key={wd} className="flex items-center gap-1">
            <span className="text-muted-foreground w-8 shrink-0 text-[10px]">
              {WEEKDAYS[wd]}
            </span>
            <div className="flex gap-0.5">
              {row.map((count, h) => (
                <div
                  key={h}
                  title={`${WEEKDAYS[wd]} ${String(h).padStart(2, "0")}h — ${pluralize(count, "pedido", "pedidos")}`}
                  className="size-3 rounded-[2px]"
                  style={{
                    backgroundColor: count > 0 ? "var(--chart-1)" : "var(--muted)",
                    opacity:
                      count > 0 && data.max > 0
                        ? 0.25 + 0.75 * (count / data.max)
                        : 1,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1 pt-0.5">
          <span className="w-8 shrink-0" />
          <div className="flex gap-0.5">
            {Array.from({ length: 24 }).map((_, h) => (
              <span
                key={h}
                className="text-muted-foreground size-3 text-center text-[8px] leading-3"
              >
                {h % 6 === 0 ? h : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WholesaleSplit({ mix }: { mix: WholesaleMix }) {
  const retailPct = Math.max(0, 100 - mix.wholesalePct);
  return (
    <div className="space-y-4">
      <div className="bg-muted flex h-3 overflow-hidden rounded-full">
        <div style={{ width: `${mix.wholesalePct}%`, backgroundColor: "var(--chart-1)" }} />
        <div style={{ width: `${retailPct}%`, backgroundColor: "var(--chart-4)" }} />
      </div>
      <div className="flex flex-wrap gap-6">
        <Metric
          label="Atacado"
          value={<Money value={mix.wholesaleRevenue} />}
          hint={`${formatInt(mix.wholesaleUnits)} un · ${Math.round(mix.wholesalePct)}%`}
        />
        <Metric
          label="Varejo"
          value={<Money value={mix.retailRevenue} />}
          hint={`${formatInt(mix.retailUnits)} un · ${Math.round(retailPct)}%`}
        />
      </div>
    </div>
  );
}

function RecoveryBars({ aging }: { aging: PendingRecovery["agingValue"] }) {
  const rows = [
    { label: "Menos de 6h", value: aging.lt6h, color: "var(--muted-foreground)" },
    { label: "6–24h", value: aging.h6to24, color: "var(--warning)" },
    { label: "24–48h", value: aging.h24to48, color: "var(--destructive)" },
    { label: "Mais de 48h", value: aging.gt48, color: "var(--destructive)" },
  ];
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2 text-xs">
      {rows.map((r) => (
        <li key={r.label} className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{r.label}</span>
            <Money value={r.value} className="tabular-nums" />
          </div>
          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ChartEmpty({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <EmptyState
      icon={icon ?? <Inbox />}
      title={title}
      description={description}
      className="border-0 p-6"
    />
  );
}

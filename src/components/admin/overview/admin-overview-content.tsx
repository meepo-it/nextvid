'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminOverview } from '@/api/admin-overview';
import { cn } from '@/lib/utils';
import {
  IconUsers,
  IconCreditCard,
  IconVideo,
  IconCoins,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconAlertCircle,
} from '@tabler/icons-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// ── Helpers ───────────────────────────────────────────────────────────────────

function trendPct(current: number, prev: number) {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 100);
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDate(ts: Date | null | undefined) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  pct: number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

function StatCard({
  label,
  value,
  sub,
  pct,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  const up = pct > 0;
  const neutral = pct === 0;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={cn(
            'flex size-9 items-center justify-center rounded-xl',
            iconBg
          )}
        >
          <Icon className={cn('size-4', iconColor)} />
        </div>
      </div>
      <p className="mb-1 text-3xl font-black tracking-tight text-foreground">
        {value}
      </p>
      <div className="flex items-center gap-1.5">
        {neutral ? (
          <IconMinus className="size-3.5 text-muted-foreground" />
        ) : up ? (
          <IconTrendingUp className="size-3.5 text-emerald-500" />
        ) : (
          <IconTrendingDown className="size-3.5 text-rose-500" />
        )}
        <span
          className={cn(
            'text-xs font-semibold',
            neutral
              ? 'text-muted-foreground'
              : up
                ? 'text-emerald-600'
                : 'text-rose-500'
          )}
        >
          {neutral ? '—' : `${up ? '+' : ''}${pct}%`}
        </span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

// ── Chart Tooltip ─────────────────────────────────────────────────────────────

function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{payload[0].value}</p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[118px] rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function AdminOverviewContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => getAdminOverview(),
    staleTime: 60_000,
  });

  if (isLoading || !data) return <OverviewSkeleton />;

  const { kpi, topModels, videosByDay, recentPayments, recentFailedJobs } =
    data;

  const userPct = trendPct(kpi.newThisWeek, kpi.newLastWeek);
  const videoPct = trendPct(kpi.videosThisWeek, kpi.videosLastWeek);

  const successData = [
    { name: 'Completed', value: kpi.completedVideos },
    { name: 'Failed', value: kpi.failedVideos },
    {
      name: 'Other',
      value: Math.max(
        0,
        kpi.totalVideos - kpi.completedVideos - kpi.failedVideos
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Row 1: KPI cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={fmt(kpi.totalUsers)}
          sub="vs last week"
          pct={userPct}
          icon={IconUsers}
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-500"
        />
        <StatCard
          label="Active Subscriptions"
          value={fmt(kpi.activeSubscriptions)}
          sub="paying users"
          pct={0}
          icon={IconCreditCard}
          iconBg="bg-violet-50 dark:bg-violet-950/40"
          iconColor="text-violet-500"
        />
        <StatCard
          label="Videos Generated"
          value={fmt(kpi.totalVideos)}
          sub="vs last week"
          pct={videoPct}
          icon={IconVideo}
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          iconColor="text-amber-500"
        />
        <StatCard
          label="Credits Consumed"
          value={fmt(kpi.totalCreditsConsumed)}
          sub={`${fmt(kpi.creditsThisWeek)} this week`}
          pct={0}
          icon={IconCoins}
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-500"
        />
      </div>

      {/* ── Row 2: Line chart + Top models ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-base font-bold text-foreground">
            Videos Generated — Last 30 Days
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={videosByDay}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="videoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(v: string) => v.slice(5)}
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#videoGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-bold text-foreground">
            Top Models
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={topModels}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="model"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                width={72}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTip />} />
              <Bar
                dataKey="count"
                fill="#8b5cf6"
                radius={[0, 6, 6, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Recent payments + Generation health ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent payments */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-base font-bold text-foreground">
            Recent Payments
          </h3>
          <div className="overflow-hidden rounded-xl border border-border">
            {recentPayments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No payments yet
              </p>
            ) : (
              recentPayments.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    i < recentPayments.length - 1 && 'border-b border-border'
                  )}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={p.userImage ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {(p.userName ?? '?')[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {p.userName ?? p.userEmail}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.userEmail}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {p.type === 'subscription'
                        ? `Sub · ${p.interval ?? '—'}`
                        : 'One-time'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {fmtDate(p.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Generation health: success rate + failed jobs */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-base font-bold text-foreground">
            Generation Health
          </h3>

          {/* Donut */}
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={successData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={62}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                  <Cell fill="var(--muted)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-foreground">
                {kpi.successRate}%
              </span>
              <span className="text-[11px] text-muted-foreground">success</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mb-4 flex justify-around text-center">
            <div>
              <p className="text-base font-bold text-emerald-600">
                {fmt(kpi.completedVideos)}
              </p>
              <p className="text-xs text-muted-foreground">Done</p>
            </div>
            <div>
              <p className="text-base font-bold text-rose-500">
                {fmt(kpi.failedVideos)}
              </p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
            <div>
              <p className="text-base font-bold text-foreground">
                {fmt(kpi.totalVideos)}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Divider + recent failures */}
          <div className="border-t border-border pt-3">
            <div className="mb-2 flex items-center gap-1.5">
              <IconAlertCircle className="size-3.5 text-rose-500" />
              <p className="text-xs font-semibold text-muted-foreground">
                Recent Failures
              </p>
            </div>
            {recentFailedJobs.length === 0 ? (
              <p className="py-3 text-center text-xs text-muted-foreground">
                No failures
              </p>
            ) : (
              <div className="space-y-2">
                {recentFailedJobs.slice(0, 3).map((j) => (
                  <div
                    key={j.id}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">
                        {j.userName}
                      </p>
                      {j.errorMessage && (
                        <p className="truncate text-[11px] text-rose-500">
                          {j.errorMessage}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {j.model}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

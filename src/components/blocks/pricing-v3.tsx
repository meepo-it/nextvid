'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { Routes } from '@/lib/routes';
import {
  ANNUAL_DISCOUNT_PERCENT,
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_CREDITS,
} from '@/config/plans-config';

const fmt = (n: number) => n.toLocaleString('en-US');
const fmtPrice = (cents: number) => {
  const d = cents / 100;
  return d % 1 === 0 ? String(d) : d.toFixed(1);
};
import {
  IconRocket,
  IconSparkles,
  IconBolt,
  IconChecks,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

// ── Data ──────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  nameEn: string;
  nameZh: string;
  descEn: string;
  descZh: string;
  monthlyPrice: number;
  annualPrice: number;
  popular: boolean;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  btnFrom: string;
  btnTo: string;
  featuresEn: string[];
  featuresZh: string[];
}

const PLANS: Plan[] = [
  {
    id: 'hobby',
    nameEn: 'Hobby',
    nameZh: 'Hobby',
    descEn: 'Perfect for getting started with AI video generation.',
    descZh: '适合入门体验 AI 视频生成。',
    monthlyPrice: SUBSCRIPTION_PRICES.hobby.monthly,
    annualPrice: SUBSCRIPTION_PRICES.hobby.annual,
    popular: false,
    icon: IconSparkles,
    iconBg: 'from-sky-400 to-indigo-500',
    iconColor: 'text-white',
    btnFrom: 'from-sky-500',
    btnTo: 'to-indigo-600',
    featuresEn: [
      `${fmt(SUBSCRIPTION_CREDITS.hobby)} credits / month`,
      'Access to all AI video models',
      'Text to video generation',
      'Image to video generation',
      'Standard resolution output',
    ],
    featuresZh: [
      `每月 ${fmt(SUBSCRIPTION_CREDITS.hobby)} 积分`,
      '访问所有 AI 视频模型',
      '文本生成视频',
      '图像生成视频',
      '标准分辨率输出',
    ],
  },
  {
    id: 'pro',
    nameEn: 'Pro',
    nameZh: 'Pro',
    descEn: 'For creators who generate videos regularly.',
    descZh: '适合频繁创作视频的内容创作者。',
    monthlyPrice: SUBSCRIPTION_PRICES.pro.monthly,
    annualPrice: SUBSCRIPTION_PRICES.pro.annual,
    popular: true,
    icon: IconRocket,
    iconBg: 'from-violet-500 to-purple-600',
    iconColor: 'text-white',
    btnFrom: 'from-violet-600',
    btnTo: 'to-fuchsia-500',
    featuresEn: [
      `${fmt(SUBSCRIPTION_CREDITS.pro)} credits / month`,
      'Everything in Hobby',
      'Priority generation queue',
      'HD & 4K resolution output',
      'Camera & motion control',
      'Sound effects generation',
      'Video extension (forward & back)',
    ],
    featuresZh: [
      `每月 ${fmt(SUBSCRIPTION_CREDITS.pro)} 积分`,
      '包含 Hobby 所有功能',
      '优先生成队列',
      'HD 和 4K 分辨率输出',
      '镜头与运动控制',
      '音效生成',
      '视频续写（前向与后向）',
    ],
  },
  {
    id: 'max',
    nameEn: 'Max',
    nameZh: 'Max',
    descEn: 'Maximum output for studios and power users.',
    descZh: '适合工作室与高频用户的最大产能方案。',
    monthlyPrice: SUBSCRIPTION_PRICES.max.monthly,
    annualPrice: SUBSCRIPTION_PRICES.max.annual,
    popular: false,
    icon: IconBolt,
    iconBg: 'from-amber-400 to-orange-500',
    iconColor: 'text-white',
    btnFrom: 'from-amber-500',
    btnTo: 'to-orange-500',
    featuresEn: [
      `${fmt(SUBSCRIPTION_CREDITS.max)} credits / month`,
      'Everything in Pro',
      'Best credit rate per video',
      'Bulk generation support',
      'Highest monthly allowance',
      'Priority customer support',
    ],
    featuresZh: [
      `每月 ${fmt(SUBSCRIPTION_CREDITS.max)} 积分`,
      '包含 Pro 所有功能',
      '最低单视频积分消耗',
      '批量生成支持',
      '最高月度积分配额',
      '优先客服支持',
    ],
  },
];

// ── Card ──────────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isAnnual,
  isZh,
}: {
  plan: Plan;
  isAnnual: boolean;
  isZh: boolean;
}) {
  const Icon = plan.icon;
  const monthlyDisplay = fmtPrice(plan.monthlyPrice);
  const annualMonthly = fmtPrice(Math.round(plan.annualPrice / 12));
  const displayPrice = isAnnual ? annualMonthly : monthlyDisplay;
  const features = isZh ? plan.featuresZh : plan.featuresEn;

  return (
    <div className="rounded-3xl bg-muted/60 p-5 dark:bg-muted/30">
      {/* Top row: icon + popular */}
      <div className="mb-5 flex items-start justify-between">
        <div
          className={cn(
            'flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm',
            plan.iconBg
          )}
        >
          <Icon className={cn('size-7', plan.iconColor)} strokeWidth={1.75} />
        </div>
        {plan.popular && (
          <span className="rounded-full bg-background px-3.5 py-1.5 text-sm font-bold text-violet-600 shadow-sm dark:text-violet-400">
            {isZh ? '最受欢迎' : 'Popular'}
          </span>
        )}
      </div>

      {/* Name + desc */}
      <h3 className="mb-1 text-2xl font-extrabold tracking-tight text-foreground">
        {isZh ? plan.nameZh : plan.nameEn}
      </h3>
      <p className="mb-5 text-sm text-muted-foreground">
        {isZh ? plan.descZh : plan.descEn}
      </p>

      {/* Price */}
      <div className="mb-6 flex items-baseline gap-2">
        <span className="text-6xl font-black tracking-tight text-foreground leading-none">
          ${displayPrice}
        </span>
        <span className="text-sm text-muted-foreground leading-tight">
          {isZh ? '/每月' : '/per month'}
          {isAnnual && (
            <span className="block text-xs text-muted-foreground/60">
              {isZh ? '按年计费' : 'billed annually'}
            </span>
          )}
        </span>
      </div>

      {/* Inner white card: features + button */}
      <div className="rounded-2xl bg-background p-5 shadow-sm dark:bg-card">
        {/* Features */}
        <ul className="mb-6 space-y-3.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <IconChecks
                className="mt-0.5 size-5 shrink-0 text-violet-500"
                strokeWidth={2}
              />
              <span className="text-sm text-foreground/80">{f}</span>
            </li>
          ))}
        </ul>

        {/* Gradient CTA */}
        <Link
          to={Routes.Login}
          className={cn(
            'block w-full rounded-xl bg-gradient-to-r py-3.5 text-center text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-md',
            plan.btnFrom,
            plan.btnTo
          )}
        >
          {isZh ? `立即开始 ${plan.nameZh}` : `Get Started ${plan.nameEn}`}
        </Link>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function PricingV3() {
  const [isAnnual, setIsAnnual] = useState(false);
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const isZh = locale.startsWith('zh');

  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {isZh ? '选择适合你的方案' : 'Choose your plan'}
          </h2>
          <p className="mx-auto max-w-xl text-base text-muted-foreground">
            {isZh
              ? '所有方案均可随时取消，年付节省更多'
              : 'All plans include a 7-day free trial. Cancel anytime.'}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition-all',
                !isAnnual
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isZh ? '月付' : 'Monthly'}
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all',
                isAnnual
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isZh ? '年付' : 'Annual'}
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                {isZh
                  ? `省 ${ANNUAL_DISCOUNT_PERCENT}%`
                  : `Save ${ANNUAL_DISCOUNT_PERCENT}%`}
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isAnnual={isAnnual}
              isZh={isZh}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import * as msg from '@/paraglide/messages.js';
import { Routes } from '@/lib/routes';
// Routes.Login and Routes.Pricing used in CheckoutOrLoginButton
import {
  ANNUAL_DISCOUNT_PERCENT,
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_CREDITS,
  CREDIT_PACK_PRICES,
  CREDIT_PACK_CREDITS,
} from '@/config/plans-config';
import { authClient } from '@/auth/client';
import { clientEnv } from '@/env/client';
import { createCheckoutSession } from '@/api/payment';
import { IconLoader2 } from '@tabler/icons-react';
import { toast } from 'sonner';
import * as m from '@/paraglide/messages.js';

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
  IconPackage,
  IconLayersIntersect,
  IconDiamond,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubPlan {
  kind: 'sub';
  id: string;
  nameEn: string;
  nameZh: string;
  descEn: string;
  descZh: string;
  monthlyPrice: number;
  annualPrice: number;
  popular: boolean;
  icon: ComponentType<{ className?: string }>;
  iconGradient: string;
  btnGradient: string;
  featuresEn: string[];
  featuresZh: string[];
}

interface CreditPlan {
  kind: 'credit';
  id: string;
  nameEn: string;
  nameZh: string;
  descEn: string;
  descZh: string;
  price: number;
  credits: number;
  popular: boolean;
  icon: ComponentType<{ className?: string }>;
  iconGradient: string;
  btnGradient: string;
  featuresEn: string[];
  featuresZh: string[];
}

type Plan = SubPlan | CreditPlan;

// ── Data ──────────────────────────────────────────────────────────────────────

const SUB_PLANS: SubPlan[] = [
  {
    kind: 'sub',
    id: 'hobby',
    nameEn: 'Hobby',
    nameZh: 'Hobby',
    descEn: 'Perfect for getting started with AI video.',
    descZh: '适合入门体验 AI 视频生成。',
    monthlyPrice: SUBSCRIPTION_PRICES.hobby.monthly,
    annualPrice: SUBSCRIPTION_PRICES.hobby.annual,
    popular: false,
    icon: IconSparkles,
    iconGradient: 'from-sky-400 to-indigo-500',
    btnGradient: 'from-sky-500 to-indigo-600',
    featuresEn: [
      `${fmt(SUBSCRIPTION_CREDITS.hobby)} credits / month`,
      'All AI video models',
      'Text to video',
      'Image to video',
      'Standard resolution',
    ],
    featuresZh: [
      `每月 ${fmt(SUBSCRIPTION_CREDITS.hobby)} 积分`,
      '所有 AI 视频模型',
      '文本生成视频',
      '图像生成视频',
      '标准分辨率',
    ],
  },
  {
    kind: 'sub',
    id: 'pro',
    nameEn: 'Pro',
    nameZh: 'Pro',
    descEn: 'For creators who generate videos regularly.',
    descZh: '适合频繁创作视频的内容创作者。',
    monthlyPrice: SUBSCRIPTION_PRICES.pro.monthly,
    annualPrice: SUBSCRIPTION_PRICES.pro.annual,
    popular: true,
    icon: IconRocket,
    iconGradient: 'from-violet-500 to-purple-600',
    btnGradient: 'from-violet-600 to-fuchsia-500',
    featuresEn: [
      `${fmt(SUBSCRIPTION_CREDITS.pro)} credits / month`,
      'Everything in Hobby',
      'Priority queue',
      'HD & 4K output',
      'Camera & motion control',
      'Sound effects',
      'Video extension',
    ],
    featuresZh: [
      `每月 ${fmt(SUBSCRIPTION_CREDITS.pro)} 积分`,
      '包含 Hobby 功能',
      '优先生成队列',
      'HD 和 4K 输出',
      '镜头与运动控制',
      '音效生成',
      '视频续写',
    ],
  },
  {
    kind: 'sub',
    id: 'max',
    nameEn: 'Max',
    nameZh: 'Max',
    descEn: 'Maximum output for studios and power users.',
    descZh: '适合工作室与高频用户的最大产能方案。',
    monthlyPrice: SUBSCRIPTION_PRICES.max.monthly,
    annualPrice: SUBSCRIPTION_PRICES.max.annual,
    popular: false,
    icon: IconBolt,
    iconGradient: 'from-amber-400 to-orange-500',
    btnGradient: 'from-amber-500 to-orange-500',
    featuresEn: [
      `${fmt(SUBSCRIPTION_CREDITS.max)} credits / month`,
      'Everything in Pro',
      'Best credit rate',
      'Bulk generation',
      'Highest allowance',
      'Priority support',
    ],
    featuresZh: [
      `每月 ${fmt(SUBSCRIPTION_CREDITS.max)} 积分`,
      '包含 Pro 功能',
      '最低单视频消耗',
      '批量生成支持',
      '最高月度配额',
      '优先客服',
    ],
  },
];

const CREDIT_PLANS: CreditPlan[] = [
  {
    kind: 'credit',
    id: 'starter-pack',
    nameEn: 'Starter',
    nameZh: 'Starter',
    descEn: 'A quick top-up to try things out.',
    descZh: '快速补充，适合轻度体验。',
    price: CREDIT_PACK_PRICES['starter-pack'],
    credits: CREDIT_PACK_CREDITS['starter-pack'],
    popular: false,
    icon: IconPackage,
    iconGradient: 'from-teal-400 to-cyan-500',
    btnGradient: 'from-teal-500 to-cyan-600',
    featuresEn: [
      `${fmt(CREDIT_PACK_CREDITS['starter-pack'])} one-time credits`,
      'Credits never expire',
      'All AI video models',
      'No subscription needed',
    ],
    featuresZh: [
      `${fmt(CREDIT_PACK_CREDITS['starter-pack'])} 一次性积分`,
      '积分永久有效',
      '所有 AI 视频模型',
      '无需订阅',
    ],
  },
  {
    kind: 'credit',
    id: 'creator-pack',
    nameEn: 'Creator',
    nameZh: 'Creator',
    descEn: 'Great value for regular creators.',
    descZh: '高性价比，适合频繁创作。',
    price: CREDIT_PACK_PRICES['creator-pack'],
    credits: CREDIT_PACK_CREDITS['creator-pack'],
    popular: true,
    icon: IconLayersIntersect,
    iconGradient: 'from-violet-500 to-fuchsia-500',
    btnGradient: 'from-violet-600 to-fuchsia-500',
    featuresEn: [
      `${fmt(CREDIT_PACK_CREDITS['creator-pack'])} one-time credits`,
      'Credits never expire',
      'All AI video models',
      'Better value per credit',
      'No subscription needed',
    ],
    featuresZh: [
      `${fmt(CREDIT_PACK_CREDITS['creator-pack'])} 一次性积分`,
      '积分永久有效',
      '所有 AI 视频模型',
      '更高性价比',
      '无需订阅',
    ],
  },
  {
    kind: 'credit',
    id: 'studio-pack',
    nameEn: 'Studio',
    nameZh: 'Studio',
    descEn: 'Bulk credits for high-volume projects.',
    descZh: '大量积分，适合高产量项目。',
    price: CREDIT_PACK_PRICES['studio-pack'],
    credits: CREDIT_PACK_CREDITS['studio-pack'],
    popular: false,
    icon: IconDiamond,
    iconGradient: 'from-rose-500 to-pink-500',
    btnGradient: 'from-rose-500 to-pink-500',
    featuresEn: [
      `${fmt(CREDIT_PACK_CREDITS['studio-pack'])} one-time credits`,
      'Credits never expire',
      'All AI video models',
      'Best value per credit',
      'No subscription needed',
    ],
    featuresZh: [
      `${fmt(CREDIT_PACK_CREDITS['studio-pack'])} 一次性积分`,
      '积分永久有效',
      '所有 AI 视频模型',
      '最高性价比',
      '无需订阅',
    ],
  },
];

// ── Price ID map ──────────────────────────────────────────────────────────────

const PRICE_IDS: Record<string, { monthly?: string; annual?: string; oneTime?: string }> = {
  hobby: {
    monthly: clientEnv.VITE_STRIPE_PRICE_HOBBY_MONTHLY,
    annual: clientEnv.VITE_STRIPE_PRICE_HOBBY_ANNUAL,
  },
  pro: {
    monthly: clientEnv.VITE_STRIPE_PRICE_PRO_MONTHLY,
    annual: clientEnv.VITE_STRIPE_PRICE_PRO_ANNUAL,
  },
  max: {
    monthly: clientEnv.VITE_STRIPE_PRICE_MAX_MONTHLY,
    annual: clientEnv.VITE_STRIPE_PRICE_MAX_ANNUAL,
  },
  'starter-pack': { oneTime: clientEnv.VITE_STRIPE_PRICE_STARTER_PACK },
  'creator-pack': { oneTime: clientEnv.VITE_STRIPE_PRICE_CREATOR_PACK },
  'studio-pack': { oneTime: clientEnv.VITE_STRIPE_PRICE_STUDIO_PACK },
};

function getPriceId(plan: Plan, isAnnual: boolean): string {
  const ids = PRICE_IDS[plan.id];
  if (!ids) return '';
  if (plan.kind === 'credit') return ids.oneTime ?? '';
  return isAnnual ? (ids.annual ?? '') : (ids.monthly ?? '');
}

// ── Checkout or Login Button ───────────────────────────────────────────────────

function CheckoutOrLoginButton({
  plan,
  isZh,
  isLoggedIn,
  priceId,
}: {
  plan: Plan;
  isZh: boolean;
  isLoggedIn: boolean;
  priceId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const label =
    plan.kind === 'credit'
      ? isZh ? `购买 ${plan.nameZh}` : `Buy ${plan.nameEn}`
      : isZh ? `开始使用 ${plan.nameZh}` : `Get Started ${plan.nameEn}`;

  const btnClass = cn(
    'block w-full rounded-xl bg-gradient-to-r py-3 text-center text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90',
    plan.btnGradient
  );

  if (!isLoggedIn) {
    const loginUrl = `${Routes.Login}?callbackUrl=${encodeURIComponent(Routes.Pricing)}`;
    return (
      <a href={loginUrl} className={btnClass}>
        {label}
      </a>
    );
  }

  const handleCheckout = async () => {
    if (!priceId) {
      toast.error(m.pricing_checkout_failed());
      return;
    }
    try {
      setIsLoading(true);
      const result = await createCheckoutSession({
        data: { planId: plan.id, priceId },
      });
      if (result?.url) {
        window.location.href = result.url;
      } else {
        toast.error(m.pricing_checkout_failed());
      }
    } catch {
      toast.error(m.pricing_checkout_failed());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={isLoading}
      className={cn(btnClass, 'disabled:opacity-60 flex items-center justify-center gap-2')}
    >
      {isLoading && <IconLoader2 className="size-4 animate-spin" />}
      {label}
    </button>
  );
}

// ── CN Payment Badges ─────────────────────────────────────────────────────────

function WechatPayBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#07C160]/30 bg-[#07C160]/10 px-2.5 py-1 text-xs font-medium text-[#07C160]">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-3.898-6.348-7.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.063-6.122zm-3.01 3.99c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.953 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
      </svg>
      微信支付
    </span>
  );
}

function AlipayBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#1677FF]/30 bg-[#1677FF]/10 px-2.5 py-1 text-xs font-medium text-[#1677FF]">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.422 15.358c-3.83-1.153-6.055-1.84-6.055-1.84.637-1.154 1.137-2.477 1.476-3.938h-4.32V8.34h5v-.87h-5V5.48h-2.41v1.99H5.09v.87h5.023v1.24H6.41v.86h7.068c-.26.98-.608 1.87-1.03 2.65-1.927-.56-3.79-.85-5.303-.83-4.02.05-5.617 2.09-5.617 3.84 0 1.93 1.777 3.78 5.067 3.78 2.893 0 5.66-1.41 7.67-3.87 2.23.95 4.93 2.01 6.23 2.51V15.36zM7.603 19.16c-2.42 0-3.71-1.08-3.71-2.3 0-.88.59-2.12 3.337-2.14 1.41-.01 2.813.28 4.293.85-1.563 2.16-3.3 3.59-3.92 3.59z" />
      </svg>
      支付宝
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isAnnual,
  isZh,
  isLoggedIn,
  priceId,
}: {
  plan: Plan;
  isAnnual: boolean;
  isZh: boolean;
  isLoggedIn: boolean;
  priceId: string;
}) {
  const Icon = plan.icon;
  const features = isZh ? plan.featuresZh : plan.featuresEn;

  let displayPrice = '';
  let priceNote = '';
  if (plan.kind === 'sub') {
    const monthly = fmtPrice(plan.monthlyPrice);
    const annualMonthly = fmtPrice(Math.round(plan.annualPrice / 12));
    displayPrice = `$${isAnnual ? annualMonthly : monthly}`;
    priceNote = isAnnual
      ? isZh
        ? '按年计费'
        : 'billed annually'
      : isZh
        ? `年付 $${fmtPrice(plan.annualPrice)} 省 ${ANNUAL_DISCOUNT_PERCENT}%`
        : `$${fmtPrice(plan.annualPrice)}/yr — save ${ANNUAL_DISCOUNT_PERCENT}%`;
  } else {
    displayPrice = `$${fmtPrice(plan.price)}`;
    priceNote = isZh
      ? '一次性付款，永久有效'
      : 'one-time · credits never expire';
  }

  return (
    <div className="flex flex-col rounded-3xl bg-muted/50 p-6 dark:bg-muted/25">
      {/* Icon + Popular */}
      <div className="mb-5 flex items-start justify-between">
        <div
          className={cn(
            'flex size-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm',
            plan.iconGradient
          )}
        >
          <Icon className="size-6 text-white" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col items-end gap-2">
          {plan.popular && (
            <span className="rounded-full bg-background px-3 py-1 text-sm font-bold text-violet-600 shadow-sm dark:text-violet-400">
              {isZh ? '最受欢迎' : 'Popular'}
            </span>
          )}
          {plan.kind === 'credit' && (
            <span className="text-xs font-medium text-muted-foreground">
              {msg.pricing_credit_no_subscription()}
            </span>
          )}
        </div>
      </div>

      {/* Name + desc */}
      <h3 className="mb-1 text-xl font-bold tracking-tight text-foreground">
        {isZh ? plan.nameZh : plan.nameEn}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
        {isZh ? plan.descZh : plan.descEn}
      </p>

      {/* Price */}
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="text-4xl font-black leading-none tracking-tight text-foreground">
          {displayPrice}
        </span>
        <span className="text-sm text-muted-foreground">
          {plan.kind === 'sub' ? (isZh ? '/月' : '/mo') : ''}
        </span>
      </div>
      <p className="mb-5 text-sm text-muted-foreground/70">{priceNote}</p>

      {/* Inner white card */}
      <div className="flex flex-1 flex-col rounded-2xl bg-background p-4 shadow-sm dark:bg-card">
        <ul className="mb-4 flex-1 space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <IconChecks
                className="mt-0.5 size-4 shrink-0 text-violet-500"
                strokeWidth={2}
              />
              <span className="text-sm text-foreground/80">{f}</span>
            </li>
          ))}
        </ul>
        {isZh && (
          <div className="mb-3 flex items-center gap-2">
            <WechatPayBadge />
            <AlipayBadge />
          </div>
        )}
        <CheckoutOrLoginButton
          plan={plan}
          isZh={isZh}
          isLoggedIn={isLoggedIn}
          priceId={priceId}
        />
      </div>
    </div>
  );
}

// ── Stars ─────────────────────────────────────────────────────────────────────

function StarRating({ isZh }: { isZh: boolean }) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="text-foreground"
          >
            <path d="M8 1l1.85 3.75 4.14.6-3 2.92.71 4.13L8 10.35l-3.7 1.95.71-4.13-3-2.92 4.14-.6L8 1z" />
          </svg>
        ))}
        <span className="ml-1 text-sm font-bold text-foreground">5.0</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {isZh ? '来自 2,000+ 用户好评' : 'from 2,000+ users'}
      </p>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

type Mode = 'monthly' | 'annual' | 'credits';

interface PricingV2Props {
  className?: string;
}

export default function PricingV2({ className }: PricingV2Props) {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const isZh = locale.startsWith('zh');
  const [mode, setMode] = useState<Mode>(() => (isZh ? 'credits' : 'monthly'));
  const isAnnual = mode === 'annual';
  const plans: Plan[] = mode === 'credits' ? CREDIT_PLANS : SUB_PLANS;

  return (
    <section id="pricing" className={cn('px-4 py-20', className)}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h2
            className="text-foreground"
            style={{
              fontSize: 'clamp(28px, 3.5vw, 46px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {isZh ? (
              <>
                <em style={{ fontStyle: 'italic', fontWeight: 700 }}>最适合</em>
                你的方案
              </>
            ) : (
              <>
                We&apos;ve got a plan
                <br />
                <em style={{ fontStyle: 'italic' }}>that&apos;s perfect</em> for
                you
              </>
            )}
          </h2>
          <StarRating isZh={isZh} />
        </div>

        {/* Mode toggle */}
        <div className="mb-8">
          <div className="inline-flex items-center rounded-full border border-border bg-background p-1.5 gap-1">
            {(['monthly', 'annual', 'credits'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-5 py-2.5 text-base font-semibold transition-all',
                  mode === m
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {m === 'monthly' && msg.pricing_monthly()}
                {m === 'annual' && (
                  <>
                    {msg.pricing_yearly()}
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      -{ANNUAL_DISCOUNT_PERCENT}%
                    </span>
                  </>
                )}
                {m === 'credits' && (
                  <>
                    {msg.pricing_tab_credit_packs()}
                    <span className="text-xs font-medium text-muted-foreground/80">
                      {msg.pricing_tab_no_subscription()}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isAnnual={isAnnual}
              isZh={isZh}
              isLoggedIn={isLoggedIn}
              priceId={getPriceId(plan, isAnnual)}
            />
          ))}
        </div>

        {mode === 'credits' && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {isZh
              ? '积分一次购买，永久有效，无需订阅，随时使用。'
              : 'One-time purchase. Credits never expire. No subscription required.'}
          </p>
        )}
      </div>
    </section>
  );
}

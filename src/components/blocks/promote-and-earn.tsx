import { websiteConfig } from '@/config/website';
import * as m from '@/paraglide/messages.js';
import {
  IconBrandBilibili,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandMedium,
  IconBrandPinterest,
  IconBrandReddit,
  IconBrandSnapchat,
  IconBrandTelegram,
  IconBrandThreads,
  IconBrandTiktok,
  IconBrandWeibo,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandYoutube,
  IconGift,
  IconMail,
  IconMessageCircle,
  IconShare,
  IconVideo,
  IconWorld,
} from '@tabler/icons-react';

const TIERS = [
  {
    emoji: '\u{1F949}',
    color: 'from-amber-700 to-amber-600',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: () => m.promote_tier_bronze_title(),
    requirement: () => m.promote_tier_bronze_requirement(),
    reward: () => m.promote_tier_bronze_reward(),
  },
  {
    emoji: '\u{1F948}',
    color: 'from-slate-400 to-slate-300',
    bg: 'bg-slate-400/10 border-slate-400/20',
    title: () => m.promote_tier_silver_title(),
    requirement: () => m.promote_tier_silver_requirement(),
    reward: () => m.promote_tier_silver_reward(),
  },
  {
    emoji: '\u{1F947}',
    color: 'from-yellow-500 to-amber-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    title: () => m.promote_tier_gold_title(),
    requirement: () => m.promote_tier_gold_requirement(),
    reward: () => m.promote_tier_gold_reward(),
  },
  {
    emoji: '\u{1F48E}',
    color: 'from-cyan-400 to-blue-500',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    title: () => m.promote_tier_diamond_title(),
    requirement: () => m.promote_tier_diamond_requirement(),
    reward: () => m.promote_tier_diamond_reward(),
  },
];

const PLATFORMS = [
  { icon: IconBrandReddit, name: 'Reddit', color: 'text-orange-500' },
  { icon: IconBrandYoutube, name: 'YouTube', color: 'text-red-500' },
  { icon: IconBrandTiktok, name: 'TikTok', color: 'text-foreground' },
  { icon: IconBrandInstagram, name: 'Instagram', color: 'text-pink-500' },
  { icon: IconBrandFacebook, name: 'Facebook', color: 'text-blue-600' },
  { icon: IconBrandX, name: 'X', color: 'text-foreground' },
  { icon: IconBrandThreads, name: 'Threads', color: 'text-foreground' },
  { icon: IconBrandLinkedin, name: 'LinkedIn', color: 'text-blue-500' },
  { icon: IconBrandPinterest, name: 'Pinterest', color: 'text-red-600' },
  { icon: IconBrandSnapchat, name: 'Snapchat', color: 'text-yellow-500' },
  { icon: IconBrandTelegram, name: 'Telegram', color: 'text-sky-500' },
  { icon: IconBrandWhatsapp, name: 'WhatsApp', color: 'text-green-500' },
  { icon: IconWorld, name: 'Quora', color: 'text-red-600' },
  { icon: IconBrandMedium, name: 'Medium', color: 'text-foreground' },
  { icon: IconBrandBilibili, name: 'Bilibili', color: 'text-sky-400' },
  { icon: IconBrandWeibo, name: 'Weibo', color: 'text-red-500' },
];

const STEPS = [
  {
    icon: IconShare,
    title: () => m.promote_step_1_title(),
    desc: () => m.promote_step_1_desc(),
  },
  {
    icon: IconVideo,
    title: () => m.promote_step_2_title(),
    desc: () => m.promote_step_2_desc(),
  },
  {
    icon: IconGift,
    title: () => m.promote_step_3_title(),
    desc: () => m.promote_step_3_desc(),
  },
];

export function PromoteAndEarn() {
  const supportEmail = websiteConfig.mail?.supportEmail ?? '';
  const emailAddress = supportEmail.includes('<')
    ? (supportEmail.match(/<(.+)>/)?.[1] ?? supportEmail)
    : supportEmail;

  return (
    <div className="space-y-12">
      {/* Reward tiers */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-center">
          {m.promote_tiers_title()}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.emoji}
              className={`rounded-2xl border p-5 ${tier.bg} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0 leading-none mt-0.5">
                  {tier.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold">{tier.title()}</h3>
                    <span
                      className={`shrink-0 rounded-full bg-gradient-to-r ${tier.color} px-3 py-1 text-xs font-bold text-white`}
                    >
                      {tier.reward()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tier.requirement()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-center">
          {m.promote_how_it_works_title()}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <step.icon className="size-6" />
              </div>
              <div className="absolute -top-3 -left-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {i + 1}
              </div>
              <h3 className="font-semibold mb-2">{step.title()}</h3>
              <p className="text-sm text-muted-foreground">{step.desc()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supported platforms */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          {PLATFORMS.map((p) => (
            <span
              key={p.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <p.icon className={`size-4 ${p.color}`} />
              {p.name}
            </span>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {m.promote_any_platform()}
        </p>
      </div>

      {/* Contact CTA */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-primary/[0.08] p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">{m.promote_contact_title()}</h2>
        <p className="text-muted-foreground">{m.promote_contact_desc()}</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href={`mailto:${emailAddress}?subject=Promote%20%26%20Earn%20Submission`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            <IconMail className="size-4" />
            {m.promote_contact_email()}
          </a>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).$crisp) {
                (window as any).$crisp.push(['do', 'chat:open']);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.06] px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/[0.1] active:scale-[0.97]"
          >
            <IconMessageCircle className="size-4" />
            {m.promote_contact_chat()}
          </button>
        </div>
      </div>
    </div>
  );
}

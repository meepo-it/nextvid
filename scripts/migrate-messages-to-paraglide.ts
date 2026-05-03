/**
 * Migrate existing nested TS message objects to flat Paraglide JSON.
 * Run: npx tsx scripts/migrate-messages-to-paraglide.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

// ── Import existing messages ──────────────────────────────────────
// We duplicate the data inline because the TS files use `as const` and
// re-export from an index, making dynamic import fragile. Just import them.
import { messages as en } from '../src/messages/en';
import { messages as zh } from '../src/messages/zh';

// ── Block component hardcoded strings (not in messages files) ─────
const blockEn = {
  blocks_hero_title: 'Ship Faster with TanStack, Cost Less with Cloudflare',
  blocks_hero_description:
    'The complete TanStack Start boilerplate for building profitable SaaS, packed with AI, auth, database, storage, blog, email, newsletter, payments, dashboard, SEO, and more, fully deployed on Cloudflare Workers',
  blocks_hero_introduction: 'Introducing TanStarter',
  blocks_hero_primary: 'Get Started',
  blocks_hero_secondary: 'View Pricing',

  blocks_features_title: 'FEATURES',
  blocks_features_subtitle: 'Everything you need to ship',
  blocks_features_description:
    'Built-in features so you can focus on your product',
  blocks_features_item1_title: 'Database',
  blocks_features_item1_description:
    'Store and query your data with a powerful database layer. Supports relations, migrations, and type-safe access.',
  blocks_features_item2_title: 'Authentication',
  blocks_features_item2_description:
    'Secure auth with email, OAuth, and magic links. Session management and role-based access built in.',
  blocks_features_item3_title: 'Identity',
  blocks_features_item3_description:
    'User profiles, avatars, and account management. Connect multiple providers per user.',
  blocks_features_item4_title: 'Analytics',
  blocks_features_item4_description:
    'Track usage and conversions. Dashboards and reports out of the box.',

  blocks_features2_title: 'FEATURES',
  blocks_features2_subtitle: 'Designed for productivity',
  blocks_features2_description: 'Everything you need to build and ship faster',
  blocks_features2_feature1: 'Email notifications',
  blocks_features2_feature2: 'Real-time updates',
  blocks_features2_feature3: 'Activity tracking',
  blocks_features2_feature4: 'Custom workflows',

  blocks_faqs_title: 'FAQs',
  blocks_faqs_subtitle: 'Frequently asked questions',
  blocks_faqs_item1_question: 'Can I change my plan later?',
  blocks_faqs_item1_answer:
    'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of the next billing cycle.',
  blocks_faqs_item2_question: 'What payment methods do you accept?',
  blocks_faqs_item2_answer:
    'We accept all major credit cards, PayPal, and wire transfer for annual plans.',
  blocks_faqs_item3_question: 'Is there a free trial?',
  blocks_faqs_item3_answer:
    'Yes, we offer a 14-day free trial on all paid plans. No credit card required.',
  blocks_faqs_item4_question: 'What is your refund policy?',
  blocks_faqs_item4_answer:
    'We offer a 30-day money-back guarantee. Contact support for a full refund.',
  blocks_faqs_item5_question: 'How do I get support?',
  blocks_faqs_item5_answer:
    'Email support is included for all plans. Pro and above get priority support.',

  blocks_stats_title: 'STATS',
  blocks_stats_subtitle: 'Built for growth',
  blocks_stats_description: 'Numbers that speak for themselves',
  blocks_stats_item1_title: 'Active users',
  blocks_stats_item2_title: 'API requests',
  blocks_stats_item3_title: 'Teams',

  blocks_testimonials_title: 'TESTIMONIALS',
  blocks_testimonials_subtitle: 'What our customers are saying',
  blocks_testimonials_item1_name: 'Jane Doe',
  blocks_testimonials_item1_role: 'CTO, Acme Inc',
  blocks_testimonials_item1_quote:
    'The best TanStarter kit we evaluated. Auth and billing just work.',
  blocks_testimonials_item2_name: 'John Smith',
  blocks_testimonials_item2_role: 'Founder, Startup',
  blocks_testimonials_item2_quote:
    'TanStarter really saved us months of development. We shipped our MVP in just 2 weeks.',
  blocks_testimonials_item3_name: 'Alex Chen',
  blocks_testimonials_item3_role: 'Engineer, Tech Co',
  blocks_testimonials_item3_quote:
    'Clean code, great DX. We extended it for our use case easily.',
  blocks_testimonials_item4_name: 'Maria Garcia',
  blocks_testimonials_item4_role: 'Product Lead, ScaleUp',
  blocks_testimonials_item4_quote:
    'Finally a template that includes auth, billing, and dashboard out of the box. No more stitching boilerplate.',
  blocks_testimonials_item5_name: 'Sam Wilson',
  blocks_testimonials_item5_role: 'Indie Maker',
  blocks_testimonials_item5_quote:
    'The stack choices and structure are exactly what we needed.',
  blocks_testimonials_item6_name: 'Jordan Lee',
  blocks_testimonials_item6_role: 'DevRel, Cloud Co',
  blocks_testimonials_item6_quote:
    'Best-in-class starter for production SaaS. Our team recommends it to every founder building with modern React.',

  blocks_integration_title: 'INTEGRATIONS',
  blocks_integration_subtitle: 'Works with your stack',
  blocks_integration_description: 'Connect to the tools you already use',
  blocks_integration_learn_more: 'Learn More',
  blocks_integration_item1_title: 'AI & LLMs',
  blocks_integration_item1_description:
    'Connect to OpenAI, Anthropic, and more.',
  blocks_integration_item2_title: 'Replit',
  blocks_integration_item2_description: 'Deploy and run in the cloud.',
  blocks_integration_item3_title: 'Magic UI',
  blocks_integration_item3_description: 'Beautiful animated components.',
  blocks_integration_item4_title: 'VS Codium',
  blocks_integration_item4_description: 'AI-powered code editor.',
  blocks_integration_item5_title: 'MediaWiki',
  blocks_integration_item5_description: 'Knowledge base integration.',
  blocks_integration_item6_title: 'Google PaLM',
  blocks_integration_item6_description: 'Google AI models.',

  blocks_integration2_title: 'Integrate with your favorite tools',
  blocks_integration2_description:
    'Connect seamlessly with popular platforms and services to enhance your workflow',
  blocks_integration2_primary_button: 'Get Started',
  blocks_integration2_secondary_button: 'View Pricing',

  blocks_calltoaction_title: 'Ready to get started?',
  blocks_calltoaction_description:
    'Join thousands of teams building with TanStarter today',
  blocks_calltoaction_primary_button: 'Get started',
  blocks_calltoaction_secondary_button: 'View pricing',

  blocks_logo_cloud_title: 'Your favorite companies are our partners',

  blocks_pricing_subtitle: 'Pricing',
  blocks_pricing_description: 'Choose the plan that fits your needs',
};

const blockZh: Record<string, string> = {
  blocks_hero_title: '用 TanStack 更快交付，用 Cloudflare 更省成本',
  blocks_hero_description:
    'TanStarter 是完整的 TanStack Start SaaS 模板，集成 AI、认证、数据库、存储、博客、邮件、邮件列表、支付、仪表盘、SEO 等，全栈部署于 Cloudflare Workers',
  blocks_hero_introduction: 'TanStarter 来了',
  blocks_hero_primary: '立即开始',
  blocks_hero_secondary: '查看价格',

  blocks_features_title: '功能特性',
  blocks_features_subtitle: '开箱即用的一切',
  blocks_features_description: '内置功能让你专注于产品',
  blocks_features_item1_title: '数据库',
  blocks_features_item1_description:
    '使用强大的数据库层存储和查询数据，支持关系、迁移和类型安全访问。',
  blocks_features_item2_title: '身份认证',
  blocks_features_item2_description:
    '支持邮箱、OAuth 和 Magic Link 的安全认证，内置会话管理和基于角色的访问控制。',
  blocks_features_item3_title: '身份管理',
  blocks_features_item3_description:
    '用户资料、头像和账号管理，支持每个用户关联多个登录方式。',
  blocks_features_item4_title: '数据分析',
  blocks_features_item4_description:
    '追踪使用和转化情况，开箱即用的仪表盘和报表。',

  blocks_features2_title: '功能特性',
  blocks_features2_subtitle: '为生产力而设计',
  blocks_features2_description: '构建和交付所需的一切',
  blocks_features2_feature1: '邮件通知',
  blocks_features2_feature2: '实时更新',
  blocks_features2_feature3: '活动跟踪',
  blocks_features2_feature4: '自定义工作流',

  blocks_faqs_title: '常见问题',
  blocks_faqs_subtitle: '常见问题解答',
  blocks_faqs_item1_question: '我可以之后更改方案吗？',
  blocks_faqs_item1_answer:
    '可以，您可以随时升级或降级。更改在下一个计费周期生效。',
  blocks_faqs_item2_question: '接受哪些支付方式？',
  blocks_faqs_item2_answer:
    '我们接受所有主流信用卡、PayPal，年付方案也支持电汇。',
  blocks_faqs_item3_question: '有免费试用吗？',
  blocks_faqs_item3_answer:
    '有，所有付费方案均提供 14 天免费试用，无需绑定信用卡。',
  blocks_faqs_item4_question: '退款政策是什么？',
  blocks_faqs_item4_answer:
    '我们提供 30 天无条件退款保证，联系客服即可全额退款。',
  blocks_faqs_item5_question: '如何获取支持？',
  blocks_faqs_item5_answer:
    '所有方案都包含邮件支持，Pro 及以上方案享有优先支持。',

  blocks_stats_title: '数据统计',
  blocks_stats_subtitle: '为增长而生',
  blocks_stats_description: '数据说明一切',
  blocks_stats_item1_title: '活跃用户',
  blocks_stats_item2_title: 'API 请求',
  blocks_stats_item3_title: '团队',

  blocks_testimonials_title: '用户评价',
  blocks_testimonials_subtitle: '听听客户怎么说',
  blocks_testimonials_item1_name: 'Jane Doe',
  blocks_testimonials_item1_role: 'CTO, Acme Inc',
  blocks_testimonials_item1_quote: '我们评估过的最佳模板，认证和账单开箱即用。',
  blocks_testimonials_item2_name: 'John Smith',
  blocks_testimonials_item2_role: 'Founder, Startup',
  blocks_testimonials_item2_quote:
    'TanStarter 帮我们节省了几个月的开发时间，2 周就发布了 MVP。',
  blocks_testimonials_item3_name: 'Alex Chen',
  blocks_testimonials_item3_role: 'Engineer, Tech Co',
  blocks_testimonials_item3_quote:
    '代码干净，开发体验好，我们很容易就做了定制。',
  blocks_testimonials_item4_name: 'Maria Garcia',
  blocks_testimonials_item4_role: 'Product Lead, ScaleUp',
  blocks_testimonials_item4_quote:
    '终于有一个模板内置了认证、账单和仪表盘，不用再拼凑样板代码。',
  blocks_testimonials_item5_name: 'Sam Wilson',
  blocks_testimonials_item5_role: 'Indie Maker',
  blocks_testimonials_item5_quote: '技术栈选型和项目结构正是我们需要的。',
  blocks_testimonials_item6_name: 'Jordan Lee',
  blocks_testimonials_item6_role: 'DevRel, Cloud Co',
  blocks_testimonials_item6_quote:
    '生产级 SaaS 的最佳起步模板，我们团队向每位使用现代 React 的创始人推荐它。',

  blocks_integration_title: '集成',
  blocks_integration_subtitle: '与你的技术栈兼容',
  blocks_integration_description: '连接你已在使用的工具',
  blocks_integration_learn_more: '了解更多',
  blocks_integration_item1_title: 'AI & LLMs',
  blocks_integration_item1_description: '连接 OpenAI、Anthropic 等。',
  blocks_integration_item2_title: 'Replit',
  blocks_integration_item2_description: '在云端部署和运行。',
  blocks_integration_item3_title: 'Magic UI',
  blocks_integration_item3_description: '精美动画组件。',
  blocks_integration_item4_title: 'VS Codium',
  blocks_integration_item4_description: 'AI 驱动的代码编辑器。',
  blocks_integration_item5_title: 'MediaWiki',
  blocks_integration_item5_description: '知识库集成。',
  blocks_integration_item6_title: 'Google PaLM',
  blocks_integration_item6_description: 'Google AI 模型。',

  blocks_integration2_title: '与你最爱的工具集成',
  blocks_integration2_description: '无缝连接主流平台和服务，提升工作流效率',
  blocks_integration2_primary_button: '立即开始',
  blocks_integration2_secondary_button: '查看价格',

  blocks_calltoaction_title: '准备好开始了吗？',
  blocks_calltoaction_description:
    '加入数千个正在使用 TanStarter 构建产品的团队',
  blocks_calltoaction_primary_button: '立即开始',
  blocks_calltoaction_secondary_button: '查看价格',

  blocks_logo_cloud_title: '你喜欢的公司都是我们的合作伙伴',

  blocks_pricing_subtitle: '价格',
  blocks_pricing_description: '选择适合您需求的方案',
};

// ── Key normalization: camelCase → snake_case, hyphens → underscores ──
function toSnakeCase(key: string): string {
  return key
    .replace(/-/g, '_') // hyphens to underscores
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // camelCase boundary
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // consecutive caps
    .toLowerCase();
}

// ── Flatten utility ───────────────────────────────────────────────
function flatten(
  obj: Record<string, unknown>,
  prefix = '',
  result: Record<string, string> = {}
): Record<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = toSnakeCase(key);
    const flatKey = prefix ? `${prefix}_${normalizedKey}` : normalizedKey;

    if (typeof value === 'string') {
      // Convert {variable} style interpolation to Paraglide format
      // Paraglide uses {variable} which is the same, so no conversion needed
      result[flatKey] = value;
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === 'string') {
          result[`${flatKey}_${i}`] = value[i];
        } else {
          flatten(
            value[i] as Record<string, unknown>,
            `${flatKey}_${i}`,
            result
          );
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      flatten(value as Record<string, unknown>, flatKey, result);
    }
  }
  return result;
}

// ── Generate JSON ─────────────────────────────────────────────────
const enFlat = {
  $schema: 'https://inlang.com/schema/inlang-message-format',
  ...flatten(en as unknown as Record<string, unknown>),
  ...blockEn,
};

const zhFlat = {
  $schema: 'https://inlang.com/schema/inlang-message-format',
  ...flatten(zh as unknown as Record<string, unknown>),
  ...blockZh,
};

// ── Validate key consistency ──────────────────────────────────────
const enKeys = Object.keys(enFlat)
  .filter((k) => k !== '$schema')
  .sort();
const zhKeys = Object.keys(zhFlat)
  .filter((k) => k !== '$schema')
  .sort();

const missingInZh = enKeys.filter((k) => !zhKeys.includes(k));
const missingInEn = zhKeys.filter((k) => !enKeys.includes(k));

if (missingInZh.length > 0) {
  console.warn('Keys in en but missing in zh:', missingInZh);
}
if (missingInEn.length > 0) {
  console.warn('Keys in zh but missing in en:', missingInEn);
}

// ── Write output ──────────────────────────────────────────────────
const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'messages');
mkdirSync(outDir, { recursive: true });

writeFileSync(
  resolve(outDir, 'en.json'),
  JSON.stringify(enFlat, null, 2) + '\n'
);
writeFileSync(
  resolve(outDir, 'zh.json'),
  JSON.stringify(zhFlat, null, 2) + '\n'
);

// ── Write key mapping for codemod reference ───────────────────────
const keyMap: Record<string, string> = {};
function buildKeyMap(
  obj: Record<string, unknown>,
  prefix = '',
  dotPath = ''
): void {
  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = key.replace(/-/g, '_');
    const flatKey = prefix ? `${prefix}_${normalizedKey}` : normalizedKey;
    const currentDotPath = dotPath ? `${dotPath}.${key}` : key;

    if (typeof value === 'string') {
      keyMap[currentDotPath] = flatKey;
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === 'string') {
          keyMap[`${currentDotPath}[${i}]`] = `${flatKey}_${i}`;
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      buildKeyMap(value as Record<string, unknown>, flatKey, currentDotPath);
    }
  }
}
buildKeyMap(en as unknown as Record<string, unknown>);

writeFileSync(
  resolve(root, 'scripts', 'message-key-map.json'),
  JSON.stringify(keyMap, null, 2) + '\n'
);

console.log(`\n✅ Generated messages/en.json (${enKeys.length} keys)`);
console.log(`✅ Generated messages/zh.json (${zhKeys.length} keys)`);
console.log(
  `✅ Generated scripts/message-key-map.json (${Object.keys(keyMap).length} mappings)`
);

if (missingInZh.length === 0 && missingInEn.length === 0) {
  console.log('\n✅ All keys match between en and zh');
} else {
  console.log(
    `\n⚠️  Key mismatches found: ${missingInZh.length} missing in zh, ${missingInEn.length} missing in en`
  );
  process.exit(1);
}

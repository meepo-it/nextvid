'use client';

import { BlurFade } from '@/components/ui/blur-fade';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const FAQ_EN = [
  {
    q: 'What is NextVid?',
    a: 'NextVid is an AI video generation platform that brings together top models — Seedance 2.0, Kling v3, and Wan 2.7 — in one unified workspace. It supports text, image, and reference video as inputs across four creation modes: Text to Video, Image to Video, Reference to Video, and Video Edit.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. You get generation credits upon sign-up to explore the platform — no credit card required.',
  },
  {
    q: 'Which AI models are available?',
    a: 'Currently supported: Seedance 2.0 (including Fast and Face editions), Kling v3, and Wan 2.7 (including Reference and VideoEdit variants). New models are added on an ongoing basis.',
  },
  {
    q: 'What is the difference between the creation modes?',
    a: 'Text / Image to Video generates clips from a prompt or a static image. Reference to Video replicates camera movement, action pacing, and visual style from an uploaded reference clip. Video Edit extends or rewrites scenes from an existing video while preserving character and lighting continuity.',
  },
  {
    q: 'What resolution and duration are supported?',
    a: 'Output resolution goes up to 1080p. Maximum duration varies by model — most support up to 5–10 seconds per generation. Aspect ratio, duration, and resolution can all be configured before you generate.',
  },
  {
    q: 'What file formats can I use as input?',
    a: 'Image inputs support JPG, PNG, and WebP. Reference video inputs accept MP4. Audio reference files can be uploaded to guide tone and rhythm for sound generation.',
  },
  {
    q: 'What aspect ratios are supported?',
    a: 'You can choose from 16:9 (landscape), 9:16 (portrait / vertical), 1:1 (square), and other common ratios depending on the selected model.',
  },
  {
    q: 'Do I own the videos I generate?',
    a: 'Yes. All generated videos are yours to use for personal or commercial projects. NextVid does not claim any rights over your output.',
  },
];

const FAQ_ZH = [
  {
    q: 'NextVid 是什么？',
    a: 'NextVid 是一个 AI 视频生成平台，将 Seedance 2.0、Kling v3、万相 2.7 等顶级模型整合到一个统一的工作空间。支持文本、图像和参考视频三种输入方式，覆盖文生视频、图生视频、参考视频复现和视频编辑四种创作模式。',
  },
  {
    q: '有免费试用吗？',
    a: '有。注册后即可获得生成额度体验平台，无需绑定信用卡。',
  },
  {
    q: '目前支持哪些 AI 模型？',
    a: '目前支持 Seedance 2.0（含 Fast 和 Face 版本）、Kling v3 和万相 2.7（含参考视频和视频编辑变体），持续引入新模型。',
  },
  {
    q: '各创作模式有什么区别？',
    a: '文本/图像转视频：从提示词或静态图片生成视频；参考视频复现：从上传的参考片段中复现镜头运动、动作节奏和视觉风格；视频编辑：对已有视频进行续写或场景改写，保持人物和光线的连贯性。',
  },
  {
    q: '支持哪些分辨率和时长？',
    a: '输出分辨率最高支持 1080p，最大时长因模型而异，多数支持单次生成 5–10 秒。宽高比、时长和分辨率均可在生成前自由配置。',
  },
  {
    q: '支持哪些输入文件格式？',
    a: '图片输入支持 JPG、PNG 和 WebP 格式；参考视频输入支持 MP4；也可上传音频文件作为音效生成的风格参考。',
  },
  {
    q: '支持哪些宽高比？',
    a: '可选 16:9（横屏）、9:16（竖屏）、1:1（方形）及其他常见比例，具体选项因所选模型而定。',
  },
  {
    q: '生成的视频版权归我吗？',
    a: '是的，所有生成内容的使用权完全归你所有，可用于个人或商业项目。NextVid 不对生成内容主张任何权利。',
  },
];

export default function Faq() {
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const isZh = locale.startsWith('zh');
  const items = isZh ? FAQ_ZH : FAQ_EN;

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <BlurFade inView delay={0}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {isZh ? '常见问题' : 'Frequently Asked Questions'}
            </h2>
          </BlurFade>
          <BlurFade inView delay={0.1}>
            <p className="mt-3 text-lg text-muted-foreground">
              {isZh
                ? '找不到答案？欢迎随时联系我们。'
                : "Can't find the answer? Feel free to reach out."}
            </p>
          </BlurFade>
        </div>

        <BlurFade inView delay={0.15}>
          <Accordion>
            {items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-base font-medium hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </BlurFade>
      </div>
    </section>
  );
}

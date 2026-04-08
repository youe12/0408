import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '儿童天赋测评 | AI智能测评工具',
    template: '%s | 儿童天赋测评',
  },
  description:
    '基于韦氏智力测评框架和多元智能理论，为6-12岁儿童提供科学专业的天赋测评服务，支持家长和孩子共同完成，生成个性化发展建议。',
  keywords: [
    '儿童天赋测评',
    'AI测评',
    '韦氏智力测评',
    '多元智能测试',
    '儿童教育',
    '天赋发现',
    '智力测评',
    '儿童发展',
  ],
  authors: [{ name: 'AI天赋测评', url: 'https://example.com' }],
  generator: 'AI Talent Assessment',
  openGraph: {
    title: '儿童天赋测评 | AI智能测评工具',
    description:
      '基于韦氏智力测评框架和多元智能理论，为6-12岁儿童提供科学专业的天赋测评服务。',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}

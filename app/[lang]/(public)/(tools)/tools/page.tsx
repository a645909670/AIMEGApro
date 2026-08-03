import { activateLocale, AVAILABLE_LOCALES, metadataLanguages } from '@/framework/locale/locale'
import BlogsPageClient from '@/app/[lang]/(public)/(tools)/tools/tools-page-client'
import { Metadata } from 'next'
import { siteConfig } from '@/config/site'

export async function generateMetadata({
                                         params
                                       }: {
                                         params: { slug: string, lang: AVAILABLE_LOCALES}
                                       }
): Promise<Metadata> {
  await activateLocale(params.lang)
  return {
    title:`Tools`+` | ${siteConfig.name}`,
    alternates: {
      languages:metadataLanguages('/tools')
    },
  }
}
export async function generateStaticParams() {
  // 构建时生成静态页面
  const allLang = []
  for (const langDir of Object.values(AVAILABLE_LOCALES)) {
    allLang.push({lang: langDir})
  }
  return allLang
}
export default async function ToolsPage({
  params,
}: {
  params: { lang: AVAILABLE_LOCALES }
}) {
  return (
    <BlogsPageClient locale={params.lang} />
  )
}
// export default async function BlogsPage({
//   params,
// }: {
//   params: { lang: AVAILABLE_LOCALES }
// }) {
//   const blogs = getBlogPosts().filter((blog)=>blog.lang===params.lang)
//   return (
//     <BlogsPageClient params={params} blogs={blogs} />
//   )
// }


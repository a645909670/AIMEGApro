import React from 'react'
import { activateLocale, AVAILABLE_LOCALES, metadataLanguages } from '@/framework/locale/locale'
import Hero from '@/components/wegic/hero'
import Features from '@/components/wegic/features'
import Gallery from '@/components/wegic/gallery'
import FAQs from '@/components/wegic/faqs'
import { Divider } from 'antd'
import Pricing from '@/components/wegic/pricing'
import { t } from '@lingui/macro'
import IndexUploader from '@/components/wegic/index-uploader'
import { Metadata } from 'next'
import { siteConfig } from '@/config/site'

export const dynamic = 'force-static'


export async function generateMetadata({
                                         params
                                       }: {
                                         params: { slug: string, lang: AVAILABLE_LOCALES}
                                       }
): Promise<Metadata> {
  // 必须主动激活一下当前语言，否则t函数不生效
  await activateLocale(params.lang)
  const title = t`Turn One Image into Endless Possibilities`+`-${siteConfig.name}`
  return {
    title,
    description:t`Upload an image and describe your idea. AIMEGApro helps you extend, edit, and reimagine it in seconds.`,
    alternates: {
      languages:metadataLanguages('/')
    },
    icons: {
      icon: siteConfig.icon,
    }
  }
}

export async function generateStaticParams() {
  // 构建时生成静态页面
  const allLang = []
  for (const langDir of Object.values(AVAILABLE_LOCALES)) {
    allLang.push({ lang: langDir })
  }
  return allLang
}

export default async function Page({
                                     params
                                   }: {
  params?: { lang: AVAILABLE_LOCALES }
}) {
  return (
    <>
      <Hero params={params!}/>
      <Features />
      <Gallery />
      <FAQs />
      <Divider className="bg-gray" />
    {/*  <Pricing />*/}
      <IndexUploader params={params!}/>
    </>
  )
}

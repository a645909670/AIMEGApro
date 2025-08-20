import { AVAILABLE_LOCALES } from '@/framework/locale/locale'
import { getBlogPosts } from '@/framework/tools/tools'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BlogPostList from './BlogPostList' // 引入客户端组件

export async function generateStaticParams() {
  let posts = getBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
    lang: post.lang
  }))
}

export async function generateMetadata({
  params
}: {
  params: { slug: string, lang: AVAILABLE_LOCALES }
}): Promise<Metadata> {
  let slug = decodeURIComponent(params.slug)
  let post = getBlogPosts().find((post) => post.lang === params.lang && post.slug === slug)
  return {
    title: post?.title,
    description:post?.description
  }
}


export default async function Page({
  params
}: {
  params: { slug: string, lang: AVAILABLE_LOCALES }
}) {
  let slug = decodeURIComponent(params.slug)
  let post = getBlogPosts().find((post) => post.lang === params.lang && post.slug === slug)
  
  if (!post) {
    return notFound()
  }

  // 将数据传递给客户端组件
  return <BlogPostList post={post} params={params} />
}

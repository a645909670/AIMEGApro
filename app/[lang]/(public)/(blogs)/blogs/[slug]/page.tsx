import { AVAILABLE_LOCALES } from '@/framework/locale/locale'
import { getBlogPosts } from '@/framework/blogs/blogs'
import { notFound } from 'next/navigation'
import { CustomMDX } from '@/framework/blogs/mdx'
import Link from 'next/link'
import { t } from '@lingui/macro'
import { Metadata } from 'next'

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
    lang: post.lang
  }))
}
// 动态生成metadata
export async function generateMetadata({
                                         params
                                       }: {
                                         params: { slug: string, lang: AVAILABLE_LOCALES }
                                       }
): Promise<Metadata> {
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
  // console.log('访问blog详情页面', params)
  let slug = decodeURIComponent(params.slug)
  let post = getBlogPosts().find((post) => post.lang === params.lang && post.slug === slug)
  if (!post) {
   return  notFound()
  }
  return (
    <>
      <article
        className="prose prose-sm md:prose-base lg:prose-lg  rounded-2xl max-w-5xl mx-auto py-10 px-4">
        {/* <Link href={`/${params.lang}/blogs`} className="mb-2 text-gray-500">{t`<< Return Blogs List`}</Link> */}
        <Link href={`/${params.lang}/blogs`} className="mb-2 text-gray-500">&lt;&lt; Return Blogs List</Link>
        <div style={{marginTop: '16px',boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.1)',padding: '24px',borderRadius: '8px'}}>
          {/* <h1>{post.title}</h1>
          <div style={{marginBottom: '40px',fontSize: '12px',color: '#6A8193'}}>Publish Date · {post.createdAt}</div>
          <div style={{marginBottom: '24px',fontSize: '23px',textAlign: 'center', color: '#767676'}}>{post.description}</div>
          <div style={{fontSize: '0px',textAlign: 'center'}}>
            <img style={{display: 'block',margin: '0 auto',width: '327px'}} src={post.image} alt="" />
          </div> */}
          {/* <div style={{color: '#6A8193'}}> */}
            <CustomMDX source={post.content} />
          {/* </div> */}
          {/* <div style={{marginBottom: '12px',textAlign: 'right'}}>{post.name}</div>
          <div style={{textAlign: 'right'}}><a style={{ color: '#2F9FF8' }} href={post.link}>{post.linkName}</a></div> */}
          {/* <div>{post.description}</div>
          {post.contentList.map((item, i) => (
            <div key={i}>
              <h3>{item.title}</h3>
              {item.content.map((item2, j) => (
                item.link ? (
                  <a key={j} href={item.link}>{item.linkContent}</a>
                ) : (
                  <div key={j}>{item2}</div>
                )
              ))}
            <img src={item.image} alt="" />
            </div>
          ))} */}
        </div>
      </article>
    </>

  )
}

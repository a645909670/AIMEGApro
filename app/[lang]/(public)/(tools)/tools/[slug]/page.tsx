import { AVAILABLE_LOCALES } from '@/framework/locale/locale'
import { NextRequest } from 'next/server'
import { getBlogPosts } from '@/framework/tools/tools'
import { notFound } from 'next/navigation'
import { useState } from 'react'
// import { CustomMDX } from '@/framework/tools/mdx'
import Link from 'next/link'
import { t } from '@lingui/macro'
import { Metadata } from 'next'

export function GET(request: NextRequest) {
  const url = request.nextUrl // 包含完整 URL 信息
  console.log('完整 URL:', url.toString())
  
  return Response.json({ url: url.toString() })
}

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    // slug: post.slug,
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
    title: post?.title
  }
}

interface BlogListItem {
  key: string;
  img: string;
  title: string;
  describe: string;
}

export default async function Page({
                                     params
                                   }: {
  params: { slug: string, lang: AVAILABLE_LOCALES }
}) {
  // console.log('访问blog详情页面', params)
  let slug = decodeURIComponent(params.slug)
  let post = getBlogPosts().find((post) => post.lang === params.lang)
  if (!post) {
   return  notFound()
  }
  // className="prose prose-sm md:prose-base lg:prose-lg  rounded-2xl max-w-5xl mx-auto py-10 px-4"
  return (
    <>
      <article>
        {/* <div>{params.slug}</div> */}
        <Link href={`/${params.lang}/tools`} className="mb-2 text-gray-500">&lt;&lt; Return Blogs List</Link>
        <div>
          <div style={{position: 'relative', fontSize: '0px', zIndex: '-10'}}>
            <img style={{width: '100vw', height: '600px'}} src="/tools/flbgc.png" alt="" />
            <div className="w-full max-w-7xl mx-auto" style={{position: 'absolute',top: '100px', bottom: '0', left: '0', right: '0',margin: '0 auto' ,display: 'flex', textAlign: 'left'}}>
              <div style={{marginRight: '40px'}}>
                <div style={{marginBottom: '35px', fontSize: '24px', fontWeight: '600', color: '#000000'}}>{post.title}</div>
                <div style={{fontSize: '14px', color: '#909399'}}>{post.description}</div>
              </div>
              <div style={{minWidth: '483px', minHeight: '271px'}}>
                <img src="/tools/gjimg.png" alt="" />
              </div>
            </div>
          </div>
          <div className="w-full max-w-7xl mx-auto rounded-2xl mb-8 text-stone-800 dark:text-white" style={{display: 'flex', flexWrap: 'wrap',marginBottom: '200px', marginTop: '-240px'}}>
            <div>
              <div style={{marginBottom: '62px', width: '244px', height: '40px'}}><img src={post.listimg} alt="" /></div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%'}}>
              {post.list.map((item: BlogListItem) => (
                <div 
                  key={item.key}
                  style={{borderRadius: '8px', boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.08)',boxSizing: 'border-box', border: '1px solid', borderImage: 'linear-gradient(180deg, #BFDEE4 0%, #C0D6DB 100%) 1', background: 'linear-gradient(154deg, #F5FBFF 13%, #FFFFFF 92%)', cursor: 'pointer'}}
                >
                  {/* 基础卡片内容 */}
                  <div style={{padding: '15px 8px', display: 'flex'}}>
                    <div style={{marginRight: '8px', fontSize: '0px'}}>
                      <img 
                        src={item.img}
                        alt={item.title}
                      />
                    </div>
                    <div style={{width: '175px'}}>
                      <div style={{color: '#515C6B'}}>{item.title}</div>
                      <div style={{fontSize: '12px', color: '#515C6B'}}>{item.describe}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>

  )
}

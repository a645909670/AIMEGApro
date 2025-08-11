'use client'
import { t } from '@lingui/macro'
import Link from 'next/link'
import { AVAILABLE_LOCALES } from '@/framework/locale/locale'
import { Blog } from '@/framework/blogs/blogs'
import { useState } from 'react'

// export default function BlogsPageClient({blogs,params}:{params: { lang: AVAILABLE_LOCALES },blogs: Blog[] }) {
export default function BlogsPageClient() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const toolCategories = [
    { 
      id: 1,
      slug: 'ai-megapro',
      title: "AIMEGApro", 
      icon: "/tools/logo1.png",
    },
    { 
      id: 2,
      slug: 'ai-productivity-tools',
      title: "AI Productivity Tools", 
      icon: "/tools/logo2.png",
    },
    { 
      id: 3, 
      slug: 'ai-video-tools',
      title: "AI Video Tools", 
      icon: "/tools/logo3.png",
    },
    { 
      id: 4, 
      slug: 'ai-text-generators',
      title: "AI Text Generators", 
      icon: "/tools/logo4.png",
    },
    { 
      id: 5, 
      slug: 'ai-business-tools',
      title: "AI Business Tools", 
      icon: "/tools/logo5.png",
    },
    { 
      id: 6, 
      slug: 'ai-image-tools',
      title: "AI Image Tools", 
      icon: "/tools/logo6.png",
    },
    { 
      id: 7, 
      slug: 'automation-tools',
      title: "Automation Tools", 
      icon: "/tools/logo7.png",
    },
    { 
      id: 8, 
      slug: 'ai-art-generators',
      title: "AI Art Generators", 
      icon: "/tools/logo8.png",
    },
    { 
      id: 9, 
      slug: 'ai-audio-generators',
      title: "AI Audio Generators", 
      icon: "/tools/logo9.png",
    },
    { 
      id: 10, 
      slug: 'ai-code-tools',
      title: "AI Code Tools", 
      icon: "/tools/logo10.png",
    },
    { 
      id: 11, 
      slug: 'misc-ai-tools',
      title: "Misc AI Tools", 
      icon: "/tools/logo11.png",
    },
  ];
  return (
    <section>
      <div>
        <div style={{position: 'relative', fontSize: '0px', zIndex: '-10'}}>
          <img src="/tools/bgc.png" alt="" />
          <div style={{position: 'absolute', top: '60px', width: '100%', textAlign: 'center'}}>
            <div style={{fontSize: '48px', fontWeight: '600', color: '#000000'}}>All AI Tool Categories</div>
            <div style={{fontSize: '20px', color: '#909399'}}>Find Most Popular and Featured Tools by Category</div>
          </div>
        </div>



        <div className="w-full max-w-7xl mx-auto rounded-2xl mb-8 text-stone-800 dark:text-white" style={{display: 'flex', flexWrap: 'wrap',marginBottom: '200px', marginTop: '-82px'}}>
          {toolCategories.map((tool) => (
            // <Link href={`/${params.lang}/blogs/${tool.slug}`} passHref>
            <Link href={`/tools/${tool.slug}`}>
              <div 
                key={tool.id}
                style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: (tool.id == 4 || tool.id == 8) ? '0' : '40px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.08)',boxSizing: 'border-box', border: '1px solid', borderImage: hoveredCard === tool.id ? 'linear-gradient(180deg, #9776F5 0%, #9776F5 100%) 1.02' : 'linear-gradient(180deg, #BFDEE4 0%, #C0D6DB 100%) 1', background: hoveredCard === tool.id ? 'linear-gradient(154deg, #F6F5FF 13%, #FFFFFF 92%)' : 'linear-gradient(154deg, #F5FBFF 13%, #FFFFFF 92%)', width: '290px', height: '139px', cursor: 'pointer'}}
                onMouseEnter={() => setHoveredCard(tool.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* 基础卡片内容 */}
                <div>
                  <div style={{display: 'flex', justifyContent: 'center', fontSize: '0px'}}>
                    <img 
                      src={tool.icon} 
                      alt={tool.title} 
                    />
                  </div>
                  <div style={{color: hoveredCard === tool.id ? '#9776F5' : '#515C6B'}}>{tool.title}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
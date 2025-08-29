'use client'
import { t } from '@lingui/macro'
import Link from 'next/link'
import { AVAILABLE_LOCALES } from '@/framework/locale/locale'
import { Blog } from '@/framework/blogs/blogs'
import { useState } from 'react'

export default function BlogsPageClient({blogs,params}:{params: { lang: AVAILABLE_LOCALES },blogs: Blog[] }) {
  const menuItems = [
    {key: 1, name: 'AI Image Expansion'},
    {key: 2, name: 'No-Code Creativity'},
    {key: 3, name: 'Use Cases & Tutorials'},
    {key: 4, name: 'AI Tools & Productivity'},
    {key: 5, name: 'Deals & Resources'},
  ];

  const [selectedItem, setSelectedItem] = useState<number>(menuItems[0].key);

  // 处理菜单项点击
  const handleMenuItemClick = (key: number) => {
    setSelectedItem(key);
  };

  // 根据选中的 key 和 index 判断是否显示博客项
  const shouldShowBlogItem = (selectedKey: number, index: number, blog: Blog) => {
    switch(selectedKey) {
      case 1: // Popular
        return index >= 1 && blog.classification == 1;
      case 2: // AI Image Expansion
        return index >= 1 && blog.classification == 2;
      case 3: // No-Code Creativity
        return index >= 1 && blog.classification == 3;
      case 4: // Use Cases & Tutorials
        return index >= 1 && blog.classification == 4;
      case 5: // AI Tools & Productivity
        return index >= 1 && blog.classification == 5;
      default:
        return index >= 1 && index <= 10000; // 默认显示前6项
    }
  }; 

  const BlogItem = ({ 
    blog, 
    index,
    selectedKey
  }: {
    blog: Blog; 
    index: number;
    selectedKey: number;
  }) => {
    const { title, description, descriptionb, createdAt, image } = blog;

    // 根据选中的 key 和当前索引判断是否显示
    if (!shouldShowBlogItem(selectedKey, index, blog)) {
      return null;
    }

    return (
      <div style={{padding: '12px', marginBottom: '12px', boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.1)'}}>
        <Link href={`/${params.lang}/blogs/${blog.slug}`} passHref>
          <div style={{display: 'flex', position: 'relative'}}>
            <div style={{display: 'flex', alignItems: 'center', marginRight: '12px'}}>
              <img style={{minWidth: '327px',maxWidth: '327px',minHeight: '200px'}} src={image} alt={title} />
            </div>
            <div style={{position: 'relative'}}>
              <div>
                <h4 className="font-medium text-2xl mb-2 hover:underline">{title}</h4>
                <div style={{marginTop: '12px', color: '#6A8193'}}>{descriptionb}</div>
              </div>
              <div style={{position: 'absolute', bottom: '0', color: '#6A8193'}}>Date：{createdAt}</div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  const BlogItem2 = ({ blog, index }:{blog: Blog; index: number}) => {
    const { title, description, descriptionb, descriptionc, createdAt, image } = blog;
    
    // 只显示索引大于6的博客
    if(index >= 6) {
      return null;
    }

    return (
      <div style={{marginBottom: '12px',boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.1)',minWidth: '323px',borderRadius: '8px'}}>
        <Link href={"/"+params.lang + '/blogs/' + blog.slug} passHref key={blog.slug}>
          <div style={{display: 'flex',position: 'relative'}}>
            <div style={{display: 'flex',alignItems: 'center',marginRight: '12px'}}>
              <img style={{minWidth: '130px',maxWidth: '130px'}} src={image} alt={title} />
            </div>
            <div style={{padding: '12px 0',}}>
              <div>
                <div style={{fontSize: '14px',fontWeight: '600',color: '#1F2937'}}>{title}</div>
                <div style={{marginTop: '4px',fontSize: '12px',color: '#767676'}}>{descriptionc}</div>
              </div>
              <div style={{marginTop: '4px',fontSize: '12px',color: '#6A8193'}}>Date:{createdAt}</div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <section className="w-full max-w-7xl mx-auto rounded-2xl mt-8 mb-8 text-stone-800 dark:text-white overflow-hidden">
      <div className="container px-8">
        <div className="grid grid-cols-12 justify-center">
          <h3 style={{marginBottom: '16px',color: '#072D4B',}} className="text-[32px] leading-none font-bold mb-4">Blogs</h3>
        </div>

        <div style={{display: 'flex'}}>
          <div>
            {blogs.map((blog, i) => (
              <BlogItem 
                blog={blog} 
                index={i} 
                key={blog.slug}
                selectedKey={selectedItem}
              />
            ))}
          </div>
          
          <div style={{minWidth: '20px'}}></div>
          
          <div style={{width: '400px'}}>
            {/* 菜单项 */}
            <div style={{ padding: '20px',marginBottom: '20px',boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.1)' }}>
              {menuItems.map((item) => (
                <div 
                  key={item.key}
                  onClick={() => handleMenuItemClick(item.key)}
                  style={{
                    padding: '16px 24px',
                    marginBottom: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: selectedItem === item.key ? 'rgba(5, 114, 239, 0.08)' : 'transparent',
                    color: selectedItem === item.key ? '#0572EF' : '#072D4B',
                    fontWeight: selectedItem === item.key ? 'bold' : 'normal',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
            
            {/* 右侧博客列表 */}
            <div>
              {blogs.map((blog, i) => (
                <BlogItem2 blog={blog} index={i} key={`right-${blog.slug}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
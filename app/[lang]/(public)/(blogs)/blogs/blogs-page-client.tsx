'use client'
import { t } from '@lingui/macro'
import Link from 'next/link'
import { AVAILABLE_LOCALES } from '@/framework/locale/locale'
import { Blog } from '@/framework/blogs/blogs'
import { useState } from 'react' // 添加useState



export default function BlogsPageClient({blogs,params}:{params: { lang: AVAILABLE_LOCALES },blogs: Blog[] }) {
  const menuItems = [
    {key: 1, name: 'Exclusive'},
    {key: 2, name: 'Exclusive'},
    {key: 3, name: 'Exclusive'},
    {key: 4, name: 'Exclusive'},
    {key: 5, name: 'Exclusive'}
  ];

  const BlogItem = ({ blog, index }:{blog: Blog; index: number}) => {
    const { title, description, descriptionb, createdAt, image } = blog;
    if(index <= 6){
      return (
        <div style={{padding: '12px',marginBottom: '12px',boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.1)'}}>
          
            {/*<img src={image} alt="" className="h-auto w-full rounded-lg" />*/}
        {/* <article className="rounded-lg shadow-lg bg-white dark:shadow-none overflow-hidden p-3 md:p-6 h-full">
          <Link href={"/"+params.lang + '/blogs/' + blog.slug} passHref key={blog.slug}>
            <div className="mt-6 mb-3">
              <h4 className="font-medium text-2xl mb-2  hover:underline">{title}</h4>
              <p className="mb-2">
              </p>
              <p className="opacity-60 mt-3 mb-6  hover:underline">{description}</p>
            </div>
          </Link>
        </article> */}

        
          <Link href={"/"+params.lang + '/blogs/' + blog.slug} passHref key={blog.slug}>
            <div style={{display: 'flex',position: 'relative'}}>
              <div style={{display: 'flex',alignItems: 'center',marginRight: '12px'}}><img style={{minWidth: '327px'}} src={image} alt="" /></div>
              <div>
                <div>
                  <h4 className="font-medium text-2xl mb-2  hover:underline">{title}</h4>
                  <div style={{marginTop: '12px',color: '#6A8193'}}>{descriptionb}</div>
                </div>
                {/* position: 'absolute',bottom: '24px', */}
                <div style={{marginTop: '12px',color: '#6A8193'}}>Date:{createdAt}</div>
              </div>
            </div>
          </Link>
        </div>
      );
    }
  };
  const BlogItem2 = ({ blog, index }:{blog: Blog; index: number}) => {
    const { title, description, descriptionb, createdAt, image } = blog;
    if(index > 6){
      return (
        <div style={{marginBottom: '12px',boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.1)',minWidth: '323px',borderRadius: '8px'}}>
          
            {/*<img src={image} alt="" className="h-auto w-full rounded-lg" />*/}
        {/* <article className="rounded-lg shadow-lg bg-white dark:shadow-none overflow-hidden p-3 md:p-6 h-full">
          <Link href={"/"+params.lang + '/blogs/' + blog.slug} passHref key={blog.slug}>
            <div className="mt-6 mb-3">
              <h4 className="font-medium text-2xl mb-2  hover:underline">{title}</h4>
              <p className="mb-2">
              </p>
              <p className="opacity-60 mt-3 mb-6  hover:underline">{description}</p>
            </div>
          </Link>
        </article> */}

        
          <Link href={"/"+params.lang + '/blogs/' + blog.slug} passHref key={blog.slug}>
            <div style={{display: 'flex',position: 'relative'}}>
              <div style={{display: 'flex',alignItems: 'center',marginRight: '12px'}}><img style={{minWidth: '130px'}} src={image} alt="" /></div>
              <div style={{padding: '12px 0',}}>
                <div>
                  <div style={{fontSize: '14px',fontWeight: '600',color: '#1F2937'}}>{title}</div>
                  <div style={{marginTop: '4px',fontSize: '12px',color: '#767676'}}>{descriptionb}</div>
                </div>
                {/* position: 'absolute',bottom: '24px', */}
                <div style={{marginTop: '4px',fontSize: '12px',color: '#6A8193'}}>Date:{createdAt}</div>
              </div>
            </div>
          </Link>
        </div>
      );
    }
  };
  // 添加状态管理选中的字母
  const [selectedItem, setSelectedItem] = useState<number | null>(1);

  // 处理菜单项点击
  const handleMenuItemClick = (key: number) => {
    setSelectedItem(key);
    console.log(`Selected menu item: ${key}`);
    // 这里可以添加更多逻辑，比如过滤博客
  };
  return (
    <section
      className="w-full max-w-7xl mx-auto rounded-2xl mt-8 mb-8 text-stone-800 dark:text-white overflow-hidden">
        {/* py-14 md:py-24  bg-slate-50 dark:bg-slate-900 */}

{/*  md:px-24 */}
      <div className="container px-8">
        <div className="grid grid-cols-12 justify-center">
          <h3 style={{marginBottom: '16px',color: '#072D4B',}} className="text-[32px] leading-none font-bold mb-4">Blogs</h3>
          {/* <div className="col-span-12 lg:col-span-8 lg:col-start-3 lg:col-end-11 text-center">
            <h2 className="text-[32px] lg:text-[45px] leading-none font-bold mb-4">
              {t`AIMEGApro Blogs Post`}
            </h2>
            <p className="text-lg font-medium opacity-80 lg:px-12 mb-9">
              {t`"Discover the Magic of Expanding Your Photos with AI"`}
            </p>
          </div> */}
        </div>

        <div style={{display: 'flex'}}>
            <div>
              {blogs.map((blog, i) => (
                  <BlogItem blog={blog} index={i} />
              ))}
            </div>
            <div style={{minWidth: '20px'}}></div>
            <div>
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
                      width: '183px',
                      backgroundColor: selectedItem === item.key ? 'rgba(5, 114, 239, 0.08)' : 'transparent',
                      color: selectedItem === item.key ? '#0572EF' : '#072D4B',
                      fontWeight: selectedItem === item.key ? 'bold' : 'normal',
                      transition: 'background-color 0.2s',
                      // border: selectedItem === letter ? '1px solid #0284c7' : '1px solid #e5e7eb'
                    }}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
              <div>
                {blogs.map((blog, i) => (
                    <BlogItem2 blog={blog} index={i} />
                ))}
              </div>
            </div>
        </div>
        {/* <div className="grid grid-cols-6 mt-3 md:mt-12 text-center gap-x-6">
          {blogs.map((blog, i) => (
            <div
              className="col-span-6 md:col-span-3 lg:col-span-2 mt-6"
              key={i}
            >
              <BlogItem blog={blog} />
            </div>
          ))}
        </div> */}
      </div>
    </section>
  )
}
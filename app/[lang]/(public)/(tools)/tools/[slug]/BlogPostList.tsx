'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AVAILABLE_LOCALES } from '@/framework/locale/locale';
import dynamic from 'next/dynamic'; // 添加动态导入
// import { CustomMDX } from '@/framework/tools/mdx'

interface BlogListItem {
  key: string;
  slug: string;
  img: string;
  title: string;
  address: string;
  describe: string;
  // describeb: string;
  classification: string;
  content: string;
  details1: any;
  details2: any;
  details3: any;
  details4: any;
  details5: any;
  details6: any;
}

interface BlogPost {
  lang: string;
  slug: string;
  title: string;
  description: string;
  listimg: string;
  list: BlogListItem[];
  content: string;
  img: string;
  // describeb: string;
}

interface BlogPostListProps {
  post: BlogPost;
  params: { slug: string; lang: AVAILABLE_LOCALES };
}


// 动态导入 CustomMDX 避免服务端组件在客户端渲染
const CustomMDX = dynamic(() => import('@/framework/tools/mdx').then(mod => mod.CustomMDX), {
  ssr: false, // 禁用服务端渲染
  loading: () => <p>Loading content...</p> // 加载状态
});

export default function BlogPostList({ post, params }: BlogPostListProps) {
  const [is, setIs] = useState(true);

  const [selectedItem, setSelectedItem] = useState<BlogListItem | null>(null);

  const [mounted, setMounted] = useState(false); // 新增挂载状态
  // 确保只在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

// 处理点击事件
  const handleItemClick = (isValue: boolean, item: BlogListItem | null) => {
    setIs(isValue);
    setSelectedItem(item);
  };
  

  return (
    <article>
      {is ? (
        <div>
          <div style={{padding: '12px 0'}} className="w-full max-w-7xl mx-auto rounded-2xl">
            <Link href={`/${params.lang}/tools`} className="mb-2 text-gray-500">
              &lt;&lt; Return Tools List
            </Link>
          </div>
          <div>
            <div style={{ position: 'relative', fontSize: '0px', zIndex: '-10' }}>
              <img
                style={{ width: '100vw', height: '600px' }}
                src="/tools/flbgc.png"
                alt=""
              />
              <div
                className="w-full max-w-7xl mx-auto"
                style={{
                  position: 'absolute',
                  top: '100px',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  margin: '0 auto',
                  display: 'flex',
                  textAlign: 'left',
                }}
              >
                <div style={{ marginRight: '40px' }}>
                  <div
                    style={{
                      marginBottom: '35px',
                      fontSize: '24px',
                      fontWeight: '600',
                      color: '#000000',
                    }}
                  >
                    {post.title}
                  </div>
                  <div style={{ fontSize: '14px', color: '#909399' }}>
                    {post.description}
                  </div>
                </div>
                {/*  style={{ minWidth: '483px', minHeight: '271px' }} */}
                <div style={{ minWidth: '400px' }}>
                  {/* <img src="/tools/gjimg.png" alt="" /> */}
                  <img src={post.img} alt="" />
                </div>
              </div>
            </div>
            <div
              className="w-full max-w-7xl mx-auto rounded-2xl mb-8 text-stone-800 dark:text-white"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                marginBottom: '200px',
                marginTop: '-240px',
              }}
            >
              <div>
                <div style={{ marginBottom: '62px', width: '244px', height: '40px' }}>
                  <img src={post.listimg} alt="" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%' }}>
                {post.list.map((item: BlogListItem) => (
                  <div
                    key={item.key}
                    style={{
                      marginBottom: '16px',
                      borderRadius: '8px',
                      boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.08)',
                      boxSizing: 'border-box',
                      border: '1px solid',
                      borderImage: 'linear-gradient(180deg, #BFDEE4 0%, #C0D6DB 100%) 1',
                      background: 'linear-gradient(154deg, #F5FBFF 13%, #FFFFFF 92%)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleItemClick(false, item)}
                  >
                    <div style={{ padding: '15px 8px', display: 'flex' }}>
                      <div style={{ marginRight: '8px', fontSize: '0px' }}>
                        <img style={{width: '40px', height: '40px'}} src={item.img} alt={item.title} />
                      </div>
                      <div style={{ width: '175px' }}>
                        <div style={{ color: '#515C6B' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: '#515C6B', width: '175px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.describe}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{paddingBottom: '100px'}}>
            <div>
              <div style={{padding: '12px 0', cursor: 'pointer', color: 'rgb(107 114 128)'}} className="w-full max-w-7xl mx-auto rounded-2xl" onClick={() => handleItemClick(true, null)}>&lt;&lt; Return classification List</div>
              <div style={{background: 'linear-gradient(180deg, #F3F3FF 0%, rgba(243, 243, 243, 0) 100%)'}}>
                <div style={{display: 'flex', paddingTop: '90px', paddingLeft: '80px'}} className="w-full max-w-7xl mx-auto rounded-2xl mb-8 text-stone-800 dark:text-white">
                  <div style={{marginRight: '80px', fontSize: '0px'}}>
                    <img src={selectedItem?.img} alt="" />
                  </div>
                  <div style={{marginTop: '4px'}}>
                    <div style={{fontSize: '40px', fontWeight: '600'}}>{selectedItem?.title}</div>
                    <div style={{marginBottom: '7px', fontSize: '24px', fontWeight: '600'}}>{selectedItem?.describe}</div>
                    <div style={{marginBottom: '48px', fontSize: '16px', color: '#B1B3B8'}}>{selectedItem?.classification}</div>
                    <a href={selectedItem?.address} target="_blank">
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0', borderRadius: '4px', width: '230px', fontSize: '20px', background: '#5961F9', color: '#fff', cursor: 'pointer'}}>
                        <div style={{marginRight: '12px'}}>Visit Site</div>
                        <img src="/tools/lj.png" alt="" />
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              <div style={{height: '64px', background: '#F9F9F9'}}></div>

              <div style={{paddingTop: '40px'}} className="w-full max-w-7xl mx-auto rounded-2xl mb-8 text-stone-800 dark:text-white">
                <div>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px', fontSize: '28px', fontWeight: '600'}}><div style={{marginRight: '16px', height: '20px', width: '4px', backgroundColor: '#9776F5'}}></div>
                    {selectedItem?.details1.title}
                  </div>

                  <div style={{marginBottom: '40px'}}>
                    {selectedItem?.details1.describe}
                  </div>
                </div>

                <div style={{marginTop: '40px'}}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px', fontSize: '28px', fontWeight: '600'}}><div style={{marginRight: '16px', height: '20px', width: '4px', backgroundColor: '#9776F5'}}></div>
                    {selectedItem?.details2.title}
                  </div>

                  <ul>
                    {selectedItem?.details2.introduce.map((item: any, index: any) => (
                      <li key={index} style={{display: 'flex', marginBottom: '24px'}}>
                        <span style={{marginRight: '8px'}}>•</span>
                        <div>
                          {item}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                
                <div style={{marginTop: '40px'}}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px', fontSize: '28px', fontWeight: '600'}}><div style={{marginRight: '16px', height: '20px', width: '4px', backgroundColor: '#9776F5'}}></div>
                    {selectedItem?.details3.title}
                  </div>

                  <ul>
                    {selectedItem?.details3.introduce.map((item: any, index: any) => (
                      <li key={index} style={{display: 'flex', marginBottom: '24px'}}>
                        <span style={{marginRight: '8px'}}>•</span>
                        <div>
                          {item}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                
                <div style={{marginTop: '40px'}}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px', fontSize: '28px', fontWeight: '600'}}><div style={{marginRight: '16px', height: '20px', width: '4px', backgroundColor: '#9776F5'}}></div>
                    {selectedItem?.details4.title}
                  </div>

                  <ul>
                    {selectedItem?.details4.introduce.map((item: any, index: any) => (
                      <li key={index} style={{display: 'flex', marginBottom: '24px'}}>
                        <span style={{marginRight: '8px'}}>•</span>
                        <div>
                          {item}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                
                <div style={{marginTop: '40px'}}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px', fontSize: '28px', fontWeight: '600'}}><div style={{marginRight: '16px', height: '20px', width: '4px', backgroundColor: '#9776F5'}}></div>
                    {selectedItem?.details5.title}
                  </div>

                  <ul>
                    {selectedItem?.details5.introduce.map((item: any, index: any) => (
                      <li key={index} style={{display: 'flex', marginBottom: '24px'}}>
                        <span style={{marginRight: '8px'}}>•</span>
                        <div>
                          {item}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* <div style={{marginTop: '40px'}}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px', fontSize: '28px', fontWeight: '600'}}><div style={{marginRight: '16px', height: '20px', width: '4px', backgroundColor: '#9776F5'}}></div>
                    {selectedItem?.details6.title}
                  </div>

                  <ul>
                    {selectedItem?.details6.introduce.map((item: any, index: any) => (
                    <li key={index} style={{display: 'flex', marginBottom: '4px', cursor: 'pointer'}}>
                      <span style={{marginRight: '8px'}}>•</span>
                      <div>
                        <a href={item.link} target="_blank">{item.content}</a>
                      </div>
                    </li>
                    ))}
                  </ul>
                </div> */}
              </div>
            </div>
          <div>
                
            {/* <div style={{padding: '12px 0', cursor: 'pointer', color: 'rgb(107 114 128)'}} className="prose prose-sm md:prose-base lg:prose-lg rounded-2xl max-w-5xl mx-auto py-10 px-4" onClick={() => handleItemClick(true, null)}>&lt;&lt; Return classification List</div>
            <div className="prose prose-sm md:prose-base lg:prose-lg rounded-2xl max-w-5xl mx-auto py-10 px-4" style={{marginTop: '16px', boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.1)', padding: '24px', borderRadius: '8px'}}>
                
                <div style={{background: 'linear-gradient(180deg, #F3F3FF 0%, rgba(243, 243, 243, 0) 100%)'}}>
                  <div style={{display: 'flex', paddingTop: '90px'}} className="w-full max-w-7xl mx-auto rounded-2xl mb-8 text-stone-800 dark:text-white">
                    <div style={{marginLeft: '44px',marginRight: '200px', fontSize: '0px'}}>
                      <img src="/tools/classification1/db.png" alt="" />
                    </div>
                    <div style={{marginTop: '4px'}}>
                      <div style={{fontSize: '40px', fontWeight: '600'}}>{selectedItem?.title}</div>
                      <div style={{marginBottom: '7px', fontSize: '24px', fontWeight: '600'}}>{selectedItem?.describeb}</div>
                      <div style={{marginBottom: '48px', fontSize: '16px', color: '#B1B3B8'}}>{selectedItem?.classification}</div>
                      <a style={{textDecoration: 'none'}} href={selectedItem?.address} target="_blank">
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0', borderRadius: '4px', width: '230px', fontSize: '20px', background: '#5961F9', color: '#fff', cursor: 'pointer'}}>
                          <div style={{marginRight: '12px'}}>Visit Site</div>
                          <img src="/tools/lj.png" alt="" />
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              {mounted && selectedItem && (
              )}
              <div>
                <CustomMDX source={post.content} />
              </div>
            </div> */}
          </div>
        </div>
      )}
    </article>
  );
}
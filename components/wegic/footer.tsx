'use client'
import Link from 'next/link'
import { AVAILABLE_LOCALES } from '@/framework/locale/locale'
import { t } from '@lingui/macro'

const getNavigation = () => {
  return [
    { name: t`Home`, href: '/' },
    { name: `Tools`, href: '/tools' },
    // { name: t`Pricing`, href: '/pricing' },//隐藏支付
    // { name: t`Blogs`, href: '/blogs' },//隐藏博客
    { name: `Privacy Policy`, href: '/about/privacy-policy' },
    { name: `Terms of Service`, href: '/about/privacy-policy#terms-of-service' },
    /* { name: t`Explore`, href: '/user-case' }*/
  ]
}

const Footer = ({ params }: { params?: { lang: AVAILABLE_LOCALES } }) => (
  <>
    <footer className="md:pt-22 pt-10 mt-8 bg-black px-4 md:px-0" style={{background: '#18283A'}}>
      <div className="text-white bg-black w-full max-w-7xl mx-auto  items-center gap-16 md:grid-cols-2 md:gap-24" style={{background: '#18283A'}}>
        <div className="flex flex-wrap gap-y-10 items-center justify-between" style={{display: 'flex', marginBottom: '20px', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div>
              <ul className="flex flex-wrap items-center gap-4 sm:text-sm">
                {getNavigation().map((item, idx) => (
                  <li
                    key={idx}
                    className="font-medium text-gray-500 hover:text-primary-200 duration-150"
                    style={{fontSize: '14px'}}
                  >
                    <Link href={`/${params?.lang}${item.href}`}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{margin: '0 16px', width: '1px', height: '60px', backgroundColor: '#444E5A'}}></div>
            <div>
              <Link href="/" className="inline-block">
                <div className="w-full h-full flex items-center justify-start">
                  <img
                    className="w-auto h-14 object-cover"
                    src="/logo2.png"
                    alt="logo"
                  />
                  <div style={{marginLeft: '8px'}}>
                    <div style={{fontSize: '21px'}}>AIMEGApro</div>
                    <div style={{fontSize: '10px', color: '#5961F9'}}>Democratizing AI: Easy Access for Everyone</div>
                  </div>
                </div>
              </Link>
            </div>
            {/* <h2 className="text-gray-300 text-lg font-semibold sm:text-2xl">
              AIMEGApro Online
            </h2>
            <p className="max-2xl">
              {t`Expand Your Image, Reshape Your Image`}
            </p>
            <div className="pt-2 flex items-center gap-x-6 text-gray-400">
              <Link href={`/${params?.lang}/ai-image-extender`}>
                AI Image Extender
              </Link>
              <Link href={`/${params?.lang}/ai-photo-extender`} >
                AI Photo Extender
              </Link>
              <Link href={`/${params?.lang}/generative-fill-ai`} >
                Generative Fill AI
              </Link>
              <a href="https://x.com/vocalremoveroak" target="_blank" aria-label="Social media">
                <svg
                  className="w-6 h-6 hover:text-gray-500 duration-150"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <g clipPath="url(#clip0_17_80)">
                    <path
                      fill="currentColor"
                      d="M15.1 43.5c18.11 0 28.017-15.006 28.017-28.016 0-.422-.01-.853-.029-1.275A19.998 19.998 0 0048 9.11c-1.795.798-3.7 1.32-5.652 1.546a9.9 9.9 0 004.33-5.445 19.794 19.794 0 01-6.251 2.39 9.86 9.86 0 00-16.788 8.979A27.97 27.97 0 013.346 6.299 9.859 9.859 0 006.393 19.44a9.86 9.86 0 01-4.462-1.228v.122a9.844 9.844 0 007.901 9.656 9.788 9.788 0 01-4.442.169 9.867 9.867 0 009.195 6.843A19.75 19.75 0 010 39.078 27.937 27.937 0 0015.1 43.5z"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_17_80">
                      <path fill="#fff" d="M0 0h48v48H0z" />
                    </clipPath>
                  </defs>
                </svg>
              </a>
              <a href="/" target="_blank" aria-label="Social media">
              <svg
                className="w-6 h-6 hover:text-gray-500 duration-150"
                fill="none"
                viewBox="0 0 28 28"
              >
                <g clipPath="url(#clip0_1274_2978)">
                  <path
                    fill="currentColor"
                    d="M25.927 0H2.067C.924 0 0 .902 0 2.018v23.959C0 27.092.924 28 2.067 28h23.86C27.07 28 28 27.092 28 25.982V2.018C28 .902 27.07 0 25.927 0zM8.307 23.86H4.151V10.495h4.156V23.86zM6.229 8.673a2.407 2.407 0 110-4.812 2.406 2.406 0 010 4.812zM23.86 23.86h-4.15v-6.497c0-1.547-.028-3.543-2.16-3.543-2.16 0-2.49 1.69-2.49 3.434v6.606h-4.144V10.495h3.98v1.826h.056c.552-1.05 1.908-2.16 3.926-2.16 4.206 0 4.982 2.767 4.982 6.366v7.333z"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1274_2978">
                    <path fill="#fff" d="M0 0h28v28H0z" />
                  </clipPath>
                </defs>
              </svg>
            </a>
            </div> */}
          </div>
        </div>
        <div></div>
        {/* <div className="mt-8">
          <I18nLink params={params} />
        </div> */}
        {/*  border-t */}
        <div style={{padding: '12px 0', textAlign: 'center', borderTop: '1px solid #444E5A'}}>
          {/* <ul className="flex flex-wrap items-center gap-4 sm:text-sm">
            {getNavigation().map((item, idx) => (
              <li
                key={idx}
                className="font-medium text-gray-500 hover:text-primary-200 duration-150"
              >
                <Link href={`/${params?.lang}${item.href}`}>{item.name}</Link>
              </li>
            ))}
            <li>
              <a
                href="https://woy.ai/"
                className="font-medium text-gray-500 hover:text-primary-200 duration-150"
                title="Woy AI Tools Directory"
              >
                Woy AI
              </a>
            </li>
            <li>
              <a
                href="https://randomx.ai"
                className="font-medium text-gray-500 hover:text-primary-200 duration-150"
                title="RandomX AI"
              >
                Randomx.ai
              </a>
            </li>
            <li>
              <a href="https://www.aifillimage.com"
                 className="font-medium text-gray-500 hover:text-primary-200 duration-150"
                 title="AI Fill Image">AI Fill Image</a>
            </li>
          </ul> */}
          {/* <p>
            © 2026 AIMEGApro.com All rights reserved.
          </p> */}
        </div>
      </div>
    </footer>
  </>
)

export default Footer

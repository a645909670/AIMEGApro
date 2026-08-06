'use client'
import React, { useRef } from 'react'
import { FaAnglesRight, FaArrowRightLong } from 'react-icons/fa6'
import PaintingUploader from '@/components/wegic/painting-uploader'
import { t } from '@lingui/macro'
import { AVAILABLE_LOCALES } from '@/framework/locale/locale'
import { GoogleLoginRef } from '@/framework/components/login/types'
import GoogleLogin from '@/framework/components/login/GoogleLogin'
import { Button } from '@nextui-org/react'

const CREATIVE_USERS_LABELS: Record<AVAILABLE_LOCALES, string> = {
  [AVAILABLE_LOCALES.en]: 'Creative Users', [AVAILABLE_LOCALES.cs]: 'Kreativní uživatelé', [AVAILABLE_LOCALES.fr]: 'Utilisateurs créatifs', [AVAILABLE_LOCALES.de]: 'Kreative Nutzer', [AVAILABLE_LOCALES.es]: 'Usuarios creativos', [AVAILABLE_LOCALES.it]: 'Utenti creativi', [AVAILABLE_LOCALES.ja]: 'クリエイティブユーザー', [AVAILABLE_LOCALES.ko]: '크리에이티브 사용자', [AVAILABLE_LOCALES.nl]: 'Creatieve gebruikers', [AVAILABLE_LOCALES.ptBR]: 'Usuários criativos', [AVAILABLE_LOCALES.ru]: 'Творческие пользователи', [AVAILABLE_LOCALES.uk]: 'Творчі користувачі', [AVAILABLE_LOCALES.vi]: 'Người dùng sáng tạo', [AVAILABLE_LOCALES.zhTW]: '創意使用者', [AVAILABLE_LOCALES.pt]: 'Utilizadores criativos', [AVAILABLE_LOCALES.da]: 'Kreative brugere', [AVAILABLE_LOCALES.el]: 'Δημιουργικοί χρήστες', [AVAILABLE_LOCALES.no]: 'Kreative brukere', [AVAILABLE_LOCALES.fi]: 'Luovat käyttäjät', [AVAILABLE_LOCALES.sv]: 'Kreativa användare', [AVAILABLE_LOCALES.th]: 'ผู้ใช้สายสร้างสรรค์', [AVAILABLE_LOCALES.id]: 'Pengguna kreatif', [AVAILABLE_LOCALES.hi]: 'क्रिएटिव उपयोगकर्ता', [AVAILABLE_LOCALES.bn]: 'সৃজনশীল ব্যবহারকারী', [AVAILABLE_LOCALES.ms]: 'Pengguna kreatif', [AVAILABLE_LOCALES.tr]: 'Yaratıcı kullanıcılar',
}

export default function Hero({ params, }: {
  params: { lang: AVAILABLE_LOCALES }
}) {
  const loginRef = useRef<GoogleLoginRef>(null)

  const handleGetStarted = () => {
    const authenticated = loginRef.current?.checkAuthenticated()
    // 未登录不可上传
    if (!authenticated) {
      loginRef.current?.open()
      return false
    }else{
 // 用户已登录，直接跳转到编辑器页面
      // window.location.href = `/${params.lang}/editor`
      // window.location.href = 'https://creatra.art/ai-outpainting'
      window.open('https://creatra.art/ai-outpainting', '_blank');
    }
   
  }
  return (
    <section className="relative px-6 py-24 md:px-8 md:py-10">
       <GoogleLogin ref={loginRef} />
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-24">
        <div className="w-full flex flex-col gap-16 md:gap-4">
          <div className="w-full flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
              {t`AI Image Extender: Expand Your Horizons with Creative Image Extensions`}
            </h1>
            <h2 className="text-slate-600 dark:text-slate-400">
              {t`Explore Beyond the Frame with AI Image Extender: Seamlessly expand your photos online using advanced generative AI, ensuring high-quality visuals are maintained across all image ratios.`}
            </h2>
          </div>
          <div className="flex flex-col gap-10 ">
          <div className="w-full flex justify-center p-4">
               <Button 
                 type="button" 
                 color="primary" 
                 onClick={handleGetStarted}
                 className="px-8 py-3 text-lg font-bold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition duration-300 ease-in-out shadow-lg hover:shadow-xl"
               >
                 <span className="mr-2">{t`Get Started`}</span>
                 <FaArrowRightLong className="inline-block" />
               </Button>
            </div>
            <div className="w-full flex items-center gap-6">
              <div className="flex flex-col gap-1"><span
                className="text-2xl font-extrabold text-slate-900 dark:text-slate-50"> 100K+</span>
                <span className="text-slate-600 dark:text-slate-400">{CREATIVE_USERS_LABELS[params.lang] ?? CREATIVE_USERS_LABELS[AVAILABLE_LOCALES.en]}</span>
              </div>
              <FaAnglesRight className="text-slate-300" />
              <div className="flex flex-col gap-1"><span
                className="text-2xl font-extrabold text-slate-900 dark:text-slate-50"> 300K+ </span>
                <span className="text-slate-600 dark:text-slate-400">{t`Images Outpainting`}</span>
              </div>

            </div>
          </div>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6">
          <div className="w-full flex flex-col items-center justify-center gap-6">
            <div
              className="w-full h-auto aspect-[4/3] object-cover rounded-[2rem] rounded-tl-[2rem] rounded-br-[2rem]">
              <img
                src="https://public-image.fafafa.ai/fa-image/2024/06/dc94c298dbb6498d38ed5a8fc3fb9293.jpeg"
                className="object-cover rounded-[2rem] rounded-tl-[2rem] rounded-br-[2rem]" alt='Before Image Extender' />
              <div className="text-center mt-4">
                {t`Before Image Extender`}
              </div>
            </div>
            <div className="w-full h-auto flex items-center justify-center mt-6">
              <FaArrowRightLong className="text-slate-900 dark:text-slate-50 text-4xl" />
            </div>
          </div>
          <div
            className="h-[100%] w-auto aspect-[4/3] object-cover rounded-[2rem] rounded-tl-[2rem] rounded-br-[2rem]">
            <img
              src="https://public-image.fafafa.ai/fa-image/2024/06/28cf8159d8a7aeb370296993ec380797.png"
              className="object-cover rounded-[2rem] rounded-tl-[2rem] rounded-br-[2rem]" alt='After Image Extender' />
            <div className="text-center mt-4">
              {t`After Image Extender`}
            </div>
          </div>

        </div>
      </div>
      <div
        className="absolute inset-0 rounded-bl-[100px] bg-slate-50 dark:bg-slate-900 pointer-events-none -z-10"></div>
    </section>
  )
}

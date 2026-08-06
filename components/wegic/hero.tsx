'use client'
import React, { useRef } from 'react'
import { FaAnglesRight, FaArrowRightLong } from 'react-icons/fa6'
import PaintingUploader from '@/components/wegic/painting-uploader'
import { Button, Link, useDisclosure } from '@nextui-org/react'
import { t } from '@lingui/macro'
import { Blog } from '@/framework/blogs/blogs'
import { AVAILABLE_LOCALES } from '@/framework/locale/locale'
import useI18nLocale from '@/framework/hooks/useI18nLocale'
import GoogleLogin from '@/framework/components/login/GoogleLogin'
import { GoogleLoginRef } from '@/framework/components/login/types'
// export const dynamic = 'force-dynamic'

const GENERATED_RESULT_LABELS: Record<AVAILABLE_LOCALES, string> = {
  [AVAILABLE_LOCALES.en]: 'AI Transformation',
  [AVAILABLE_LOCALES.cs]: 'Transformace pomocí AI',
  [AVAILABLE_LOCALES.fr]: 'Transformation par IA',
  [AVAILABLE_LOCALES.de]: 'KI-Transformation',
  [AVAILABLE_LOCALES.es]: 'Transformación con IA',
  [AVAILABLE_LOCALES.it]: 'Trasformazione con IA',
  [AVAILABLE_LOCALES.ja]: 'AI変換',
  [AVAILABLE_LOCALES.ko]: 'AI 변환',
  [AVAILABLE_LOCALES.nl]: 'AI-transformatie',
  [AVAILABLE_LOCALES.ptBR]: 'Transformação com IA',
  [AVAILABLE_LOCALES.ru]: 'Преобразование с помощью ИИ',
  [AVAILABLE_LOCALES.uk]: 'Перетворення за допомогою ШІ',
  [AVAILABLE_LOCALES.vi]: 'Chuyển đổi bằng AI',
  [AVAILABLE_LOCALES.zhTW]: 'AI 轉換',
  [AVAILABLE_LOCALES.pt]: 'Transformação com IA',
  [AVAILABLE_LOCALES.da]: 'AI-transformation',
  [AVAILABLE_LOCALES.el]: 'Μετασχηματισμός με AI',
  [AVAILABLE_LOCALES.no]: 'AI-transformasjon',
  [AVAILABLE_LOCALES.fi]: 'Tekoälymuunnos',
  [AVAILABLE_LOCALES.sv]: 'AI-transformering',
  [AVAILABLE_LOCALES.th]: 'การแปลงด้วย AI',
  [AVAILABLE_LOCALES.id]: 'Transformasi AI',
  [AVAILABLE_LOCALES.hi]: 'AI रूपांतरण',
  [AVAILABLE_LOCALES.bn]: 'AI রূপান্তর',
  [AVAILABLE_LOCALES.ms]: 'Transformasi AI',
  [AVAILABLE_LOCALES.tr]: 'Yapay Zekâ Dönüşümü',
}

const ORIGINAL_LABELS: Record<AVAILABLE_LOCALES, string> = {
  [AVAILABLE_LOCALES.en]: 'Original', [AVAILABLE_LOCALES.cs]: 'Originál', [AVAILABLE_LOCALES.fr]: 'Original',
  [AVAILABLE_LOCALES.de]: 'Original', [AVAILABLE_LOCALES.es]: 'Original', [AVAILABLE_LOCALES.it]: 'Originale',
  [AVAILABLE_LOCALES.ja]: 'オリジナル', [AVAILABLE_LOCALES.ko]: '원본', [AVAILABLE_LOCALES.nl]: 'Origineel',
  [AVAILABLE_LOCALES.ptBR]: 'Original', [AVAILABLE_LOCALES.ru]: 'Оригинал', [AVAILABLE_LOCALES.uk]: 'Оригінал',
  [AVAILABLE_LOCALES.vi]: 'Bản gốc', [AVAILABLE_LOCALES.zhTW]: '原始圖片', [AVAILABLE_LOCALES.pt]: 'Original',
  [AVAILABLE_LOCALES.da]: 'Original', [AVAILABLE_LOCALES.el]: 'Πρωτότυπο', [AVAILABLE_LOCALES.no]: 'Original',
  [AVAILABLE_LOCALES.fi]: 'Alkuperäinen', [AVAILABLE_LOCALES.sv]: 'Original', [AVAILABLE_LOCALES.th]: 'ต้นฉบับ',
  [AVAILABLE_LOCALES.id]: 'Asli', [AVAILABLE_LOCALES.hi]: 'मूल', [AVAILABLE_LOCALES.bn]: 'মূল',
  [AVAILABLE_LOCALES.ms]: 'Asal', [AVAILABLE_LOCALES.tr]: 'Orijinal',
}

const IMAGES_TRANSFORMED_LABELS: Record<AVAILABLE_LOCALES, string> = {
  [AVAILABLE_LOCALES.en]: 'Images Transformed',
  [AVAILABLE_LOCALES.cs]: 'Transformované obrázky',
  [AVAILABLE_LOCALES.fr]: 'Images transformées',
  [AVAILABLE_LOCALES.de]: 'Transformierte Bilder',
  [AVAILABLE_LOCALES.es]: 'Imágenes transformadas',
  [AVAILABLE_LOCALES.it]: 'Immagini trasformate',
  [AVAILABLE_LOCALES.ja]: '変換された画像',
  [AVAILABLE_LOCALES.ko]: '변환된 이미지',
  [AVAILABLE_LOCALES.nl]: 'Getransformeerde afbeeldingen',
  [AVAILABLE_LOCALES.ptBR]: 'Imagens transformadas',
  [AVAILABLE_LOCALES.ru]: 'Преобразованные изображения',
  [AVAILABLE_LOCALES.uk]: 'Перетворені зображення',
  [AVAILABLE_LOCALES.vi]: 'Hình ảnh đã chuyển đổi',
  [AVAILABLE_LOCALES.zhTW]: '已轉換的圖片',
  [AVAILABLE_LOCALES.pt]: 'Imagens transformadas',
  [AVAILABLE_LOCALES.da]: 'Transformerede billeder',
  [AVAILABLE_LOCALES.el]: 'Μετασχηματισμένες εικόνες',
  [AVAILABLE_LOCALES.no]: 'Transformerte bilder',
  [AVAILABLE_LOCALES.fi]: 'Muunnetut kuvat',
  [AVAILABLE_LOCALES.sv]: 'Transformerade bilder',
  [AVAILABLE_LOCALES.th]: 'รูปภาพที่แปลงแล้ว',
  [AVAILABLE_LOCALES.id]: 'Gambar yang ditransformasi',
  [AVAILABLE_LOCALES.hi]: 'रूपांतरित छवियां',
  [AVAILABLE_LOCALES.bn]: 'রূপান্তরিত ছবি',
  [AVAILABLE_LOCALES.ms]: 'Imej yang diubah',
  [AVAILABLE_LOCALES.tr]: 'Dönüştürülen görseller',
}

const CREATIVE_USERS_LABELS: Record<AVAILABLE_LOCALES, string> = {
  [AVAILABLE_LOCALES.en]: 'Creative Users',
  [AVAILABLE_LOCALES.cs]: 'Kreativní uživatelé',
  [AVAILABLE_LOCALES.fr]: 'Utilisateurs créatifs',
  [AVAILABLE_LOCALES.de]: 'Kreative Nutzer',
  [AVAILABLE_LOCALES.es]: 'Usuarios creativos',
  [AVAILABLE_LOCALES.it]: 'Utenti creativi',
  [AVAILABLE_LOCALES.ja]: 'クリエイティブユーザー',
  [AVAILABLE_LOCALES.ko]: '크리에이티브 사용자',
  [AVAILABLE_LOCALES.nl]: 'Creatieve gebruikers',
  [AVAILABLE_LOCALES.ptBR]: 'Usuários criativos',
  [AVAILABLE_LOCALES.ru]: 'Творческие пользователи',
  [AVAILABLE_LOCALES.uk]: 'Творчі користувачі',
  [AVAILABLE_LOCALES.vi]: 'Người dùng sáng tạo',
  [AVAILABLE_LOCALES.zhTW]: '創意使用者',
  [AVAILABLE_LOCALES.pt]: 'Utilizadores criativos',
  [AVAILABLE_LOCALES.da]: 'Kreative brugere',
  [AVAILABLE_LOCALES.el]: 'Δημιουργικοί χρήστες',
  [AVAILABLE_LOCALES.no]: 'Kreative brukere',
  [AVAILABLE_LOCALES.fi]: 'Luovat käyttäjät',
  [AVAILABLE_LOCALES.sv]: 'Kreativa användare',
  [AVAILABLE_LOCALES.th]: 'ผู้ใช้สายสร้างสรรค์',
  [AVAILABLE_LOCALES.id]: 'Pengguna kreatif',
  [AVAILABLE_LOCALES.hi]: 'क्रिएटिव उपयोगकर्ता',
  [AVAILABLE_LOCALES.bn]: 'সৃজনশীল ব্যবহারকারী',
  [AVAILABLE_LOCALES.ms]: 'Pengguna kreatif',
  [AVAILABLE_LOCALES.tr]: 'Yaratıcı kullanıcılar',
}

const HERO_TITLE_LABELS: Record<AVAILABLE_LOCALES, string> = {
  [AVAILABLE_LOCALES.en]: 'AIMEGApro: Turn One Image into Endless Possibilities',
  [AVAILABLE_LOCALES.cs]: 'AIMEGApro: Proměňte jeden obrázek v nekonečné možnosti',
  [AVAILABLE_LOCALES.fr]: 'AIMEGApro : Transformez une image en possibilités infinies',
  [AVAILABLE_LOCALES.de]: 'AIMEGApro: Verwandeln Sie ein Bild in unendliche Möglichkeiten',
  [AVAILABLE_LOCALES.es]: 'AIMEGApro: Convierte una imagen en infinitas posibilidades',
  [AVAILABLE_LOCALES.it]: 'AIMEGApro: Trasforma un’immagine in infinite possibilità',
  [AVAILABLE_LOCALES.ja]: 'AIMEGApro：1枚の画像を無限の可能性に変える',
  [AVAILABLE_LOCALES.ko]: 'AIMEGApro: 한 장의 이미지를 무한한 가능성으로',
  [AVAILABLE_LOCALES.nl]: 'AIMEGApro: Verander één afbeelding in eindeloze mogelijkheden',
  [AVAILABLE_LOCALES.ptBR]: 'AIMEGApro: Transforme uma imagem em infinitas possibilidades',
  [AVAILABLE_LOCALES.ru]: 'AIMEGApro: Превратите одно изображение в безграничные возможности',
  [AVAILABLE_LOCALES.uk]: 'AIMEGApro: Перетворіть одне зображення на безмежні можливості',
  [AVAILABLE_LOCALES.vi]: 'AIMEGApro: Biến một hình ảnh thành vô vàn khả năng',
  [AVAILABLE_LOCALES.zhTW]: 'AIMEGApro：將一張圖片變成無限可能',
  [AVAILABLE_LOCALES.pt]: 'AIMEGApro: Transforme uma imagem em infinitas possibilidades',
  [AVAILABLE_LOCALES.da]: 'AIMEGApro: Gør ét billede til uendelige muligheder',
  [AVAILABLE_LOCALES.el]: 'AIMEGApro: Μετατρέψτε μία εικόνα σε ατελείωτες δυνατότητες',
  [AVAILABLE_LOCALES.no]: 'AIMEGApro: Gjør ett bilde til uendelige muligheter',
  [AVAILABLE_LOCALES.fi]: 'AIMEGApro: Muuta yksi kuva rajattomiksi mahdollisuuksiksi',
  [AVAILABLE_LOCALES.sv]: 'AIMEGApro: Förvandla en bild till oändliga möjligheter',
  [AVAILABLE_LOCALES.th]: 'AIMEGApro: เปลี่ยนภาพหนึ่งภาพให้เป็นความเป็นไปได้ไม่รู้จบ',
  [AVAILABLE_LOCALES.id]: 'AIMEGApro: Ubah satu gambar menjadi kemungkinan tak terbatas',
  [AVAILABLE_LOCALES.hi]: 'AIMEGApro: एक तस्वीर को अनंत संभावनाओं में बदलें',
  [AVAILABLE_LOCALES.bn]: 'AIMEGApro: একটি ছবিকে অসীম সম্ভাবনায় রূপান্তর করুন',
  [AVAILABLE_LOCALES.ms]: 'AIMEGApro: Tukarkan satu imej kepada kemungkinan tanpa batas',
  [AVAILABLE_LOCALES.tr]: 'AIMEGApro: Tek bir görseli sınırsız olasılığa dönüştürün',
}

const HERO_DESCRIPTION_LABELS: Record<AVAILABLE_LOCALES, string> = {
  [AVAILABLE_LOCALES.en]: 'Upload an image and describe your idea. AIMEGApro helps you extend, edit, and reimagine it in seconds.',
  [AVAILABLE_LOCALES.cs]: 'Nahrajte obrázek a popište svůj nápad. AIMEGApro vám během několika sekund pomůže jej rozšířit, upravit a nově si ho představit.',
  [AVAILABLE_LOCALES.fr]: 'Téléchargez une image et décrivez votre idée. AIMEGApro vous aide à l’agrandir, la modifier et la réinventer en quelques secondes.',
  [AVAILABLE_LOCALES.de]: 'Laden Sie ein Bild hoch und beschreiben Sie Ihre Idee. AIMEGApro hilft Ihnen, es in Sekunden zu erweitern, zu bearbeiten und neu zu gestalten.',
  [AVAILABLE_LOCALES.es]: 'Sube una imagen y describe tu idea. AIMEGApro te ayuda a ampliarla, editarla y reinventarla en segundos.',
  [AVAILABLE_LOCALES.it]: 'Carica un’immagine e descrivi la tua idea. AIMEGApro ti aiuta ad ampliarla, modificarla e reinventarla in pochi secondi.',
  [AVAILABLE_LOCALES.ja]: '画像をアップロードしてアイデアを説明してください。AIMEGAproなら、数秒で画像を拡張、編集、再構成できます。',
  [AVAILABLE_LOCALES.ko]: '이미지를 업로드하고 아이디어를 설명해 보세요. AIMEGApro가 몇 초 만에 이미지를 확장하고 편집하며 새롭게 재구성해 드립니다.',
  [AVAILABLE_LOCALES.nl]: 'Upload een afbeelding en beschrijf je idee. AIMEGApro helpt je deze in enkele seconden uit te breiden, te bewerken en opnieuw vorm te geven.',
  [AVAILABLE_LOCALES.ptBR]: 'Envie uma imagem e descreva sua ideia. O AIMEGApro ajuda você a expandi-la, editá-la e reinventá-la em segundos.',
  [AVAILABLE_LOCALES.ru]: 'Загрузите изображение и опишите свою идею. AIMEGApro поможет расширить, отредактировать и переосмыслить её за считанные секунды.',
  [AVAILABLE_LOCALES.uk]: 'Завантажте зображення й опишіть свою ідею. AIMEGApro допоможе розширити, відредагувати та переосмислити її за лічені секунди.',
  [AVAILABLE_LOCALES.vi]: 'Tải hình ảnh lên và mô tả ý tưởng của bạn. AIMEGApro giúp bạn mở rộng, chỉnh sửa và sáng tạo lại hình ảnh chỉ trong vài giây.',
  [AVAILABLE_LOCALES.zhTW]: '上傳圖片並描述您的想法。AIMEGApro 能在幾秒鐘內協助您擴展、編輯並重新構想圖片。',
  [AVAILABLE_LOCALES.pt]: 'Envie uma imagem e descreva a sua ideia. O AIMEGApro ajuda a expandi-la, editá-la e reinventá-la em segundos.',
  [AVAILABLE_LOCALES.da]: 'Upload et billede, og beskriv din idé. AIMEGApro hjælper dig med at udvide, redigere og gentænke det på få sekunder.',
  [AVAILABLE_LOCALES.el]: 'Ανεβάστε μια εικόνα και περιγράψτε την ιδέα σας. Το AIMEGApro σάς βοηθά να την επεκτείνετε, να την επεξεργαστείτε και να την επανασχεδιάσετε σε λίγα δευτερόλεπτα.',
  [AVAILABLE_LOCALES.no]: 'Last opp et bilde og beskriv ideen din. AIMEGApro hjelper deg med å utvide, redigere og tenke det på nytt på sekunder.',
  [AVAILABLE_LOCALES.fi]: 'Lataa kuva ja kuvaile ideasi. AIMEGApro auttaa laajentamaan, muokkaamaan ja kuvittelemaan sen uudelleen sekunneissa.',
  [AVAILABLE_LOCALES.sv]: 'Ladda upp en bild och beskriv din idé. AIMEGApro hjälper dig att utöka, redigera och tänka om den på några sekunder.',
  [AVAILABLE_LOCALES.th]: 'อัปโหลดรูปภาพและอธิบายไอเดียของคุณ AIMEGApro ช่วยขยาย แก้ไข และจินตนาการภาพใหม่ได้ในไม่กี่วินาที',
  [AVAILABLE_LOCALES.id]: 'Unggah gambar dan jelaskan ide Anda. AIMEGApro membantu memperluas, mengedit, dan membayangkan ulang gambar dalam hitungan detik.',
  [AVAILABLE_LOCALES.hi]: 'एक तस्वीर अपलोड करें और अपना विचार बताएं। AIMEGApro कुछ ही सेकंड में इसे विस्तारित, संपादित और नए रूप में प्रस्तुत करने में आपकी मदद करता है।',
  [AVAILABLE_LOCALES.bn]: 'একটি ছবি আপলোড করুন এবং আপনার ধারণা বর্ণনা করুন। AIMEGApro কয়েক সেকেন্ডে এটি প্রসারিত, সম্পাদনা ও নতুনভাবে কল্পনা করতে সাহায্য করে।',
  [AVAILABLE_LOCALES.ms]: 'Muat naik imej dan terangkan idea anda. AIMEGApro membantu anda mengembangkan, mengedit dan membayangkan semula imej dalam beberapa saat.',
  [AVAILABLE_LOCALES.tr]: 'Bir görsel yükleyin ve fikrinizi açıklayın. AIMEGApro, görseli saniyeler içinde genişletmenize, düzenlemenize ve yeniden tasarlamanıza yardımcı olur.',
}

export default function Hero({params,}: {
  params: { lang: AVAILABLE_LOCALES }
}) {

  const loginRef = useRef<GoogleLoginRef>(null)

  const handleGetStarted = () => {
    const authenticated = loginRef.current?.checkAuthenticated()
    // 未登录不可上传
    // if (!authenticated) {
    //   loginRef.current?.open()
    //   return false
    // }else{
 // 用户已登录，直接跳转到编辑器页面
      window.location.href = `/${params.lang}/editor`
      // window.location.href = 'https://creatra.art/ai-outpainting'
      // window.open('https://creatra.art/ai-outpainting', '_blank');
    // }
   
  }

  return (
    <section className="relative px-6 py-24 md:px-8 md:py-10">
       <GoogleLogin ref={loginRef} />
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-24">
        <div className="w-full flex flex-col gap-16 md:gap-4">
          <div className="w-full flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
              {HERO_TITLE_LABELS[params.lang] ?? HERO_TITLE_LABELS[AVAILABLE_LOCALES.en]}
            </h1>
            <h2 className="text-slate-600 dark:text-slate-400">
              {HERO_DESCRIPTION_LABELS[params.lang] ?? HERO_DESCRIPTION_LABELS[AVAILABLE_LOCALES.en]}
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
                <span className="text-slate-600 dark:text-slate-400">
                  {CREATIVE_USERS_LABELS[params.lang] ?? CREATIVE_USERS_LABELS[AVAILABLE_LOCALES.en]}
                </span>
              </div>
              <FaAnglesRight className="text-slate-300" />
              <div className="flex flex-col gap-1"><span
                className="text-2xl font-extrabold text-slate-900 dark:text-slate-50"> 300K+ </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {IMAGES_TRANSFORMED_LABELS[params.lang] ?? IMAGES_TRANSFORMED_LABELS[AVAILABLE_LOCALES.en]}
                </span>
              </div>

            </div>
          </div>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6">
          <div className="w-full flex flex-col items-center justify-center gap-6">
            <div
              className="w-full h-auto aspect-[4/3] object-cover rounded-[2rem] rounded-tl-[2rem] rounded-br-[2rem]">
              <img
                // src="https://public-image.fafafa.ai/fa-image/2024/06/dc94c298dbb6498d38ed5a8fc3fb9293.jpeg"
                src="../images/syd.jpg"
                alt="Original image"
                className="object-cover rounded-[2rem] rounded-tl-[2rem] rounded-br-[2rem]" />
              <div className="text-center mt-4">
                {ORIGINAL_LABELS[params.lang] ?? ORIGINAL_LABELS[AVAILABLE_LOCALES.en]}
              </div>
            </div>
            <div className="w-full h-auto flex items-center justify-center mt-6">
              <FaArrowRightLong className="text-slate-900 dark:text-slate-50 text-4xl" />
            </div>
          </div>
          <div
            className="h-[100%] w-auto aspect-[4/3] object-cover rounded-[2rem] rounded-tl-[2rem] rounded-br-[2rem]">
            <img
              // src="https://public-image.fafafa.ai/fa-image/2024/06/28cf8159d8a7aeb370296993ec380797.png"
              src="../images/syx.jpg"
              alt="AI-generated result"
              className="object-cover rounded-[2rem] rounded-tl-[2rem] rounded-br-[2rem]" />
            <div className="text-center mt-4">
                {GENERATED_RESULT_LABELS[params.lang] ?? GENERATED_RESULT_LABELS[AVAILABLE_LOCALES.en]}
            </div>
          </div>

        </div>
      </div>
      <div
        className="absolute inset-0 rounded-bl-[100px] bg-slate-50 dark:bg-slate-900 pointer-events-none -z-10"></div>
    </section>
  )
}

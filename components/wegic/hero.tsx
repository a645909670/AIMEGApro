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
  [AVAILABLE_LOCALES.en]: 'AI-Generated Result',
  [AVAILABLE_LOCALES.cs]: 'Výsledek generovaný AI',
  [AVAILABLE_LOCALES.fr]: 'Résultat généré par l’IA',
  [AVAILABLE_LOCALES.de]: 'KI-generiertes Ergebnis',
  [AVAILABLE_LOCALES.es]: 'Resultado generado por IA',
  [AVAILABLE_LOCALES.it]: "Risultato generato dall'IA",
  [AVAILABLE_LOCALES.ja]: 'AI生成結果',
  [AVAILABLE_LOCALES.ko]: 'AI 생성 결과',
  [AVAILABLE_LOCALES.nl]: 'Door AI gegenereerd resultaat',
  [AVAILABLE_LOCALES.ptBR]: 'Resultado gerado por IA',
  [AVAILABLE_LOCALES.ru]: 'Результат, созданный ИИ',
  [AVAILABLE_LOCALES.uk]: 'Результат, створений ШІ',
  [AVAILABLE_LOCALES.vi]: 'Kết quả do AI tạo',
  [AVAILABLE_LOCALES.zhTW]: 'AI 生成結果',
  [AVAILABLE_LOCALES.pt]: 'Resultado gerado por IA',
  [AVAILABLE_LOCALES.da]: 'AI-genereret resultat',
  [AVAILABLE_LOCALES.el]: 'Αποτέλεσμα που δημιουργήθηκε από AI',
  [AVAILABLE_LOCALES.no]: 'AI-generert resultat',
  [AVAILABLE_LOCALES.fi]: 'Tekoälyn luoma tulos',
  [AVAILABLE_LOCALES.sv]: 'AI-genererat resultat',
  [AVAILABLE_LOCALES.th]: 'ผลลัพธ์ที่สร้างโดย AI',
  [AVAILABLE_LOCALES.id]: 'Hasil yang dibuat AI',
  [AVAILABLE_LOCALES.hi]: 'AI-निर्मित परिणाम',
  [AVAILABLE_LOCALES.bn]: 'AI-উত্পাদিত ফলাফল',
  [AVAILABLE_LOCALES.ms]: 'Hasil Dijana AI',
  [AVAILABLE_LOCALES.tr]: 'Yapay Zekâ Tarafından Oluşturulan Sonuç',
}

const HERO_TITLE_LABELS: Record<AVAILABLE_LOCALES, string> = {
  [AVAILABLE_LOCALES.en]: 'AIMEGApro: Turn Your Ideas into Images with AI',
  [AVAILABLE_LOCALES.cs]: 'AIMEGApro: Proměňte své nápady v obrázky pomocí AI',
  [AVAILABLE_LOCALES.fr]: 'AIMEGApro : Transformez vos idées en images grâce à l’IA',
  [AVAILABLE_LOCALES.de]: 'AIMEGApro: Verwandeln Sie Ihre Ideen mit KI in Bilder',
  [AVAILABLE_LOCALES.es]: 'AIMEGApro: Convierte tus ideas en imágenes con IA',
  [AVAILABLE_LOCALES.it]: 'AIMEGApro: Trasforma le tue idee in immagini con l’IA',
  [AVAILABLE_LOCALES.ja]: 'AIMEGApro：AIでアイデアを画像に変換',
  [AVAILABLE_LOCALES.ko]: 'AIMEGApro: AI로 아이디어를 이미지로 만들어 보세요',
  [AVAILABLE_LOCALES.nl]: 'AIMEGApro: Zet je ideeën om in afbeeldingen met AI',
  [AVAILABLE_LOCALES.ptBR]: 'AIMEGApro: Transforme suas ideias em imagens com IA',
  [AVAILABLE_LOCALES.ru]: 'AIMEGApro: Превращайте идеи в изображения с помощью ИИ',
  [AVAILABLE_LOCALES.uk]: 'AIMEGApro: Перетворюйте свої ідеї на зображення за допомогою ШІ',
  [AVAILABLE_LOCALES.vi]: 'AIMEGApro: Biến ý tưởng của bạn thành hình ảnh bằng AI',
  [AVAILABLE_LOCALES.zhTW]: 'AIMEGApro：使用 AI 將您的想法變成影像',
  [AVAILABLE_LOCALES.pt]: 'AIMEGApro: Transforme as suas ideias em imagens com IA',
  [AVAILABLE_LOCALES.da]: 'AIMEGApro: Forvandl dine idéer til billeder med AI',
  [AVAILABLE_LOCALES.el]: 'AIMEGApro: Μετατρέψτε τις ιδέες σας σε εικόνες με AI',
  [AVAILABLE_LOCALES.no]: 'AIMEGApro: Gjør ideene dine om til bilder med AI',
  [AVAILABLE_LOCALES.fi]: 'AIMEGApro: Muuta ideasi kuviksi tekoälyn avulla',
  [AVAILABLE_LOCALES.sv]: 'AIMEGApro: Förvandla dina idéer till bilder med AI',
  [AVAILABLE_LOCALES.th]: 'AIMEGApro: เปลี่ยนไอเดียของคุณให้เป็นภาพด้วย AI',
  [AVAILABLE_LOCALES.id]: 'AIMEGApro: Ubah ideamu menjadi gambar dengan AI',
  [AVAILABLE_LOCALES.hi]: 'AIMEGApro: AI के साथ अपने विचारों को चित्रों में बदलें',
  [AVAILABLE_LOCALES.bn]: 'AIMEGApro: AI দিয়ে আপনার ধারণাগুলোকে ছবিতে রূপান্তর করুন',
  [AVAILABLE_LOCALES.ms]: 'AIMEGApro: Tukarkan idea anda kepada imej dengan AI',
  [AVAILABLE_LOCALES.tr]: 'AIMEGApro: Fikirlerinizi yapay zekâ ile görsellere dönüştürün',
}

const HERO_DESCRIPTION_LABELS: Record<AVAILABLE_LOCALES, string> = {
  [AVAILABLE_LOCALES.en]: 'Upload an image, describe your vision, and let AI create something new. Transform, remix, and reimagine visuals in seconds—no design skills required.',
  [AVAILABLE_LOCALES.cs]: 'Nahrajte obrázek, popište svou představu a nechte AI vytvořit něco nového. Transformujte, upravujte a představujte si vizuály během několika sekund — bez designérských dovedností.',
  [AVAILABLE_LOCALES.fr]: 'Téléchargez une image, décrivez votre vision et laissez l’IA créer quelque chose de nouveau. Transformez, remixez et réinventez vos visuels en quelques secondes, sans compétences en design.',
  [AVAILABLE_LOCALES.de]: 'Laden Sie ein Bild hoch, beschreiben Sie Ihre Vorstellung und lassen Sie die KI etwas Neues erstellen. Verwandeln, mischen und gestalten Sie Bilder in Sekunden neu — ganz ohne Designkenntnisse.',
  [AVAILABLE_LOCALES.es]: 'Sube una imagen, describe tu visión y deja que la IA cree algo nuevo. Transforma, combina y reinventa tus imágenes en segundos, sin conocimientos de diseño.',
  [AVAILABLE_LOCALES.it]: 'Carica un’immagine, descrivi la tua visione e lascia che l’IA crei qualcosa di nuovo. Trasforma, combina e reimmagina le immagini in pochi secondi, senza competenze di design.',
  [AVAILABLE_LOCALES.ja]: '画像をアップロードしてイメージを説明すると、AIが新しい作品を作成します。デザインの知識がなくても、数秒でビジュアルを変換、編集、再構成できます。',
  [AVAILABLE_LOCALES.ko]: '이미지를 업로드하고 원하는 내용을 설명하면 AI가 새로운 결과를 만들어 줍니다. 디자인 기술 없이도 몇 초 만에 이미지를 변환하고 새롭게 표현해 보세요.',
  [AVAILABLE_LOCALES.nl]: 'Upload een afbeelding, beschrijf je visie en laat AI iets nieuws creëren. Transformeer en geef beelden in enkele seconden een nieuwe vorm — zonder ontwerpvaardigheden.',
  [AVAILABLE_LOCALES.ptBR]: 'Envie uma imagem, descreva sua ideia e deixe a IA criar algo novo. Transforme, remixe e imagine seus visuais novamente em segundos, sem precisar de conhecimentos de design.',
  [AVAILABLE_LOCALES.ru]: 'Загрузите изображение, опишите свою идею и позвольте ИИ создать что-то новое. Меняйте, комбинируйте и переосмысливайте изображения за считанные секунды — навыки дизайна не требуются.',
  [AVAILABLE_LOCALES.uk]: 'Завантажте зображення, опишіть свою ідею й дозвольте ШІ створити щось нове. Змінюйте, поєднуйте та переосмислюйте зображення за лічені секунди — навички дизайну не потрібні.',
  [AVAILABLE_LOCALES.vi]: 'Tải hình ảnh lên, mô tả ý tưởng của bạn và để AI tạo ra điều mới mẻ. Biến đổi, kết hợp và sáng tạo lại hình ảnh chỉ trong vài giây mà không cần kỹ năng thiết kế.',
  [AVAILABLE_LOCALES.zhTW]: '上傳影像、描述您的想法，讓 AI 創造全新的作品。幾秒鐘內即可轉換、混搭並重新構想視覺內容，無需設計技能。',
  [AVAILABLE_LOCALES.pt]: 'Envie uma imagem, descreva a sua visão e deixe a IA criar algo novo. Transforme, remixe e reinvente os seus visuais em segundos, sem precisar de conhecimentos de design.',
  [AVAILABLE_LOCALES.da]: 'Upload et billede, beskriv din idé, og lad AI skabe noget nyt. Transformér, remix og gentænk dine billeder på få sekunder — uden designfærdigheder.',
  [AVAILABLE_LOCALES.el]: 'Ανεβάστε μια εικόνα, περιγράψτε το όραμά σας και αφήστε την AI να δημιουργήσει κάτι νέο. Μεταμορφώστε και επανασχεδιάστε οπτικό περιεχόμενο σε λίγα δευτερόλεπτα, χωρίς γνώσεις σχεδιασμού.',
  [AVAILABLE_LOCALES.no]: 'Last opp et bilde, beskriv visjonen din og la AI skape noe nytt. Forvandle, miks og tenk ut bildene dine på nytt på sekunder — uten designkunnskaper.',
  [AVAILABLE_LOCALES.fi]: 'Lataa kuva, kuvaile visiosi ja anna tekoälyn luoda jotain uutta. Muokkaa ja kuvittele kuvat uudelleen sekunneissa — et tarvitse suunnittelutaitoja.',
  [AVAILABLE_LOCALES.sv]: 'Ladda upp en bild, beskriv din vision och låt AI skapa något nytt. Förvandla, kombinera och föreställ dig bilder på nytt på några sekunder — utan designkunskaper.',
  [AVAILABLE_LOCALES.th]: 'อัปโหลดรูปภาพ อธิบายสิ่งที่คุณต้องการ แล้วให้ AI สร้างสรรค์สิ่งใหม่ เปลี่ยนแปลง ผสมผสาน และจินตนาการภาพใหม่ได้ในไม่กี่วินาทีโดยไม่ต้องมีทักษะการออกแบบ',
  [AVAILABLE_LOCALES.id]: 'Unggah gambar, jelaskan visi Anda, dan biarkan AI membuat sesuatu yang baru. Transformasikan dan kreasikan ulang visual dalam hitungan detik tanpa keahlian desain.',
  [AVAILABLE_LOCALES.hi]: 'एक चित्र अपलोड करें, अपनी कल्पना बताएं और AI को कुछ नया बनाने दें। बिना किसी डिजाइन कौशल के, कुछ ही सेकंड में दृश्यों को बदलें और नए रूप में प्रस्तुत करें।',
  [AVAILABLE_LOCALES.bn]: 'একটি ছবি আপলোড করুন, আপনার ভাবনা বর্ণনা করুন এবং AI-কে নতুন কিছু তৈরি করতে দিন। কোনো ডিজাইন দক্ষতা ছাড়াই কয়েক সেকেন্ডে ভিজ্যুয়াল পরিবর্তন ও নতুনভাবে কল্পনা করুন।',
  [AVAILABLE_LOCALES.ms]: 'Muat naik imej, terangkan visi anda dan biarkan AI mencipta sesuatu yang baharu. Ubah, gabungkan dan bayangkan semula visual dalam beberapa saat tanpa kemahiran reka bentuk.',
  [AVAILABLE_LOCALES.tr]: 'Bir görsel yükleyin, fikrinizi açıklayın ve yapay zekânın yeni bir şey oluşturmasına izin verin. Tasarım becerilerine ihtiyaç duymadan görselleri saniyeler içinde dönüştürün ve yeniden tasarlayın.',
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
                <span className="text-slate-600 dark:text-slate-400"> {t`Users`}</span>
              </div>
              <FaAnglesRight className="text-slate-300" />
              <div className="flex flex-col gap-1"><span
                className="text-2xl font-extrabold text-slate-900 dark:text-slate-50"> 300K+ </span>
                <span className="text-slate-600 dark:text-slate-400">{t`Images Created`}</span>
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
                {t`Original Image`}
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

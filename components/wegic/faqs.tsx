'use client'
import { t } from '@lingui/macro'

type FAQItem = {
  question: string
  answer: string
}


const FaqItem = ({ faq }: { faq: FAQItem }) => (
  <div className="bg-gray-100 dark:bg-[#1E2735] mb-[1px]" style={{background: '#E8EEFF'}}>
    <h5 className="p-4 lg:p-6 mb-0 w-full text-start flex justify-between items-center text-xl font-medium">
      <span>{faq.question}</span>
    </h5>
    <div className="px-3 lg:px-6 pb-2 lg:pb-6">
      <p className="opacity-50">{faq.answer}</p>
    </div>
  </div>
)


const FAQs = () => {
  const items: FAQItem[] = [
    {
      'question':
        t`What is AIMEGApro?`,
      'answer':
        t`AIMEGApro is an AI-powered image transformation tool that helps you expand, edit, and reimagine images. Simply upload an image, describe the result you want, and let AI generate a new version in seconds.`
    }
    ,
    {
      'question': t`How does AI image transformation work?`,
      'answer':
        t`AIMEGApro analyzes the subject, composition, lighting, colors, and visual style of your uploaded image. It then uses your instructions to generate new content that blends naturally with the original.`
    }
    ,
    {
      'question':
        t`Can AIMEGApro preserve the original image style?`,
      'answer':
        t`Yes. AIMEGApro is designed to maintain the overall style, lighting, colors, and perspective of your original image. For the best results, describe the changes you want as clearly as possible.`
    }
    ,
    {
      'question':
        t`Can I expand an image beyond its original frame?`,
      'answer':
        t`Yes. You can extend an image upward, downward, left, or right to reveal more of the scene, change its aspect ratio, or create additional space around the subject.`
    }
    ,
    {
      'question':
        t`How many images can I transform at once?`,
      'answer':
        t`AIMEGApro currently processes one image at a time, helping the AI focus on generating a more consistent and detailed result.`
    }
  ]


  return (
    <section className=" mx-auto py-14  bg-gray  text-zinc-900">
      <div className="container md:px-4 mx-auto">
        <div className="grid grid-cols-12 max-w-7xl mx-auto text-center md:text-left">
          <div className="col-span-12 lg:col-span-8 mb-2">
            <h2 className="font-bold text-3xl  md:text-[45px] leading-none mb-6">
              {t`Frequently Asked Questions`}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 justify-between max-w-7xl mx-auto">
          <div className="hidden md:block  col-span-12 md:col-span-4 mb-6 md:mb-0">
            <div
              className="bg-center bg-no-repeat bg-cover min-h-[150px] w-full rounded-2xl h-full"
              style={{
                backgroundImage:
                  'url(/problem.jpg)'
              }}
            ></div>
          </div>
          <div className="col-span-12 md:col-span-8 lg:pl-12">
            {items.map((faq, i) => (
              <FaqItem faq={faq} key={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQs

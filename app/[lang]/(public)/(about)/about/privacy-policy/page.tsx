import { activateLocale, AVAILABLE_LOCALES, metadataLanguages } from '@/framework/locale/locale'
import { siteConfig } from '@/config/site'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { lang: AVAILABLE_LOCALES } }): Promise<Metadata> {
  await activateLocale(params.lang)
  return {
    title: `Privacy Policy | ${siteConfig.name}`,
    description: `Read the Privacy Policy for ${siteConfig.name}.`,
    alternates: { languages: metadataLanguages('/about/privacy-policy') },
  }
}

export default function PrivacyPage() {
  return (
    <main className="bg-white px-4 py-12 text-gray-700 md:py-16">
      <article className="prose prose-slate mx-auto max-w-4xl">
        <h1>Privacy Policy</h1>
        <p className="lead">Last updated: July 28, 2026</p>
        <p>AIMEGApro (&quot;AIMEGApro&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect information when you use our website and AI-powered tools.</p>
        <h2>Information We Collect</h2>
        <p>We may collect information you provide directly, such as your email address when you create an account or contact us. We also collect uploaded files and instructions only when needed to provide the requested tool functionality.</p>
        <p>We automatically receive limited technical information, including browser type, device information, approximate location, pages viewed, and usage timestamps. This information helps us secure, operate, and improve the service.</p>
        <h2>How We Use Information</h2>
        <ul><li>Provide, maintain, and improve AIMEGApro and its AI tools.</li><li>Process requests, authenticate accounts, and provide customer support.</li><li>Detect fraud, abuse, security incidents, and violations of our terms.</li><li>Send service-related communications and, where permitted, product updates.</li></ul>
        <h2>Uploaded Content and AI Processing</h2>
        <p>Your uploaded images and other inputs may be processed by AIMEGApro and service providers acting on our behalf to generate the requested output. We do not sell your uploaded content. You are responsible for ensuring that you have the necessary rights and permissions to upload and process that content.</p>
        <h2>Sharing and Retention</h2>
        <p>We may share information with infrastructure, authentication, analytics, payment, and AI processing providers that help us operate the service. We may also disclose information when required by law or necessary to protect users, our rights, or the security of the service. We retain information only for as long as reasonably needed for these purposes, legal obligations, and dispute resolution.</p>
        <h2>Your Choices and Rights</h2>
        <p>Depending on your location, you may have rights to access, correct, delete, or restrict the processing of your personal information. To make a request or ask a privacy question, please contact us through the support channel provided on AIMEGApro.</p>
        <h2>Security and Children&apos;s Privacy</h2>
        <p>We use reasonable technical and organizational safeguards, but no online service can guarantee absolute security. AIMEGApro is not directed to children under 13, and we do not knowingly collect personal information from children under 13.</p>
        <h2>Changes to This Policy</h2>
        <p>We may update this policy from time to time. The revised version will be posted on this page with an updated date. Your continued use of AIMEGApro after an update means you acknowledge the revised policy.</p>
        <hr />
        <h1 id="terms-of-service">Terms of Service</h1>
        <p>These Terms of Service (&quot;Terms&quot;) govern your access to and use of AIMEGApro, including its website and AI-powered tools. By using AIMEGApro, you agree to these Terms. If you do not agree, please do not use the service.</p>
        <h2>Use of the Service</h2>
        <p>You may use AIMEGApro only in compliance with applicable laws and these Terms. You are responsible for your account, the accuracy of information you provide, and all activity performed through your account. Keep your credentials secure and notify us promptly of unauthorized use.</p>
        <h2>Content and Acceptable Use</h2>
        <p>You retain ownership of content you upload. You grant AIMEGApro a limited, non-exclusive license to host, process, and transmit that content solely to operate and improve the requested service. You must not upload content that is illegal, infringing, deceptive, harmful, sexually exploitative, or that violates another person&apos;s privacy or rights.</p>
        <ul><li>Do not attempt to access another user&apos;s account or bypass security controls.</li><li>Do not use automated means to overload, scrape, or abuse the service.</li><li>Do not use generated content to defraud, harass, impersonate, or harm others.</li><li>Do not reverse engineer, resell, or interfere with the service except where allowed by law.</li></ul>
        <h2>AI-Generated Content</h2>
        <p>AI outputs may be inaccurate, incomplete, or unsuitable for your intended purpose. You are responsible for reviewing outputs before relying on or publishing them and for confirming that their use does not infringe third-party rights. AIMEGApro does not guarantee that any output is unique or free from third-party claims.</p>
        <h2>Availability and Liability</h2>
        <p>We may modify, suspend, or discontinue features at any time. AIMEGApro is provided on an &quot;as is&quot; and &quot;as available&quot; basis, without warranties of any kind to the fullest extent permitted by law. To the fullest extent permitted by law, AIMEGApro will not be liable for indirect, incidental, special, consequential, or loss-of-profit damages arising from your use of the service.</p>
        <h2>Termination and Changes</h2>
        <p>We may suspend or terminate access if you violate these Terms, create risk, or misuse the service. We may update these Terms by posting a revised version on this page. Your continued use after the effective date constitutes acceptance of the updated Terms.</p>
      </article>
    </main>
  )
}

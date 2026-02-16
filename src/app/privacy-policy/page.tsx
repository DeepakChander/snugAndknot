import Link from 'next/link'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'

const sections = [
  {
    id: 'information-collected',
    title: '1. Information We Collect',
    content: `We collect information you provide directly, such as your name, email address, shipping address, phone number, and payment information when you make a purchase, create an account, or contact us. We also automatically collect certain information when you visit our website, including your IP address, browser type, device information, pages visited, and referring URLs. We use cookies and similar tracking technologies to collect browsing and usage data.`,
  },
  {
    id: 'how-used',
    title: '2. How We Use Your Information',
    content: `We use your information to process and fulfill orders, communicate with you about your purchases, send promotional communications (with your consent), improve our website and services, personalize your shopping experience, prevent fraud and ensure security, and comply with legal obligations. We will never sell your personal information to third parties for their marketing purposes.`,
  },
  {
    id: 'sharing',
    title: '3. Information Sharing',
    content: `We share your information only with service providers who help us operate our business (payment processors, shipping carriers, email service providers), when required by law or legal process, to protect our rights or the safety of others, and in connection with a merger, acquisition, or sale of assets. All service providers are contractually required to protect your information and use it only for the purposes we specify.`,
  },
  {
    id: 'cookies',
    title: '4. Cookies & Tracking',
    content: `We use essential cookies for site functionality (shopping cart, authentication), analytics cookies to understand how visitors use our site, and preference cookies to remember your settings. You can manage cookie preferences through your browser settings. Disabling essential cookies may affect site functionality. We use Google Analytics with IP anonymization enabled. We do not use third-party advertising cookies.`,
  },
  {
    id: 'security',
    title: '5. Data Security',
    content: `We implement industry-standard security measures including SSL/TLS encryption for all data transmission, PCI DSS compliance for payment processing, regular security audits and vulnerability assessments, access controls and employee training, and encrypted data storage. While we strive to protect your information, no method of transmission over the internet is 100% secure.`,
  },
  {
    id: 'your-rights',
    title: '6. Your Rights',
    content: `Depending on your location, you may have the right to access the personal data we hold about you, correct inaccurate information, request deletion of your data, opt out of marketing communications, data portability (receive your data in a structured format), and object to processing. To exercise any of these rights, contact us at privacy@snugandknot.com. We will respond within 30 days.`,
  },
  {
    id: 'retention',
    title: '7. Data Retention',
    content: `We retain your personal information for as long as necessary to fulfill the purposes described in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order information is retained for 7 years for tax and accounting purposes. You may request deletion of your account and associated data at any time.`,
  },
  {
    id: 'children',
    title: '8. Children\'s Privacy',
    content: `Our website and services are not directed to children under the age of 16. We do not knowingly collect personal information from children. If we learn that we have collected information from a child under 16, we will take steps to delete that information promptly. If you believe we have collected information from a child, please contact us immediately.`,
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by posting the updated policy on our website with a new "Last Updated" date, and where required by law, by sending you an email notification. Your continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    content: `If you have questions about this Privacy Policy or our data practices, please contact us at:\n\nSnug&Knot Privacy Team\nEmail: privacy@snugandknot.com\nMail: 180 Lafayette Street, New York, NY 10013\nPhone: +1 (212) 555-0189`,
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-32 pb-20 bg-ivory min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <p className="font-mono text-xs text-gold tracking-[0.4em] uppercase mb-4">
          Legal
        </p>
        <TextReveal
          as="h1"
          className="text-4xl sm:text-5xl text-burgundy mb-4"
        >
          Privacy Policy
        </TextReveal>
        <FadeIn delay={0.1}>
          <div className="w-16 h-px bg-gold mb-4" />
          <p className="text-xs text-rosewood/60 mb-10">
            Last updated: February 2026
          </p>
        </FadeIn>

        {/* Table of Contents */}
        <FadeIn delay={0.15}>
          <nav className="mb-12 p-6 bg-parchment/50 border border-gold/10 rounded-sm">
            <h2 className="font-heading text-lg text-burgundy mb-4">Contents</h2>
            <ol className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-wine/70 hover:text-gold transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </FadeIn>

        {/* Content Sections */}
        <FadeIn delay={0.2}>
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 className="font-heading text-xl text-burgundy mb-3">
                  {section.title}
                </h2>
                <div className="text-sm text-wine/80 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </FadeIn>

        {/* Back link */}
        <div className="mt-16">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-burgundy hover:text-gold transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

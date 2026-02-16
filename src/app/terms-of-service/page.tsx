import Link from 'next/link'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using the Snug&Knot website (snugandknot.com) and purchasing our products, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services. We reserve the right to update these terms at any time, and your continued use constitutes acceptance of any changes.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: `You must be at least 16 years of age to use our website and 18 years of age to make purchases. By using our services, you represent that you meet these age requirements. If you are under 18, you may only use the website under the supervision of a parent or legal guardian who agrees to be bound by these terms.`,
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    content: `When you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. You agree to provide accurate and complete information and to update it as necessary. We reserve the right to suspend or terminate accounts that violate these terms or are suspected of fraudulent activity. You may delete your account at any time by contacting us.`,
  },
  {
    id: 'purchases',
    title: '4. Purchases & Pricing',
    content: `All prices are displayed in USD and are subject to change without notice. We reserve the right to refuse or cancel any order for any reason, including pricing errors, suspected fraud, or stock limitations. Payment is processed at the time of order. We accept major credit cards, debit cards, and digital payment methods as indicated at checkout. Sales tax is applied where required by law.`,
  },
  {
    id: 'shipping-returns',
    title: '5. Shipping & Returns',
    content: `Shipping and return policies are detailed on our Shipping & Returns page and are incorporated into these terms by reference. We are not responsible for delays caused by carriers, customs, or events beyond our control. Risk of loss for purchased items passes to you upon delivery to the carrier. For full details, please visit our Shipping & Returns page.`,
  },
  {
    id: 'intellectual-property',
    title: '6. Intellectual Property',
    content: `All content on this website — including text, images, logos, designs, photography, graphics, and software — is the property of Snug&Knot or our licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our express written permission. The Snug&Knot name, logo, and all related marks are trademarks of Snug&Knot.`,
  },
  {
    id: 'prohibited-uses',
    title: '7. Prohibited Uses',
    content: `You agree not to use our website to violate any applicable law or regulation, impersonate another person or entity, transmit malware, viruses, or harmful code, scrape, crawl, or harvest data without permission, interfere with the proper functioning of the website, use automated systems to access the website at a rate exceeding normal human usage, or engage in any activity that could damage, disable, or impair our services.`,
  },
  {
    id: 'limitation-liability',
    title: '8. Limitation of Liability',
    content: `To the maximum extent permitted by law, Snug&Knot shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products, including but not limited to loss of profits, data, or goodwill. Our total liability for any claim shall not exceed the amount you paid for the product giving rise to the claim. This limitation applies regardless of the legal theory.`,
  },
  {
    id: 'indemnification',
    title: '9. Indemnification',
    content: `You agree to indemnify and hold harmless Snug&Knot, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorney fees) arising from your use of the website, your violation of these terms, or your violation of any rights of another party.`,
  },
  {
    id: 'governing-law',
    title: '10. Governing Law & Disputes',
    content: `These Terms of Service are governed by the laws of the State of New York, without regard to conflict of law principles. Any disputes arising from these terms or your use of our services shall be resolved through binding arbitration in New York, NY, in accordance with the rules of the American Arbitration Association. You agree to waive any right to participate in a class action lawsuit or class-wide arbitration.`,
  },
  {
    id: 'contact',
    title: '11. Contact Information',
    content: `For questions about these Terms of Service, please contact us at:\n\nSnug&Knot Legal Team\nEmail: legal@snugandknot.com\nMail: 180 Lafayette Street, New York, NY 10013\nPhone: +1 (212) 555-0189`,
  },
]

export default function TermsOfServicePage() {
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
          Terms of Service
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

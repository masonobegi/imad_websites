import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'

export default function Privacy() {
  return (
    <Layout>
      <Head>
        <title>Privacy Policy | OBGillustrator.com</title>
      </Head>
      <div className="max-w-2xl mx-auto px-5 sm:px-10 py-16 sm:py-24">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">Legal</p>
        <h1 className="font-serif text-4xl text-ink mb-2">Privacy Policy</h1>
        <p className="text-xs text-mist mb-12">Last updated: July 18, 2026 · 1:00 PM PST</p>

        <div className="space-y-10 text-mist leading-relaxed">

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">What we collect</h2>
            <p className="mb-3">When you use the contact form, commission form, or artwork inquiry forms on this site, we collect the email address and message you provide.</p>
            <p>We also track page views server-side — meaning when you visit a page, a counter is incremented and the referring website (if any) is recorded. This is stored as aggregate counts only. No personal information is collected, no cookies are set, and no third-party tracking scripts are loaded on this site.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">How we use it</h2>
            <p>Your information is used solely to respond to your message. We do not add you to any mailing list, share your information with third parties for marketing purposes, or sell your data.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Third-party services</h2>
            <p className="mb-3">This site uses the following third-party services to operate:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong className="text-ink">Resend</strong> — used to deliver emails when you submit a form. Your email address is passed to Resend solely for this purpose.</li>
              <li><strong className="text-ink">Stripe</strong> — print orders are processed by Stripe. Your payment information is entered directly on Stripe's secure interface and is never stored on this site. Stripe's own privacy policy governs how they handle your payment data.</li>
              <li><strong className="text-ink">Bay Photo Lab / fulfillment partners</strong> — when you place a print order, your name and shipping address are shared with Bay Photo Lab or other fulfillment partners solely to produce and deliver your order. These partners do not use your information for any other purpose.</li>
              <li><strong className="text-ink">Sticker Mule</strong> — sticker purchases are handled entirely on Sticker Mule's platform. <a href="https://www.stickermule.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-copper hover:text-shadow transition-colors">Their privacy policy</a> applies when you visit their site.</li>
              <li><strong className="text-ink">Railway</strong> — this site is hosted on Railway. Standard server logs (IP address, page requests) may be retained by Railway per their own policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Data retention</h2>
            <p>Emails sent through this site are retained in Imad's inbox for as long as he chooses to keep them. If you'd like your information removed, email <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">imadobegi@gmail.com</a> and it will be deleted.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Contact</h2>
            <p>Questions about this policy can be sent to <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">imadobegi@gmail.com</a>.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-edge text-sm text-mist">
          <Link href="/tos" className="hover:text-copper transition-colors">Terms of Service →</Link>
        </div>
      </div>
    </Layout>
  )
}

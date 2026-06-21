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
        <p className="text-xs text-mist mb-12">Last updated: June 2026</p>

        <div className="space-y-10 text-mist leading-relaxed">

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">What we collect</h2>
            <p>When you use the contact form, commission form, or artwork inquiry forms on this site, we collect the email address and message you provide. We do not collect any information passively — there are no tracking cookies, analytics scripts, or advertising pixels on this site.</p>
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
              <li><strong className="text-ink">Sticker Mule</strong> — sticker purchases are handled entirely on Sticker Mule's platform. Their own privacy policy applies when you visit their site.</li>
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

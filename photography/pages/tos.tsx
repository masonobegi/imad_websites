import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'

export default function Terms() {
  return (
    <Layout>
      <Head>
        <title>Terms of Service | OBGillustrator.com</title>
      </Head>
      <div className="max-w-2xl mx-auto px-5 sm:px-10 py-16 sm:py-24">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">Legal</p>
        <h1 className="font-serif text-4xl text-ink mb-2">Terms of Service</h1>
        <p className="text-xs text-mist mb-12">Last updated: June 2026</p>

        <div className="space-y-10 text-mist leading-relaxed">

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Use of this site</h2>
            <p>OBGillustrator.com is the personal portfolio and storefront of Imad Obegi. By using this site you agree to use it only for its intended purpose — browsing artwork, making purchase inquiries, and placing orders. You may not scrape, copy, reproduce, or redistribute any content from this site without written permission.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Intellectual property</h2>
            <p>All artwork, photographs, illustrations, and designs displayed on this site are the exclusive property of Imad Obegi. Purchasing a print or original does not transfer any copyright or reproduction rights. You may not reproduce, publish, or create derivative works from any image on this site without explicit written consent.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Print orders</h2>
            <p>Photography prints are made to order. All sales are final once production has begun. If your order arrives damaged, contact <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">imadobegi@gmail.com</a> within 7 days of delivery with photos of the damage and we will arrange a replacement.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Original works and commissions</h2>
            <p>Inquiries about original paintings and commissions are handled directly by Imad. No sale is final until payment is confirmed in writing. Commission timelines are estimates and may vary. Deposits are non-refundable once work has begun.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Stickers</h2>
            <p>Sticker products are sold exclusively through Sticker Mule. All purchases, returns, and customer service for stickers are governed by <a href="https://www.stickermule.com/policies" target="_blank" rel="noopener noreferrer" className="text-copper hover:text-shadow transition-colors">Sticker Mule's policies</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Limitation of liability</h2>
            <p>This site is provided as-is. Imad Obegi is not liable for any damages arising from use of this site, inaccuracies in product descriptions, or delays in fulfillment beyond his reasonable control.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Contact</h2>
            <p>Questions about these terms can be sent to <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">imadobegi@gmail.com</a>.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-edge text-sm text-mist">
          <Link href="/privacy" className="hover:text-copper transition-colors">Privacy Policy →</Link>
        </div>
      </div>
    </Layout>
  )
}

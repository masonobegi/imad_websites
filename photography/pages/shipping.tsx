import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'

export default function Shipping() {
  return (
    <Layout>
      <Head>
        <title>Shipping Policy | OBGillustrator.com</title>
      </Head>
      <div className="max-w-2xl mx-auto px-5 sm:px-10 py-16 sm:py-24">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">Legal</p>
        <h1 className="font-serif text-4xl text-ink mb-2">Shipping Policy</h1>
        <p className="text-xs text-mist mb-12">Last updated: July 21, 2026</p>

        <div className="space-y-10 text-mist leading-relaxed">

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Processing time</h2>
            <p>Photography prints are made to order. Most orders are produced and shipped within <strong className="text-ink">1–2 weeks</strong> of purchase. Larger sizes, canvas, and metal prints may take slightly longer. You&rsquo;ll receive an email when your order ships.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Shipping methods &amp; cost</h2>
            <p className="mb-3">Prints ship flat and protected via USPS or FedEx. <strong className="text-ink">Shipping is included at no extra charge for all orders within the United States.</strong></p>
            <p>Original paintings are packed and shipped individually; shipping arrangements for originals are confirmed directly by email after purchase.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Delivery area</h2>
            <p>We currently ship within the United States. If you are located outside the US and would like to order, email <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">imadobegi@gmail.com</a> before ordering so we can arrange shipping and provide a quote.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Tracking</h2>
            <p>Once your order ships, tracking information is sent to the email address used at checkout. Please allow a day or two for tracking to update after you receive the notification.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Lost or damaged in transit</h2>
            <p>If your order arrives damaged or does not arrive at all, contact us at <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">imadobegi@gmail.com</a> within 14 days. See our <Link href="/refunds" className="text-copper hover:text-shadow transition-colors">Refund &amp; Return Policy</Link> for how replacements and refunds are handled.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Stickers</h2>
            <p>Sticker orders are produced and shipped directly by Sticker Mule under their own shipping timelines and policies.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Contact</h2>
            <p>Questions about shipping can be sent to <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">imadobegi@gmail.com</a>.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-edge text-sm text-mist flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/refunds" className="hover:text-copper transition-colors">Refund &amp; Return Policy →</Link>
          <Link href="/tos" className="hover:text-copper transition-colors">Terms of Service →</Link>
          <Link href="/privacy" className="hover:text-copper transition-colors">Privacy Policy →</Link>
        </div>
      </div>
    </Layout>
  )
}

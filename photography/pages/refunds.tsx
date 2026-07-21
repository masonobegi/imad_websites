import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'

export default function Refunds() {
  return (
    <Layout>
      <Head>
        <title>Refund & Return Policy | OBGillustrator.com</title>
      </Head>
      <div className="max-w-2xl mx-auto px-5 sm:px-10 py-16 sm:py-24">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">Legal</p>
        <h1 className="font-serif text-4xl text-ink mb-2">Refund &amp; Return Policy</h1>
        <p className="text-xs text-mist mb-12">Last updated: July 21, 2026</p>

        <div className="space-y-10 text-mist leading-relaxed">

          <section>
            <p>We want you to be happy with your artwork. Because nearly everything sold here is made to order or one of a kind, please read this policy carefully before purchasing. If anything is unclear, email <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">imadobegi@gmail.com</a> before placing your order.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Photography prints</h2>
            <p className="mb-3">Photography prints are produced individually for each order by our print lab, so we cannot accept returns or issue refunds for change of mind, buyer&rsquo;s remorse, incorrect size selection, or incorrect medium selection once production has begun. Please use the size and crop preview on each photo before ordering.</p>
            <p className="mb-3"><strong className="text-ink">Damaged, defective, or incorrect orders.</strong> If your print arrives damaged, defective, or is not what you ordered, contact us within <strong className="text-ink">14 days of delivery</strong> at <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">imadobegi@gmail.com</a> with your order number and clear photos of the issue (and the packaging, if damaged in transit). We will send a free replacement or, if a replacement isn&rsquo;t possible, issue a full refund to your original payment method.</p>
            <p><strong className="text-ink">Cancellations.</strong> Orders can be cancelled for a full refund within <strong className="text-ink">24 hours</strong> of purchase, as long as production has not yet started. Email us as soon as possible with your order number.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Original paintings</h2>
            <p>Original paintings are unique, one-of-a-kind works and are sold as final sale. If an original arrives damaged from shipping, contact us within <strong className="text-ink">7 days of delivery</strong> with photos of the damage and packaging and we will work with you on a resolution, which may include repair, partial refund, or full refund depending on the circumstances.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Commissions</h2>
            <p>Commissioned work is custom-created for you. Deposits secure your place in the queue and cover materials and initial work; deposits are <strong className="text-ink">non-refundable once work has begun</strong>. If you cancel before work has started, your deposit is fully refundable. Commission timelines are estimates and may vary. Final commissioned pieces are not eligible for return.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Stickers</h2>
            <p>Stickers are sold and fulfilled entirely through Sticker Mule. All returns, refunds, and customer service for sticker orders are handled by Sticker Mule under <a href="https://www.stickermule.com/legal/terms" target="_blank" rel="noopener noreferrer" className="text-copper hover:text-shadow transition-colors">their policies</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">How refunds are issued</h2>
            <p>Approved refunds are returned to your original payment method through Stripe, our payment processor. Once a refund is issued it typically appears on your statement within <strong className="text-ink">5–10 business days</strong>, depending on your bank or card issuer. We do not charge any restocking or processing fees on approved refunds.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">How to request a refund or replacement</h2>
            <p className="mb-3">Email <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">imadobegi@gmail.com</a> and include:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Your order number or the email used at checkout</li>
              <li>The item(s) affected</li>
              <li>A description of the problem and photos, if applicable</li>
            </ul>
            <p className="mt-3">We aim to respond to all refund and replacement requests within 2–3 business days.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">Contact</h2>
            <p>Questions about this policy can be sent to <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">imadobegi@gmail.com</a>.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-edge text-sm text-mist flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/shipping" className="hover:text-copper transition-colors">Shipping Policy →</Link>
          <Link href="/tos" className="hover:text-copper transition-colors">Terms of Service →</Link>
          <Link href="/privacy" className="hover:text-copper transition-colors">Privacy Policy →</Link>
        </div>
      </div>
    </Layout>
  )
}

import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'

const FAQS = [
  {
    q: 'How do I order a print?',
    a: 'Browse the Photography shop, click any photo, choose your size and medium (metal or canvas), and add it to your cart. Checkout is handled securely through Stripe. Prints ship flat within 1–2 weeks.',
  },
  {
    q: 'What sizes and mediums are available for photography prints?',
    a: 'Prints are available in multiple sizes. You can choose between metal prints (vibrant, modern, aluminum) or canvas prints (warm, classic). Select your preferred size and medium in the photo detail view.',
  },
  {
    q: 'Does shipping cost extra?',
    a: 'Shipping is included in the United States for all photography prints. International shipping — contact us for a quote.',
  },
  {
    q: 'How long does shipping take?',
    a: 'All prints are made to order and typically ship within 1–2 weeks. You\'ll receive an email confirmation when your order ships.',
  },
  {
    q: 'Can I commission a custom painting?',
    a: 'Yes! Imad takes commissions for watercolors, encaustic paintings, digital illustrations, and more. Visit the Commission page to describe your project — he\'ll get back to you to discuss details and pricing.',
  },
  {
    q: 'What is an encaustic painting?',
    a: 'Encaustic painting is an ancient technique that uses pigmented beeswax fused with heat. Each layer is melted and fused to the one beneath it, creating rich depth and luminosity that can\'t be replicated in any other medium.',
  },
  {
    q: 'Are the fine art originals for sale?',
    a: 'Some originals are marked as "Available" in the gallery. Click any painting to see its availability and price. If you\'re interested in a piece not listed as available, feel free to inquire — Imad can also create a similar piece on commission.',
  },
  {
    q: 'Where are Imad\'s stickers sold?',
    a: 'Stickers are sold through Sticker Mule. Visit the Stickers page and click "Shop on Sticker Mule" to browse and order.',
  },
  {
    q: 'Can I return or exchange a print?',
    a: 'Because all prints are made to order specifically for you, returns aren\'t accepted unless the item arrives damaged. If your print arrives damaged, email imadobegi@gmail.com with a photo and we\'ll make it right.',
  },
  {
    q: 'How do I get in touch?',
    a: 'Use the Contact form on this site, email imadobegi@gmail.com directly, or reach out on Instagram @imadobegi.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <Layout>
      <Head>
        <title>FAQ | OBGillustrator.com</title>
        <meta name="description" content="Frequently asked questions about ordering prints, commissions, encaustic paintings, and more from Imad Obegi." />
      </Head>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">Help</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-8 leading-tight">Frequently Asked Questions</h1>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-edge">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-edge/20 transition-colors gap-4"
                aria-expanded={open === i}
              >
                <span className="text-sm text-ink font-medium leading-snug">{faq.q}</span>
                <svg
                  className={`w-4 h-4 text-mist flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-mist text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-edge text-center">
          <p className="text-mist text-sm mb-4">Still have a question?</p>
          <Link
            href="/contact"
            className="inline-block border border-copper text-copper px-6 py-2.5 text-sm tracking-widest uppercase hover:bg-copper hover:text-darkroom transition-colors"
          >
            Contact Imad
          </Link>
        </div>
      </div>
    </Layout>
  )
}

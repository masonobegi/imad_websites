import { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/send-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Layout>
      <Head>
        <title>Contact | OBGillustrator.com</title>
        <meta name="description" content="Get in touch with Imad Obegi — artist, photographer, and illustrator." />
      </Head>

      <div className="max-w-2xl mx-auto px-5 sm:px-10 py-16 sm:py-24">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">Get in touch</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-4 leading-tight">Contact</h1>
        <p className="text-mist text-base leading-relaxed mb-10">
          Questions about a piece, print orders, commissions, or anything else — Imad reads every message.
        </p>

        {status === 'sent' ? (
          <div className="border border-edge px-8 py-10 text-center">
            <p className="font-serif text-2xl text-ink mb-2">Message sent</p>
            <p className="text-mist text-sm">Imad will be in touch soon. Check your inbox for a confirmation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-mist uppercase tracking-widest mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-edge bg-canvas text-ink text-sm px-4 py-3 placeholder:text-mist focus:outline-none focus:border-shadow transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-mist uppercase tracking-widest mb-1.5">Email <span className="text-copper">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-edge bg-canvas text-ink text-sm px-4 py-3 placeholder:text-mist focus:outline-none focus:border-shadow transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-mist uppercase tracking-widest mb-1.5">Message <span className="text-copper">*</span></label>
              <textarea
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                rows={6}
                className="w-full border border-edge bg-canvas text-ink text-sm px-4 py-3 placeholder:text-mist focus:outline-none focus:border-shadow transition-colors resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-500">Something went wrong — please try again or email <a href="mailto:imadobegi@gmail.com" className="underline">imadobegi@gmail.com</a> directly.</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full sm:w-auto px-10 py-4 bg-copper text-darkroom text-sm tracking-wider uppercase hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}

        <div className="mt-14 pt-10 border-t border-edge grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-xs text-mist uppercase tracking-widest mb-2">Email</p>
            <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">
              imadobegi@gmail.com
            </a>
          </div>
          <div>
            <p className="text-xs text-mist uppercase tracking-widest mb-2">Instagram</p>
            <a href="https://www.instagram.com/imadobegi/" target="_blank" rel="noopener noreferrer" className="text-ink hover:text-copper transition-colors">
              @imadobegi
            </a>
          </div>
          <div>
            <p className="text-xs text-mist uppercase tracking-widest mb-2">Facebook</p>
            <a href="https://www.facebook.com/imad.obegi/" target="_blank" rel="noopener noreferrer" className="text-ink hover:text-copper transition-colors">
              imad.obegi
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}

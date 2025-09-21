"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/presentation/components/ui/dialog"
import { Button } from "@/presentation/components/ui/button"

export function ContactModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [posting, setPosting] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({})
  // local success/error UI replaced by toasts

  function validate() {
    const next: { name?: string; email?: string; message?: string } = {}
    if (!name.trim() || name.trim().length < 2) next.name = 'Please enter your name'
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) next.email = 'Please enter a valid email address'
    if (!message.trim()) next.message = 'Message cannot be empty'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast('Fix form errors', 'Please correct the highlighted fields and try again.')
      })
      return
    }

    ;(async () => {
      try {
        setPosting(true)
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to send')

        // show success toast
        import("@/presentation/utils/toast").then(({ success: successToast }) => {
          successToast('Message sent', 'Thanks — I will get back to you soon.')
        })

        // close modal shortly after success
        setTimeout(() => setOpen(false), 900)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)

        // show error toast
        import("@/presentation/utils/toast").then(({ error: errorToast }) => {
          errorToast('Failed to send message', msg)
        })
      } finally {
        setPosting(false)
      }
    })()
  }

  const isFormValid = !posting && !errors.name && !errors.email && !errors.message && name.trim().length > 0 && email.trim().length > 0 && message.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full rounded-xl p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-xl border border-gray-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <DialogTitle className="text-xl font-semibold">Contact Me</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Send me a brief message and I&apos;ll get back to you.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <label className="flex flex-col text-sm">
            <span className="text-xs text-slate-500 mb-1">Name</span>
            <input
              required
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-2 ${errors.name ? 'border border-red-300 focus:ring-red-400' : 'border border-gray-200 dark:border-slate-700 focus:ring-accent'}`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-xs text-slate-500 mb-1">Email</span>
            <input
              required
              placeholder="you@domain.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-2 ${errors.email ? 'border border-red-300 focus:ring-red-400' : 'border border-gray-200 dark:border-slate-700 focus:ring-accent'}`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-xs text-slate-500 mb-1">Message</span>
            <textarea
              required
              placeholder="Write your message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className={`w-full rounded-md px-3 py-2 h-36 bg-transparent focus:outline-none focus:ring-2 resize-none ${errors.message ? 'border border-red-300 focus:ring-red-400' : 'border border-gray-200 dark:border-slate-700 focus:ring-accent'}`}
            />
            {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
          </label>

          <div className="flex justify-end items-center gap-3 mt-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="px-4 py-2">Cancel</Button>
            <Button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-gradient-to-r from-accent to-accent-600 text-white shadow-md hover:brightness-95">{posting ? 'Sending...' : 'Send'}</Button>
          </div>
          {/* toasts show success/error messages now */}
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ContactModal

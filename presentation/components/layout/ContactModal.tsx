"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/presentation/components/ui/dialog"
import { Button } from "@/presentation/components/ui/button"

export function ContactModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(`Contact from ${name}`)
    const body = encodeURIComponent(message + "\n\nFrom: " + name + " <" + email + ">")
    window.location.href = `mailto:${encodeURIComponent("bryondevelops@gmail.com")}?subject=${subject}&body=${body}`
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full rounded-xl p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-xl border border-gray-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Contact Me</h3>
            <p className="text-sm text-muted-foreground mt-1">Send me a brief message and I&apos;ll get back to you.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <label className="flex flex-col text-sm">
            <span className="text-xs text-slate-500 mb-1">Name</span>
            <input required placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 dark:border-slate-700 rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent" />
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-xs text-slate-500 mb-1">Email</span>
            <input required placeholder="you@domain.com" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 dark:border-slate-700 rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent" />
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-xs text-slate-500 mb-1">Message</span>
            <textarea required placeholder="Write your message..." value={message} onChange={e => setMessage(e.target.value)} className="w-full border border-gray-200 dark:border-slate-700 rounded-md px-3 py-2 h-36 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
          </label>

          <div className="flex justify-end items-center gap-3 mt-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="px-4 py-2">Cancel</Button>
            <Button type="submit" className="px-4 py-2 bg-gradient-to-r from-accent to-accent-600 text-white shadow-md hover:brightness-95">Send</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ContactModal

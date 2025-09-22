"use client"

import { Mail, Github, Linkedin } from "lucide-react"
import { Button } from "@/presentation/components/ui/button"

export default function ContactPage() {
  return (
    <div className="relative min-h-screen">
      {/* Full screen background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -z-10" />

      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Secondary accent orbs */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
              <span className="text-sm text-white/80 font-medium">Get In Touch</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Let&apos;s Connect
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              I&apos;m always interested in new opportunities and collaborations.
              Whether you have a project in mind or just want to say hello, feel free to reach out!
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {/* Email */}
            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                  <p className="text-gray-400 text-sm mb-3">Drop me a line anytime</p>
                  <a
                    href="mailto:hello@portfolio.dev"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    hello@portfolio.dev
                  </a>
                </div>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
                  <Linkedin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">LinkedIn</h3>
                  <p className="text-gray-400 text-sm mb-3">Let&apos;s connect professionally</p>
                  <a
                    href="https://linkedin.com/in/yourprofile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    linkedin.com/in/yourprofile
                  </a>
                </div>
              </div>
            </div>

            {/* GitHub */}
            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 md:col-span-2 lg:col-span-1">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 shadow-lg">
                  <Github className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">GitHub</h3>
                  <p className="text-gray-400 text-sm mb-3">Check out my code</p>
                  <a
                    href="https://github.com/yourusername"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    github.com/yourusername
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="max-w-2xl mx-auto bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Start a Project?</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                I&apos;m currently available for freelance work and exciting opportunities.
                Let&apos;s discuss how we can bring your ideas to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Send Message</span>
                  </div>
                </Button>
                <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 py-3">
                  Download Resume
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
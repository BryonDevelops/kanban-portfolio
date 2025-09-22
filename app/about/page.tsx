"use client"

import { Code2, Palette, Zap, Mail, Github, Linkedin } from "lucide-react"
import { Button } from "@/presentation/components/ui/button"

export default function AboutPage() {
  const skills = [
    { name: "React/Next.js", icon: Code2, color: "from-blue-500 to-cyan-500" },
    { name: "TypeScript", icon: Code2, color: "from-blue-600 to-blue-800" },
    { name: "Tailwind CSS", icon: Palette, color: "from-teal-500 to-green-500" },
    { name: "Node.js", icon: Zap, color: "from-green-500 to-emerald-600" },
    { name: "Supabase", icon: Zap, color: "from-orange-500 to-red-500" },
    { name: "UI/UX Design", icon: Palette, color: "from-purple-500 to-pink-500" },
  ]

  const experiences = [
    {
      year: "2024",
      title: "Full-Stack Developer",
      company: "Freelance",
      description: "Building modern web applications with cutting-edge technologies. Specializing in React, Next.js, and cloud solutions."
    },
    {
      year: "2023",
      title: "Frontend Developer",
      company: "Tech Startup",
      description: "Developed responsive user interfaces and improved user experience across multiple client projects."
    },
    {
      year: "2022",
      title: "Web Developer",
      company: "Digital Agency",
      description: "Created custom websites and web applications, focusing on performance and accessibility."
    }
  ]

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
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
              <span className="text-sm text-white/80 font-medium">About Me</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Passionate Developer
              </span>
              <br />
              <span className="text-white/90">Creating Digital Experiences</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              I&apos;m a full-stack developer with a passion for creating beautiful, functional, and user-centered digital experiences.
              With expertise in modern web technologies, I bring ideas to life through clean code and thoughtful design.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Get In Touch</span>
                </div>
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="border-white/20 bg-white/5 hover:bg-white/10 text-white">
                  <Github className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 bg-white/5 hover:bg-white/10 text-white">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-16 sm:mb-20 lg:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Skills & Expertise</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Technologies and tools I use to bring ideas to life
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/5"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${skill.color} shadow-lg`}>
                      <skill.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                      {skill.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-16 sm:mb-20 lg:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Experience</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                My journey in web development and the projects that shaped my career
              </p>
            </div>

            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <div
                  key={index}
                  className="relative pl-8 sm:pl-12 border-l-2 border-white/20 last:border-l-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-3 sm:-left-4 top-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/20 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{exp.title}</h3>
                        <p className="text-blue-400 font-medium">{exp.company}</p>
                      </div>
                      <div className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                        {exp.year}
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Section */}
          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">My Mission</h2>
              <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 sm:p-12">
                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-6">
                  I believe in the power of technology to solve real-world problems and create meaningful connections.
                  Every project I work on is an opportunity to push boundaries, learn something new, and deliver
                  exceptional results that make a difference.
                </p>
                <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                  When I&apos;m not coding, you&apos;ll find me exploring new technologies, contributing to open-source projects,
                  or sharing knowledge with the developer community. I&apos;m always excited to take on new challenges
                  and collaborate on innovative solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
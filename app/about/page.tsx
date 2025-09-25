"use client"

import { Code2, Palette, Mail, Github, Linkedin, Database, Server, Cloud, GitBranch, Figma, TestTube } from "lucide-react"
import { SectionBadge } from "@/presentation/components/shared/section-badge"
import { Button } from "@/presentation/components/ui/button"
import { ExperienceCard } from "@/presentation/components/features/about/experience-card"
import { SkillCard } from "@/presentation/components/features/about/skill-card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/presentation/components/ui/carousel"
import { Client } from "../sanity/client"
import React, { useEffect, useState, Suspense } from "react"
import dynamic from 'next/dynamic'
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"

// Lazy load heavy components
const HeavyBackgroundEffects = dynamic(() => import('@/presentation/components/shared/heavy-background-effects'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-96" />
})

type Experience = {
  _id: string
  title: string
  company: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
  description: string
  location?: string
  technologies?: string[]
  companyUrl?: string
  featured?: boolean
}

export default function AboutPage() {
  const skills = React.useMemo(() => [
    { name: "React/Next.js", icon: Code2, color: "from-blue-500 to-cyan-500" },
    { name: "TypeScript", icon: Code2, color: "from-blue-600 to-blue-800" },
    { name: "JavaScript", icon: Code2, color: "from-yellow-500 to-orange-500" },
    { name: "Tailwind CSS", icon: Palette, color: "from-teal-500 to-green-500" },
    { name: "Node.js", icon: Server, color: "from-green-500 to-emerald-600" },
    { name: "Supabase", icon: Database, color: "from-orange-500 to-red-500" },
    { name: "PostgreSQL", icon: Database, color: "from-blue-700 to-indigo-800" },
    { name: "Git/GitHub", icon: GitBranch, color: "from-gray-600 to-gray-800" },
    { name: "UI/UX Design", icon: Palette, color: "from-purple-500 to-pink-500" },
    { name: "Figma", icon: Figma, color: "from-purple-600 to-pink-600" },
    { name: "Vercel", icon: Cloud, color: "from-black to-gray-800" },
    { name: "Jest/Testing", icon: TestTube, color: "from-red-500 to-pink-600" },
    { name: "API Development", icon: Server, color: "from-indigo-500 to-purple-600" },
    { name: "Responsive Design", icon: Palette, color: "from-cyan-500 to-blue-500" },
  ], [])

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchExperiences = async () => {
      try {
        // Optimized: Single query with featured experiences first, then by start date
        const data = await Client.fetch('*[_type == "experienceCard"] | order(featured desc, startDate desc)')
        if (isMounted) {
          setExperiences(data)
        }
      } catch (error) {
        console.error('Error fetching experiences:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchExperiences()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* Full screen background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50/80 via-blue-50/60 to-purple-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />

      {/* Enhanced Background Effects - Lazy loaded */}
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800" />}>
        <HeavyBackgroundEffects />
      </Suspense>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <SectionBadge text="About Me" className="mb-6" />

            {/* Profile Image */}
            <div className="mb-8 relative">
              <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 dark:from-pink-400/10 dark:via-purple-400/10 dark:to-blue-400/10 blur-2xl scale-110 animate-pulse" />
                <Image
                  src="/heroimg_dark_optimized.webp"
                  alt="Profile illustration"
                  fill
                  sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, (max-width: 1024px) 192px, (max-width: 1280px) 224px, 224px"
                  className="object-contain drop-shadow-xl relative z-10 rounded-full"
                  priority
                  quality={85}
                />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 dark:from-white dark:via-blue-100 dark:to-purple-200 bg-clip-text text-transparent">
                Passionate Developer
              </span>
              <br />
              <span className="text-gray-900 dark:text-white/90">Creating Digital Experiences</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              I&apos;m a full-stack developer with a passion for creating beautiful, functional, and user-centered digital experiences.
              With expertise in modern web technologies, I bring ideas to life through clean code and thoughtful design.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Get In Touch</span>
                </div>
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="border-gray-200/60 dark:border-white/20 bg-white/90 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white">
                  <Github className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-gray-200/60 dark:border-white/20 bg-white/90 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-16 sm:mb-20 lg:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Skills & Expertise</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Technologies and tools I use to bring ideas to life
              </p>
            </div>

            <div className="relative px-4 sm:px-8 lg:px-12">
              {/* Enhanced background effects for skills section */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/3 dark:via-purple-500/3 dark:to-pink-500/3 rounded-3xl blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-transparent to-emerald-500/3 dark:from-cyan-500/2 dark:to-emerald-500/2 rounded-3xl blur-2xl" />

              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 3000,
                    stopOnInteraction: false,
                  }),
                ]}
                className="w-full relative z-10"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {skills.map((skill, index) => (
                    <CarouselItem key={skill.name} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/6">
                      <div className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <SkillCard
                          name={skill.name}
                          icon={skill.icon}
                          color={skill.color}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 bg-white/95 dark:bg-white/15 border-gray-200/80 dark:border-white/25 hover:bg-white dark:hover:bg-white/25 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-125 hover:rotate-12 backdrop-blur-md" />
                <CarouselNext className="right-0 bg-white/95 dark:bg-white/15 border-gray-200/80 dark:border-white/25 hover:bg-white dark:hover:bg-white/25 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-125 hover:-rotate-12 backdrop-blur-md" />
              </Carousel>

              {/* Enhanced decorative elements */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-40 h-2 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent rounded-full blur-sm animate-pulse" />
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-transparent via-purple-500/60 to-transparent rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }} />

              {/* Corner accent elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-lg animate-bounce" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -top-4 -right-4 w-6 h-6 bg-gradient-to-bl from-pink-500/20 to-cyan-500/20 rounded-full blur-lg animate-bounce" style={{ animationDelay: '1.5s' }} />
              <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-full blur-lg animate-bounce" style={{ animationDelay: '2s' }} />
              <div className="absolute -bottom-4 -right-4 w-7 h-7 bg-gradient-to-tl from-purple-500/20 to-pink-500/20 rounded-full blur-lg animate-bounce" style={{ animationDelay: '2.5s' }} />

              {/* Floating geometric shapes */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500/30 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
              <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-500/30 rounded-full animate-ping" style={{ animationDelay: '1.2s' }} />
              <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-pink-500/30 rounded-full animate-ping" style={{ animationDelay: '2.2s' }} />
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-16 sm:mb-20 lg:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Experience</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                My journey in web development and the projects that shaped my career
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200/60 dark:border-blue-800/60">
                <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <span className="text-sm italic text-blue-700 dark:text-blue-300 font-medium">References available upon request</span>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-8 max-w-md mx-auto">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading experiences...
                  </p>
                </div>
              </div>
            ) : experiences.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-8 max-w-md mx-auto">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No experiences found. Add some experience cards in Sanity Studio!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Check the browser console for any errors.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {experiences.map((exp: Experience, index: number) => (
                  <ExperienceCard
                    key={exp._id || index}
                    experience={exp}
                    index={index}
                    isLast={index === experiences.length - 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mission Section */}
          {/* <div className="text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">My Mission</h2>
              <div className="bg-gradient-to-r from-white/90 via-white/80 to-white/90 dark:from-white/10 dark:via-white/5 dark:to-white/10 backdrop-blur-sm border border-gray-200/60 dark:border-white/20 rounded-3xl p-8 sm:p-12">
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  I believe in the power of technology to solve real-world problems and create meaningful connections.
                  Every project I work on is an opportunity to push boundaries, learn something new, and deliver
                  exceptional results that make a difference.
                </p>
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                  When I&apos;m not coding, you&apos;ll find me exploring new technologies, contributing to open-source projects,
                  or sharing knowledge with the developer community. I&apos;m always excited to take on new challenges
                  and collaborate on innovative solutions.
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}
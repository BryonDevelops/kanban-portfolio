export interface Category {
  name: string
  count: number
  color: string
}

export const categories: Category[] = [
  { name: "Development", count: 12, color: "from-blue-500 to-cyan-500" },
  { name: "Design", count: 8, color: "from-purple-500 to-pink-500" },
  { name: "Technology", count: 15, color: "from-green-500 to-emerald-500" },
  { name: "Performance", count: 6, color: "from-orange-500 to-red-500" },
  { name: "Accessibility", count: 4, color: "from-teal-500 to-blue-500" }
]
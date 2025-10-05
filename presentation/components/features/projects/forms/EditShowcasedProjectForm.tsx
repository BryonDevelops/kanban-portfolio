"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Save } from 'lucide-react'
import { ShowcasedProject } from '@/presentation/components/shared/ProjectCard'
import { ImageUploadDropdown } from '@/presentation/components/shared/image-upload-dropdown'
import { TechStackPicker } from '../../../shared/TechStackPicker'
import { TECH_STACK, TechItem } from '../tech-data';

interface EditShowcasedProjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ShowcasedProject | null
  onProjectUpdated: (project: ShowcasedProject) => void
}

export function EditShowcasedProjectForm({
  open,
  onOpenChange,
  project,
  onProjectUpdated
}: EditShowcasedProjectFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<Omit<ShowcasedProject, 'id'>>({
    title: '',
    description: '',
    technologies: [],
    image: '',
    link: '',
    github: '',
    featured: false
  })



  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        image: project.image || '',
        link: project.link || '',
        github: project.github || '',
        featured: project.featured || false
      })
    }
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Project title is required')
      }

      if (!formData.description.trim()) {
        throw new Error('Project description is required')
      }

      if (!project?.id) {
        throw new Error('Project ID is missing')
      }

      // Create the updated project object
      const updatedProject: ShowcasedProject = {
        id: project.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        technologies: formData.technologies,
        image: formData.image?.trim() || undefined,
        link: formData.link?.trim() || undefined,
        github: formData.github?.trim() || undefined,
        featured: formData.featured
      }

      // Show success toast
      import("@/presentation/utils/toast").then(({ success }) => {
        success("Project updated!", `"${formData.title}" has been successfully updated.`)
      })

      // Close dialog and notify parent
      onOpenChange(false)
      onProjectUpdated(updatedProject)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project'
      setError(errorMessage)

      // Show error toast
      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to update project", errorMessage)
      })
    } finally {
      setLoading(false)
    }
  }



  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Showcase Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Project Title *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter project title"
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project..."
              required
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Technologies */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tech Stack</label>
            <TechStackPicker
              value={formData.technologies
                .map(t => TECH_STACK.find(item => item.id === (typeof t === 'string' ? t : (t as TechItem).id))!)
                .filter(Boolean) as TechItem[]}
              onChange={techs => setFormData(prev => ({
                ...prev,
                technologies: techs.map(t => t.id)
              }))}
            />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Project Image
            </label>
            <ImageUploadDropdown
              value={formData.image}
              onChange={(value: string | undefined) => handleInputChange('image', value || '')}
              placeholder="Select or upload project image..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Optional: Add a cover image for your project
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="link" className="text-sm font-medium">
                Live Demo URL
              </label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="github" className="text-sm font-medium">
                GitHub URL
              </label>
              <Input
                id="github"
                type="url"
                value={formData.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center space-x-2">
            <input
              id="featured"
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="featured" className="text-sm font-medium">
              Featured Project
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Project
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
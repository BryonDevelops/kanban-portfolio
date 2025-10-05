import { useState } from 'react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Portal } from '@/presentation/components/shared/Portal';
import { ProjectCreate } from '../../../../../domain/board/schemas/project.schema';
import { Plus, X } from 'lucide-react';
import { TechStackPicker } from '../../../shared/TechStackPicker';
import { useBoardStore } from '../../../../stores/board/boardStore';
import { useIsAdmin } from '../../../shared/ProtectedRoute';
import { TECH_STACK, TechItem } from '../../../features/projects/tech-data';

import { ImageUploadDropdown } from '../../../shared/image-upload-dropdown';

interface CreateProjectFormProps {
  onProjectCreated?: () => void;
  trigger?: React.ReactNode;
  defaultStatus?: 'planning' | 'in-progress' | 'completed' | 'on-hold';
}

export function CreateProjectForm({ onProjectCreated, trigger, defaultStatus = 'planning' }: CreateProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const { addProject } = useBoardStore();
  const isAdmin = useIsAdmin();

  const [formData, setFormData] = useState<ProjectCreate>({
    title: '',
    description: '',
    status: defaultStatus,
    technologies: [],
    tags: [],
    start_date: undefined,
    end_date: undefined,
    url: '',
    image: '',
    attachments: [],
    notes: '',
    architecture: '',
    tasks: []
  });

  const handleInputChange = (field: keyof ProjectCreate, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please fill in the project title');
      return;
    }

    setLoading(true);

    try {
      await addProject(formData.status, formData.title, formData.description);
      onProjectCreated?.();
      setOpen(false);

      // Reset form
      setFormData({
        title: '',
        description: '',
        status: defaultStatus,
        technologies: [],
        tags: [],
        start_date: undefined,
        end_date: undefined,
        url: '',
        image: '',
        attachments: [],
        notes: '',
        architecture: '',
        tasks: []
      });
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      {trigger ? (
        <div onClick={() => setOpen(true)}>
          {trigger}
        </div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      )}

      <Portal
        open={open}
        onOpenChange={setOpen}
        title="Create New Project"
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Project Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter project title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-vertical"
              required
            />
          </div>

          {/* URLs */}
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Project URL
            </label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://your-project.com or https://github.com/username/repo"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Image</label>
            <ImageUploadDropdown
              value={formData.image}
              onChange={(url) => handleInputChange('image', url)}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
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

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tags
            </label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag (e.g., frontend)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="start_date" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date?.toISOString().split('T')[0] || ''}
                onChange={(e) =>
                  handleInputChange('start_date', e.target.value ? new Date(e.target.value) : undefined)
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="end_date" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date?.toISOString().split('T')[0] || ''}
                onChange={(e) =>
                  handleInputChange('end_date', e.target.value ? new Date(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Save Project
                </>
              )}
            </Button>
          </div>
        </form>
      </Portal>
    </div>
  );
}
import { useState } from 'react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/presentation/components/ui/dialog';
import { ProjectCreate, Project } from '../../../../../domain/board/schemas/project.schema';
import { Plus, X } from 'lucide-react';
import { TechStackPicker } from '../../../shared/TechStackPicker';
import { useBoardStore } from '../../../../stores/board/boardStore';
import { useIsAdmin } from '../../../shared/ProtectedRoute';
import { TECH_STACK, TechItem } from '../../../features/projects/tech-data';
import { useUser } from '@clerk/nextjs';
import { ImageUploadDropdown } from '../../../shared/image-upload-dropdown';

interface CreateProjectFormProps {
  onProjectCreated?: () => void;
  trigger?: React.ReactNode;
  defaultStatus?: 'planning' | 'in-progress' | 'completed' | 'on-hold';
}

export function CreateProjectForm({ onProjectCreated, trigger, defaultStatus = 'planning' }: CreateProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setColumns, columns } = useBoardStore();
  const isAdmin = useIsAdmin();
  const { user, isLoaded } = useUser();
  const isLoggedIn = isLoaded && !!user;
  const canSaveToDatabase = isLoggedIn && isAdmin;

  const BOARD_LOCAL_STORAGE_KEY = 'kanban-board-local-state';

  const saveBoardStateToLocalStorage = (columns: Record<string, Project[]>) => {
    try {
      localStorage.setItem(BOARD_LOCAL_STORAGE_KEY, JSON.stringify({
        columns,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save board state to localStorage:', error);
    }
  };

  // Form state
  const [formData, setFormData] = useState<ProjectCreate>({
    title: '',
    description: '',
    url: '',
    image: '',
    status: defaultStatus,
    technologies: [],
    tags: [],
    attachments: [],
    tasks: [],
    start_date: undefined,
    end_date: undefined,
  });

  // Remove manual tech input state
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Project title is required');
      }

      if (canSaveToDatabase) {
        // Save to database via API
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create project');
        }

        // Show success toast
        import("@/presentation/utils/toast").then(({ success }) => {
          success("Project created!", `"${formData.title}" has been successfully created.`);
        });
      } else {
        // Save locally to localStorage
        const newProject: Project = {
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: formData.title.trim(),
          description: formData.description?.trim() || undefined,
          url: formData.url?.trim() || undefined,
          image: formData.image?.trim() || undefined,
          status: formData.status,
          technologies: formData.technologies,
          tags: formData.tags,
          attachments: formData.attachments || [],
          tasks: formData.tasks || [],
          start_date: formData.start_date,
          end_date: formData.end_date,
          created_at: new Date(),
          updated_at: new Date()
        };

        // Determine which column to add the project to based on status
        const columnId =
          formData.status === 'planning' || formData.status === 'on-hold' ? 'ideas' :
          formData.status === 'in-progress' ? 'in-progress' :
          'completed';

        // Add project to local state
        const newColumns = { ...columns };
        if (!newColumns[columnId]) {
          newColumns[columnId] = [];
        }
        newColumns[columnId].push(newProject);
        setColumns(newColumns);

        // Save to localStorage
        saveBoardStateToLocalStorage(newColumns);

        // Show success toast
        import("@/presentation/utils/toast").then(({ success }) => {
          success("Project created locally!", `"${formData.title}" has been saved to your browser. Only admins can save to the database.`);
        });
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        url: '',
        image: '',
        status: 'planning',
        technologies: [],
        tags: [],
        attachments: [],
        tasks: [],
        start_date: undefined,
        end_date: undefined,
      });
  // setTechInput removed (no longer needed)
      setTagInput('');

      // Close dialog and notify parent
      setOpen(false);
      onProjectCreated?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);

      // Show error toast
      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to create project", errorMessage);
      });
    } finally {
      setLoading(false);
    }
  };



  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
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

  const handleInputChange = (field: keyof ProjectCreate, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
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
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* URL */}
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Project URL
            </label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Project Image
            </label>
            <ImageUploadDropdown
              value={formData.image}
              onChange={(value) => handleInputChange('image', value)}
              placeholder="Select or upload project image..."
            />
            <p className="text-xs text-muted-foreground">
              Optional: Add a cover image for your project (JPG, PNG, WebP, etc.) - upload from device, paste from clipboard, or browse Unsplash
            </p>
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
      </DialogContent>
    </Dialog>
  );
}
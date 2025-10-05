"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsAdmin } from '../../../shared/ProtectedRoute';
import { useUser } from '@clerk/nextjs';
import { useIsMobile } from '../../../../hooks/use-mobile';
import { SimpleEditor } from '@/presentation/components/shared/simple-editor';
import {
  X,
  Save,
  Plus,
  Edit3,
  Maximize2,
  Minimize2,
  FileText,
  User,
  Clock,
  Tag,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { Portal } from '../../../shared/Portal';
import { ImageUploadDropdown } from '../../../shared/image-upload-dropdown';
import { CategorySelector } from './CategorySelector';
import type { BlogPost } from '../BlogPostPortal';

interface CreateBlogPostFormProps {
  onBlogPostCreated?: (post: Omit<BlogPost, 'id'>) => void | Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateBlogPostForm({ onBlogPostCreated, trigger, open, onOpenChange }: CreateBlogPostFormProps) {
  const isAdmin = useIsAdmin();
  const { user, isLoaded } = useUser();
  const isLoggedIn = isLoaded && !!user;
  const canSaveToDatabase = isLoggedIn && isAdmin;
  const isMobile = useIsMobile();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: user?.fullName || user?.username || '',
    tags: [] as string[],
    categories: [] as string[], // Array of category IDs
    imageUrl: '',
  });

  // UI state
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalIsOpen;
  const setIsOpen = useCallback((value: boolean) => {
    if (open === undefined) {
      setInternalIsOpen(value);
    }
    onOpenChange?.(value);
  }, [open, onOpenChange]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSection, setActiveSection] = useState<'content' | 'settings'>('content');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Update author when user data loads
  useEffect(() => {
    if (user && !formData.author) {
      setFormData(prev => ({
        ...prev,
        author: user.fullName || user.username || '',
      }));
    }
  }, [user, formData.author]);

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const modalElement = modalRef.current;
      const composedPath = typeof event.composedPath === 'function' ? event.composedPath() : undefined;

      const isWithinModal = modalElement
        ? composedPath?.includes(modalElement) ?? modalElement.contains(target)
        : false;

      // Don't close modal if clicking on dropdown menu content or dialog content
      if (target.closest('[data-radix-popper-content-wrapper]') ||
          target.closest('[data-radix-dropdown-menu-content]') ||
          target.closest('[data-radix-dropdown-menu-trigger]') ||
          target.closest('[data-radix-dialog-overlay]') ||
          target.closest('[data-radix-dialog-content]') ||
          target.closest('[data-radix-dialog-trigger]') ||
          target.closest('[data-modal-safe="true"]')) {
        return;
      }

      if (!isWithinModal) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }

      if (canSaveToDatabase) {
        const publishedAt = new Date().toISOString();
        const readTime = Math.ceil(formData.content.replace(/<[^>]*>/g, '').split(' ').length / 200);
        const createdPost: Omit<BlogPost, 'id'> = {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          author: formData.author,
          publishedAt,
          tags: formData.tags,
          readTime,
          imageUrl: formData.imageUrl || undefined,
          featured: false,
          categories: formData.categories,
        };
        // Create in database via API
        const { imageUrl, ...rest } = createdPost;
        const normalizedImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';
        const payload = {
          ...rest,
          ...(normalizedImageUrl
            ? { imageUrl: normalizedImageUrl }
            : {}),
        };

        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type') || '';
          let errorMessage = 'Failed to create blog post';

          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const responseText = await response.text();
            errorMessage = responseText || errorMessage;
          }

          throw new Error(errorMessage);
        }

        setSuccess('Blog post created successfully!');

        // Notify parent after a short delay to show success message
        setTimeout(() => {
          if (onBlogPostCreated) {
            onBlogPostCreated(createdPost);
          }
          setIsOpen(false);
        }, 1500);
      } else {
        throw new Error('You must be logged in as an admin to create blog posts');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blog post';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleInputChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!canSaveToDatabase) {
    return null;
  }

  if (!isOpen) {
    return (
      <>
        {trigger ? (
          <div onClick={() => setIsOpen(true)} className="cursor-pointer">
            {trigger}
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            New Blog Post
          </button>
        )}
      </>
    );
  }

  const modalContent = (
    <div
      ref={modalRef}
      className={`w-full bg-white dark:bg-slate-900 shadow-2xl overflow-hidden relative flex flex-col ${
        isFullscreen
          ? 'h-screen max-w-none rounded-none'
          : isMobile
          ? 'h-full max-w-none rounded-lg'
          : 'max-w-5xl max-h-[90vh] rounded-xl'
      }`}
    >
        {/* Enhanced Header with Title */}
        <div className="flex-shrink-0 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
          {/* Top Row: Controls and Status */}
          <div className="flex justify-between items-center p-4 pb-0">
            <div className="flex items-center gap-3">
              {/* Empty space for consistency */}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Header Content */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            {/* Title Section */}
            <div className={`${isMobile ? 'mb-2' : 'mb-3 sm:mb-4'}`}>
              <div className={`flex items-start gap-2 ${isMobile ? 'gap-2' : 'sm:gap-3'} mb-2 group`}>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 flex-1`}
                    placeholder="Blog post title..."
                    autoFocus
                  />
                ) : (
                  <div className="relative flex-1">
                    <h1
                      className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1 relative group`}
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {formData.title || 'Untitled Blog Post'}
                    </h1>
                    {/* Underline hint */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></div>
                  </div>
                )}
                <div className={`flex items-center gap-1 ${isMobile ? 'gap-1' : 'sm:gap-2'} flex-shrink-0`}>
                  <div
                    className="p-1 rounded cursor-pointer transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                    title="Edit title"
                  >
                    <Edit3 className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors group-hover:text-blue-500 group-hover:scale-110 duration-200" />
                  </div>
                </div>
              </div>

              {/* Author and Read Time Row */}
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-col sm:flex-row sm:items-center sm:justify-between gap-4'} mb-4`}>
                {/* Author */}
                <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-slate-600 dark:text-slate-400`}>
                  <User className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'} flex-shrink-0`} />
                  <span>Author:</span>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 flex-1 min-w-0"
                    placeholder="Author name..."
                  />
                </div>

                {/* Read Time */}
                <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-slate-600 dark:text-slate-400`}>
                  <Clock className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'} flex-shrink-0`} />
                  <span>Read time: {Math.ceil(formData.content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length / 200)} min</span>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap items-center">
                <div className="flex items-center gap-2 mb-2 mr-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tags:</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">({formData.tags.length})</span>
                </div>
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-md text-xs font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                {/* Quick Add Tag */}
                <div className="flex items-center gap-1 ml-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag..."
                    className={`${isMobile ? 'w-24' : 'w-20 sm:w-24'} px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500`}
                  />
                  <button
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    className="p-1 text-purple-600 hover:text-purple-700 disabled:text-slate-400 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveSection('content')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'content'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div title="Content">
                  <Edit3 className="h-4 w-4" />
                </div>
                Content
              </div>
            </button>
            <button
              onClick={() => setActiveSection('settings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Settings
              </div>
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {(error || success) && (
          <div className="flex-shrink-0 p-4 pb-0">
            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                <Check className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeSection === 'content' ? (
            <div className="p-6 space-y-6">
              {/* Content Editor */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Content
                </label>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <SimpleEditor
                    content={formData.content || ''}
                    onChange={(newContent: string) => handleInputChange('content', newContent)}
                    placeholder="Start writing your amazing blog post..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Author & Metadata */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Author
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => handleInputChange('author', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Author name..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Read Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <div className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
                      {Math.ceil(formData.content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length / 200)} min
                    </div>
                  </div>
                </div>
              </div>

              {/* Excerpt Section (below Author & Read Time) */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Brief description of the post..."
                />
              </div>

              {/* Featured Image */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Featured Image
                </label>
                <ImageUploadDropdown
                  value={formData.imageUrl}
                  onChange={(value) => handleInputChange('imageUrl', value || '')}
                  placeholder="Select or upload featured image..."
                />
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tags
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Add a tag..."
                    />
                    <button
                      onClick={addTag}
                      disabled={!newTag.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Categories
                </label>
                <CategorySelector
                  selectedCategories={formData.categories}
                  onCategoriesChange={(categories) => handleInputChange('categories', categories)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md transform hover:scale-[1.02] disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
    </div>
  );

  // Render using shared Portal component
  return (
    <Portal
      open={isOpen}
      onOpenChange={setIsOpen}
      title={formData.title || 'Create Blog Post'}
      maxWidth="max-w-3xl"
      isFullscreen={isFullscreen}
      onToggleFullscreen={() => setIsFullscreen((v) => !v)}
    >
      {modalContent}
    </Portal>
  );
}

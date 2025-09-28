"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsAdmin } from '../../../shared/ProtectedRoute';
import { useUser } from '@clerk/nextjs';
import { StreamlinedBlogEditor } from './StreamlinedBlogEditor';
import { X, Save, Plus, Edit3, Maximize2, Minimize2, FileText, User, Clock } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ImageUploadDropdown } from '../../../shared/image-upload-dropdown';

interface CreateBlogPostFormProps {
  onBlogPostCreated?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateBlogPostForm({ onBlogPostCreated, trigger, open, onOpenChange }: CreateBlogPostFormProps) {
  const isAdmin = useIsAdmin();
  const { user, isLoaded } = useUser();
  const isLoggedIn = isLoaded && !!user;
  const canSaveToDatabase = isLoggedIn && isAdmin;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: user?.fullName || user?.username || '',
    tags: [] as string[],
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTag, setNewTag] = useState('');
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

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Don't close modal if clicking on dropdown menu content or dialog content
      if (target.closest('[data-radix-popper-content-wrapper]') ||
          target.closest('[data-radix-dropdown-menu-content]') ||
          target.closest('[data-radix-dropdown-menu-trigger]') ||
          target.closest('[data-radix-dialog-overlay]') ||
          target.closest('[data-radix-dialog-content]') ||
          target.closest('[data-radix-dialog-trigger]')) {
        return;
      }

      if (modalRef.current && !modalRef.current.contains(target)) {
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

  const handleBlogPostCreate = async (updatedData: {
    title: string;
    content: string;
    excerpt: string;
    imageUrl: string;
  }) => {
    try {
      if (canSaveToDatabase) {
        // Create in database via API
        const response = await fetch('/api/blog-posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...updatedData,
            author: formData.author,
            tags: formData.tags,
            readTime: Math.ceil(updatedData.content.replace(/<[^>]*>/g, '').split(' ').length / 200),
            publishedAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create blog post');
        }

        // Show success toast
        import("@/presentation/utils/toast").then(({ success }) => {
          success("Blog post created!", `"${updatedData.title}" has been successfully published.`);
        });

        setIsOpen(false);
        // Notify parent
        onBlogPostCreated?.();
      } else {
        throw new Error('You must be logged in as an admin to create blog posts');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blog post';

      // Show error toast
      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to create blog post", errorMessage);
      });
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

  const handleInputChange = (field: keyof typeof formData, value: string) => {
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
    <div className={`fixed z-[9999] bg-black/50 backdrop-blur-md ${
      isFullscreen
        ? 'inset-0 p-0'
        : 'inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6'
    }`}>
      <div
        ref={modalRef}
        className={`w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden relative ${
          isFullscreen
            ? 'max-w-none max-h-screen h-screen rounded-none flex flex-col'
            : 'max-w-4xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl'
        }`}
      >
        {/* Enhanced Header with Title */}
        <div className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
          {/* Top Row: Fullscreen toggle and Close Buttons */}
          <div className="flex justify-between items-center p-4 pb-0">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <div className="flex items-center gap-2">
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
            <div className="mb-3 sm:mb-4">
              <div className="flex items-start gap-2 sm:gap-3 mb-2 group">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    className="text-xl sm:text-2xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 flex-1"
                    placeholder="Blog post title..."
                    autoFocus
                  />
                ) : (
                  <div className="relative flex-1">
                    <h1
                      className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1 relative group"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {formData.title || 'Untitled Blog Post'}
                      {/* Subtle edit indicator */}
                      <span className="absolute -top-1 -right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-slate-400 font-normal">
                        click to edit
                      </span>
                    </h1>
                    {/* Underline hint */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></div>
                  </div>
                )}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <Edit3
                    className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors group-hover:text-blue-500 group-hover:scale-110 duration-200"
                    onClick={() => setIsEditingTitle(true)}
                  />
                  <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium hidden sm:inline">
                    Edit
                  </span>
                </div>
              </div>

              {/* Author and Read Time Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                {/* Author */}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <User className="h-3 w-3 flex-shrink-0" />
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
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-3 w-3 flex-shrink-0" />
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
                    className="w-20 sm:w-24 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
        </div>

        {/* Content */}
        <div className={`p-4 sm:p-6 overflow-y-auto relative z-10 ${isFullscreen ? 'flex-1' : ''}`} style={isFullscreen ? {} : { maxHeight: 'calc(95vh - 300px)' }}>
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Image URL */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Featured Image
                    </label>
                  </div>
                  <ImageUploadDropdown
                    value={formData.imageUrl}
                    onChange={(value) => handleInputChange('imageUrl', value || '')}
                    placeholder="Select or upload featured image..."
                  />
                </div>

                {/* Excerpt */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
                    placeholder="Brief description of the blog post..."
                  />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Content</h3>
              </div>

              <div className="space-y-2">
                <StreamlinedBlogEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  placeholder="Start writing your amazing blog post... Use the toolbar above to format your text, add headings, lists, links, and more!"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 ${isFullscreen ? 'mt-auto' : ''}`} style={isFullscreen ? {} : { minHeight: '60px', flexShrink: 0 }}>
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 sm:flex-initial px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => handleBlogPostCreate({
                title: formData.title,
                content: formData.content,
                excerpt: formData.excerpt,
                imageUrl: formData.imageUrl,
              })}
              disabled={!formData.title.trim() || !formData.content.trim()}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm ${
                !formData.title.trim() || !formData.content.trim()
                  ? 'bg-slate-400 cursor-not-allowed text-slate-200'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              Create Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render using portal to escape container bounds
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
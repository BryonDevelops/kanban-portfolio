"use client";

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/presentation/components/ui/button';
import { SimpleEditor } from '@/presentation/components/shared/simple-editor';
import { Save, X, Settings, FileText, ImageIcon, Edit3, User, Clock, Tag, Plus } from 'lucide-react';
import { useIsAdmin } from '../../../shared/ProtectedRoute';
import { useUser } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/presentation/components/ui/dialog';
import { Input } from '@/presentation/components/ui/input';
import { Textarea } from '@/presentation/components/ui/textarea';
import { ImageUploadDropdown } from '../../../shared/image-upload-dropdown';;
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StreamlinedBlogEditorProps {
  onBlogPostCreated?: () => void;
  trigger?: React.ReactNode;
  editMode?: boolean;
  initialData?: {
    title: string;
    content: string;
    excerpt: string;
    imageUrl: string;
    author?: string;
    tags?: string[];
  };
  onBlogPostUpdated?: (data: {
    title: string;
    content: string;
    excerpt: string;
    imageUrl: string;
  }) => void;
  onContentChange?: (content: string) => void;
  // Simple editor mode props
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

export function StreamlinedBlogEditor({
  onBlogPostCreated,
  trigger,
  editMode = false,
  initialData,
  onBlogPostUpdated,
  onContentChange,
  content,
  onChange,
  placeholder = "Start writing your blog post..."
}: StreamlinedBlogEditorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const isAdmin = useIsAdmin();
  const { user, isLoaded } = useUser();
  const isLoggedIn = isLoaded && !!user;
  const canSaveToDatabase = isLoggedIn && isAdmin;

  // Editor state
  const [title, setTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Initialize with initial data if in edit mode
  const prevInitialDataRef = useRef(initialData);
  useEffect(() => {
    if (editMode && initialData && initialData !== prevInitialDataRef.current) {
      setTitle(initialData.title);
      setEditorContent(initialData.content);
      setExcerpt(initialData.excerpt);
      setImageUrl(initialData.imageUrl);
      setAuthor(initialData.author || user?.fullName || user?.username || '');
      setTags(initialData.tags || []);
      prevInitialDataRef.current = initialData;
    }
  }, [editMode, initialData, user]);

  // Auto-generate excerpt from content
  useEffect(() => {
    if (!excerpt && editorContent) {
      // Extract first 150 characters from plain text content (remove markdown syntax)
      const plainText = editorContent
        .replace(/#{1,6}\s*/g, '') // Remove headers
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic
        .replace(/`([^`]+)`/g, '$1') // Remove inline code
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
        .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
        .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();

      const autoExcerpt = plainText.length > 150
        ? plainText.substring(0, 150) + '...'
        : plainText;
      setExcerpt(autoExcerpt);
    }
  }, [editorContent, excerpt]);

  // Calculate read time
  const readTime = Math.ceil(editorContent.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length / 200);

  const handleSave = async () => {
    if (!title.trim() || !editorContent.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editMode) {
        // In edit mode, just call the update callback
        onBlogPostUpdated?.({
          title: title.trim(),
          content: editorContent.trim(),
          excerpt: excerpt.trim(),
          imageUrl: imageUrl.trim(),
        });

        // Success toast
        import("@/presentation/utils/toast").then(({ success }) => {
          success("Blog post updated!", `"${title}" has been updated.`);
        });

        // Reset and close
        resetEditor();
        setOpen(false);
      } else if (canSaveToDatabase) {
        const response = await fetch('/api/blog-posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            excerpt: excerpt.trim(),
            content: editorContent.trim(),
            author: author.trim() || user?.fullName || user?.username || '',
            tags: tags,
            imageUrl: imageUrl.trim(),
            publishedAt: new Date().toISOString(),
            readTime: Math.ceil(editorContent.replace(/<[^>]*>/g, '').split(' ').length / 200),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create blog post');
        }

        // Success toast
        import("@/presentation/utils/toast").then(({ success }) => {
          success("Blog post created!", `"${title}" has been published.`);
        });

        // Reset and close
        resetEditor();
        setOpen(false);
        onBlogPostCreated?.();
      } else {
        throw new Error('You must be logged in as an admin to create blog posts');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save blog post';
      setError(errorMessage);

      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast(editMode ? "Failed to update blog post" : "Failed to create blog post", errorMessage);
      });
    } finally {
      setLoading(false);
    }
  };

  const resetEditor = () => {
    setTitle('');
    setEditorContent('');
    setExcerpt('');
    setImageUrl('');
    setAuthor('');
    setTags([]);
    setError(null);
  };

  // If used as a simple editor (content and onChange provided), render SimpleEditor directly
  if (content !== undefined && onChange) {
    return (
      <SimpleEditor
        content={content}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm">
            <Save className="h-4 w-4 mr-2" />
            New Blog Post
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-visible flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
          {/* Top Row: Close Buttons */}
          <div className="flex justify-end items-center p-4 pb-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                      {title || 'Untitled Blog Post'}
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Author */}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span>Author:</span>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 flex-1 min-w-0"
                    placeholder="Author name..."
                  />
                </div>

                {/* Read Time */}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span>Read time: {readTime} min</span>
                </div>
              </div>
            </div>

            {/* Tags Display */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tags:</span>
                <span className="text-xs text-slate-500 dark:text-slate-500">({tags.length})</span>
              </div>
              <div className="flex gap-1 flex-wrap items-center">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-md text-xs font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => setTags(prev => prev.filter((_, i) => i !== index))}
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
                    value={''}
                    onChange={(e) => {
                      // This is a simple implementation - in a real app you'd want proper state management
                      const value = e.target.value;
                      if (value.includes(',')) {
                        const newTags = value.split(',').map(t => t.trim()).filter(t => t && !tags.includes(t));
                        setTags(prev => [...prev, ...newTags]);
                        e.target.value = '';
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value && !tags.includes(value)) {
                          setTags(prev => [...prev, value]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    placeholder="Add tag..."
                    className="w-20 sm:w-24 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add tag..."]') as HTMLInputElement;
                      const value = input?.value.trim();
                      if (value && !tags.includes(value)) {
                        setTags(prev => [...prev, value]);
                        input.value = '';
                      }
                    }}
                    className="p-1 text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Settings Panel */}
        {showSettings && (
          <div className="flex-shrink-0 border-b bg-muted/30 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ImageIcon className="h-4 w-4" />
                  Featured Image
                </label>
                <ImageUploadDropdown
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url || '')}
                  placeholder="Select or upload featured image..."
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4" />
                  Custom Excerpt
                </label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Auto-generated from content..."
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-md p-3 mx-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Main Editor */}
        <div className="flex-1 overflow-hidden">
          <SimpleEditor
            content={editorContent}
            onChange={(newContent) => {
              setEditorContent(newContent);
              onContentChange?.(newContent);
            }}
            placeholder="Start writing your amazing blog post... Use the toolbar above to format your text, add headings, lists, links, and more!"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t bg-muted/30 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {editorContent ? `${editorContent.split(/\s+/).filter(word => word.length > 0).length} words` : '0 words'}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !title.trim() || !editorContent.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {editMode ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editMode ? 'Update Post' : 'Publish Post'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
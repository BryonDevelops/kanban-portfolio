"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Textarea } from '@/presentation/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/presentation/components/ui/dialog';
import { SimpleEditor } from '@/presentation/components/ui/simple-editor';
import { BlogPost } from '../BlogPostPortal';
import { Edit, X, Trash2 } from 'lucide-react';
import { useIsAdmin } from '../../../shared/ProtectedRoute';
import { useUser } from '@clerk/nextjs';

interface EditBlogPostFormProps {
  blogPost: BlogPost;
  onBlogPostUpdated?: () => void;
  onBlogPostDeleted?: () => void;
  trigger?: React.ReactNode;
}

export function EditBlogPostForm({ blogPost, onBlogPostUpdated, onBlogPostDeleted, trigger }: EditBlogPostFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = useIsAdmin();
  const { user, isLoaded } = useUser();
  const isLoggedIn = isLoaded && !!user;
  const canSaveToDatabase = isLoggedIn && isAdmin;

  // Form state
  const [formData, setFormData] = useState({
    title: blogPost.title,
    excerpt: blogPost.excerpt,
    content: blogPost.content,
    author: blogPost.author,
    tags: [...blogPost.tags],
    imageUrl: blogPost.imageUrl || '',
  });

  // UI state
  const [tagInput, setTagInput] = useState('');

  // Update form data when blogPost prop changes
  useEffect(() => {
    setFormData({
      title: blogPost.title,
      excerpt: blogPost.excerpt,
      content: blogPost.content,
      author: blogPost.author,
      tags: [...blogPost.tags],
      imageUrl: blogPost.imageUrl || '',
    });
  }, [blogPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Blog post title is required');
      }
      if (!formData.excerpt.trim()) {
        throw new Error('Blog post excerpt is required');
      }
      if (!formData.content.trim()) {
        throw new Error('Blog post content is required');
      }
      if (!formData.author.trim()) {
        throw new Error('Author name is required');
      }

      if (canSaveToDatabase) {
        // Update in database via API
        const response = await fetch(`/api/blog-posts/${blogPost.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            readTime: Math.ceil(formData.content.replace(/<[^>]*>/g, '').split(' ').length / 200), // Rough estimate
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update blog post');
        }

        // Show success toast
        import("@/presentation/utils/toast").then(({ success }) => {
          success("Blog post updated!", `"${formData.title}" has been successfully updated.`);
        });
      } else {
        // For users without database save permissions, show error
        throw new Error('You must be logged in as an admin to edit blog posts');
      }

      // Close dialog and notify parent
      setOpen(false);
      onBlogPostUpdated?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blog post';
      setError(errorMessage);

      // Show error toast
      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to update blog post", errorMessage);
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (canSaveToDatabase) {
        // Delete from database via API
        const response = await fetch(`/api/blog-posts/${blogPost.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete blog post');
        }

        // Show success toast
        import("@/presentation/utils/toast").then(({ success }) => {
          success("Blog post deleted!", `"${blogPost.title}" has been successfully deleted.`);
        });
      } else {
        // For users without database save permissions, show error
        throw new Error('You must be logged in as an admin to delete blog posts');
      }

      // Close dialog and notify parent
      setOpen(false);
      onBlogPostDeleted?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blog post';
      setError(errorMessage);

      // Show error toast
      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to delete blog post", errorMessage);
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

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Blog Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter blog post title"
              required
              maxLength={200}
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label htmlFor="excerpt" className="text-sm font-medium">
              Excerpt *
            </label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Brief description of the blog post..."
              maxLength={500}
              rows={3}
              required
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <label htmlFor="author" className="text-sm font-medium">
              Author *
            </label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              placeholder="Author name"
              required
              maxLength={100}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label htmlFor="imageUrl" className="text-sm font-medium">
              Featured Image URL
            </label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
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
                placeholder="Add tag (e.g., React, TypeScript)"
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
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Content *
            </label>
            <SimpleEditor
              content={formData.content}
              onChange={(content) => handleInputChange('content', content)}
              placeholder="Continue editing your blog post... Use the toolbar above to format your text, add headings, lists, links, and more!"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-2 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Post
            </Button>

            <div className="flex gap-2">
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Update Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
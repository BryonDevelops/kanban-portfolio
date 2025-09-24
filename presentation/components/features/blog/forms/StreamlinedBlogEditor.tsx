"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/presentation/components/ui/button';
import { SimpleEditor } from '@/presentation/components/ui/simple-editor';
import { Save, X, Settings } from 'lucide-react';
import { useIsAdmin } from '../../../shared/ProtectedRoute';
import { useUser } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/presentation/components/ui/dialog';
import { Input } from '@/presentation/components/ui/input';
import { Textarea } from '@/presentation/components/ui/textarea';

interface StreamlinedBlogEditorProps {
  onBlogPostCreated?: () => void;
  trigger?: React.ReactNode;
}

export function StreamlinedBlogEditor({ onBlogPostCreated, trigger }: StreamlinedBlogEditorProps) {
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
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Auto-generate excerpt from content
  useEffect(() => {
    if (!excerpt && content) {
      // Extract first 150 characters from plain text content
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      const autoExcerpt = plainText.length > 150
        ? plainText.substring(0, 150) + '...'
        : plainText;
      setExcerpt(autoExcerpt);
    }
  }, [content, excerpt]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (canSaveToDatabase) {
        const response = await fetch('/api/blog-posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            excerpt: excerpt.trim(),
            content: content.trim(),
            author: user?.fullName || user?.username || '',
            tags: [], // Could be extracted from content or added later
            imageUrl: imageUrl.trim(),
            publishedAt: new Date().toISOString(),
            readTime: Math.ceil(content.replace(/<[^>]*>/g, '').split(' ').length / 200),
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blog post';
      setError(errorMessage);

      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to create blog post", errorMessage);
      });
    } finally {
      setLoading(false);
    }
  };

  const resetEditor = () => {
    setTitle('');
    setContent('');
    setExcerpt('');
    setImageUrl('');
    setError(null);
  };

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

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {title || 'Untitled Blog Post'}
            </DialogTitle>
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
        </DialogHeader>

        {/* Settings Panel */}
        {showSettings && (
          <div className="flex-shrink-0 border-b bg-muted/30 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Featured Image URL</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Custom Excerpt</label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Auto-generated from content..."
                  rows={2}
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

        {/* Title Input */}
        <div className="flex-shrink-0 px-4 py-2 border-b">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Blog post title..."
            className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0"
            style={{ fontSize: '2rem', fontWeight: 'bold' }}
          />
        </div>

        {/* Main Editor */}
        <div className="flex-1 overflow-hidden">
          <SimpleEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your amazing blog post... Use the toolbar above to format your text, add headings, lists, links, and more!"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {content ? `${content.replace(/<[^>]*>/g, '').split(' ').length} words` : '0 words'}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !title.trim() || !content.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Publish Post
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
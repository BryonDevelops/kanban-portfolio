"use client";

import { useState, useEffect, useMemo } from 'react';
import { createLogger } from '@/lib/logger';
import { Button } from '@/presentation/components/ui/button';
import { SimpleEditor } from '@/presentation/components/shared/simple-editor';
import { Save, X, Settings, Edit3 } from 'lucide-react';
import { useIsAdmin } from '../../../shared/ProtectedRoute';
import { useUser } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/presentation/components/ui/dialog';
import { Input } from '@/presentation/components/ui/input';
import { Textarea } from '@/presentation/components/ui/textarea';

const microblogEditorLogger = createLogger(['presentation', 'microblog', 'StreamlinedBlogEditor']);

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

  // Controlled mode props
  title?: string;
  onTitleChange?: (value: string) => void;
  content?: string;
  onChange?: (content: string) => void;
  excerpt?: string;
  onExcerptChange?: (value: string) => void;
  imageUrl?: string;
  onImageUrlChange?: (value: string) => void;
  placeholder?: string;
}

export function StreamlinedBlogEditor({
  onBlogPostCreated,
  trigger,
  initialData,
  title: controlledTitle,
  onTitleChange,
  content: controlledContent,
  onChange,
  excerpt: controlledExcerpt,
  onExcerptChange,
  imageUrl: controlledImageUrl,
  onImageUrlChange: onImageUrlChangeProp,
  placeholder,
}: StreamlinedBlogEditorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingHeaderTitle, setIsEditingHeaderTitle] = useState(false);
  const isAdmin = useIsAdmin();
  const { user, isLoaded } = useUser();
  const isLoggedIn = isLoaded && !!user;
  const canSaveToDatabase = isLoggedIn && isAdmin;

  // Editor state
  const [titleState, setTitleState] = useState(initialData?.title || '');
  const [contentState, setContentState] = useState(initialData?.content || '');
  const [excerptState, setExcerptState] = useState(initialData?.excerpt || '');
  const [imageUrlState, setImageUrlState] = useState(initialData?.imageUrl || '');

  const isTitleControlled = typeof controlledTitle === 'string' && !!onTitleChange;
  const isContentControlled = typeof controlledContent === 'string' && !!onChange;
  const isExcerptControlled = typeof controlledExcerpt === 'string' && !!onExcerptChange;
  const isImageUrlControlled = typeof controlledImageUrl === 'string' && !!onImageUrlChangeProp;

  const title = isTitleControlled ? controlledTitle! : titleState;
  const content = isContentControlled ? controlledContent! : contentState;
  const excerpt = isExcerptControlled ? controlledExcerpt! : excerptState;
  const imageUrl = isImageUrlControlled ? controlledImageUrl! : imageUrlState;

  const saveLogger = useMemo(() => microblogEditorLogger.child('handleSave'), []);

  const setTitle = (value: string) => {
    if (onTitleChange) {
      onTitleChange(value);
    }
    if (!isTitleControlled) {
      setTitleState(value);
    }
  };

  const setContent = (value: string) => {
    if (onChange) {
      onChange(value);
    }
    if (!isContentControlled) {
      setContentState(value);
    }
  };

  const setExcerpt = (value: string) => {
    if (onExcerptChange) {
      onExcerptChange(value);
    }
    if (!isExcerptControlled) {
      setExcerptState(value);
    }
  };

  const setImageUrl = (value: string) => {
    if (onImageUrlChangeProp) {
      onImageUrlChangeProp(value);
    }
    if (!isImageUrlControlled) {
      setImageUrlState(value);
    }
  };

  // Auto-generate excerpt from content
  useEffect(() => {
    if (!excerpt && content) {
      // Extract first 150 characters from plain text content
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      const autoExcerpt = plainText.length > 150
        ? plainText.substring(0, 150) + '...'
        : plainText;
      if (isExcerptControlled) {
        onExcerptChange?.(autoExcerpt);
      } else {
        setExcerptState(autoExcerpt);
      }
    }
  }, [content, excerpt, isExcerptControlled, onExcerptChange]);

  useEffect(() => {
    if (!open) {
      setIsEditingHeaderTitle(false);
    }
  }, [open]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedExcerpt = (excerpt || '').trim();
    const trimmedImageUrl = (imageUrl || '').trim();

    if (!trimmedTitle || !trimmedContent) {
      saveLogger.warn('Validation failed before publishing microblog post', {
        hasTitle: Boolean(trimmedTitle),
        hasContent: Boolean(trimmedContent),
        titleLength: trimmedTitle.length,
        contentLength: trimmedContent.length,
      });
      setError('Title and content are required');
      return;
    }

    const plainTextWords = trimmedContent.replace(/<[^>]*>/g, '').split(' ');
    const wordCount = plainTextWords.filter((word) => word.trim().length > 0).length;
    const readTimeEstimate = Math.ceil(plainTextWords.length / 200);
    const requestMetadata = {
      canSaveToDatabase,
      isAdmin,
      isLoggedIn,
      wordCount,
      readTime: readTimeEstimate,
      titleLength: trimmedTitle.length,
      excerptLength: trimmedExcerpt.length,
      hasImage: Boolean(trimmedImageUrl),
    };

    setLoading(true);
    setError(null);

    saveLogger.info('Attempting to publish microblog post', requestMetadata);

    try {
      if (canSaveToDatabase) {
        const payload = {
          title: trimmedTitle,
          excerpt: trimmedExcerpt,
          content: trimmedContent,
          author: user?.fullName || user?.username || '',
          tags: [] as string[], // Could be extracted from content or added later
          publishedAt: new Date().toISOString(),
          readTime: readTimeEstimate,
          ...(trimmedImageUrl ? { imageUrl: trimmedImageUrl } : {}),
        };

        saveLogger.debug('Sending microblog post to API', {
          endpoint: '/api/posts',
          hasImage: Boolean(trimmedImageUrl),
          readTime: payload.readTime,
          wordCount,
        });

        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const responseMetadata = {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type') || undefined,
        };

        if (!response.ok) {
          saveLogger.error('API returned a non-success status when creating microblog post', responseMetadata);
          let errorMessage = 'Failed to create blog post';

          if (responseMetadata.contentType?.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const responseText = await response.text();
            errorMessage = responseText || errorMessage;
          }

          throw new Error(errorMessage);
        }

        saveLogger.info('Microblog post created successfully', {
          ...responseMetadata,
          wordCount,
          readTime: readTimeEstimate,
        });

        import("@/presentation/utils/toast").then(({ success }) => {
          success('Blog post created!', `"${trimmedTitle}" has been published.`);
        });

        resetEditor();
        setOpen(false);
        onBlogPostCreated?.();
      } else {
        saveLogger.warn('Blocked blog post creation due to insufficient permissions', {
          canSaveToDatabase,
          isAdmin,
          isLoggedIn,
        });
        throw new Error('You must be logged in as an admin to create blog posts');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blog post';
      saveLogger.error('Failed to publish microblog post', err, {
        ...requestMetadata,
        errorMessage,
      });
      setError(errorMessage);

      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast('Failed to create blog post', errorMessage);
      });
    } finally {
      setLoading(false);
    }
  };

  const resetEditor = () => {
    if (!isTitleControlled) setTitleState('');
    if (!isContentControlled) setContentState('');
    if (!isExcerptControlled) setExcerptState('');
    if (!isImageUrlControlled) setImageUrlState('');
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

  <DialogContent data-modal-safe="true" className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                {isEditingHeaderTitle ? (
                  <Input
                    value={title ?? ''}
                    onChange={(event) => setTitle(event.target.value)}
                    onBlur={() => setIsEditingHeaderTitle(false)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setIsEditingHeaderTitle(false);
                      }
                    }}
                    autoFocus
                    placeholder="Microblog title..."
                    className="h-9 text-base font-semibold"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingHeaderTitle(true)}
                    className="group flex items-center gap-2 text-left focus:outline-none"
                  >
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {title || 'Untitled Microblog Post'}
                    </span>
                    <Edit3 className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs text-slate-400 group-hover:opacity-100 opacity-0 transition-opacity">
                      click to edit
                    </span>
                  </button>
                )}
              </div>
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

        {/* Main Editor */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full min-h-0 overflow-y-auto pr-1">
            <SimpleEditor
              content={content}
              onChange={setContent}
              placeholder={placeholder || "Start writing your amazing blog post... Use the toolbar above to format your text, add headings, lists, links, and more!"}
            />
          </div>
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


"use client"

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/presentation/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Edit, Trash2 } from 'lucide-react'
import { BlogPost } from './BlogPostPortal'
import { StreamlinedBlogEditor } from './forms/StreamlinedBlogEditor';

interface AdminControlsProps {
  onCreatePost?: (post: Omit<BlogPost, 'id'>) => void
  onEditPost?: (postId: string, post: Partial<BlogPost>) => void
  onDeletePost?: (postId: string) => void
}

// Component for admin buttons that appear on each post
export function PostAdminButtons({
  post,
  onEdit,
  onDelete
}: {
  post: BlogPost
  onEdit: (post: BlogPost) => void
  onDelete: (postId: string) => void
}) {
  const { user, isLoaded } = useUser()
  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin'

  if (!isAdmin) return null

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        onClick={(e) => {
          e.stopPropagation()
          onEdit(post)
        }}
      >
        <Edit className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
        onClick={(e) => {
          e.stopPropagation()
          if (confirm('Are you sure you want to delete this post?')) {
            onDelete(post.id)
          }
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}

// Component for the create post button
export function CreatePostButton({ onCreatePost }: { onCreatePost?: (post: Omit<BlogPost, 'id'>) => void }) {
  const { user, isLoaded } = useUser()
  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin'

  if (!isAdmin) return null

  return (
    <StreamlinedBlogEditor
      onBlogPostCreated={() => {
        // The StreamlinedBlogEditor handles the creation internally
        // We could add a callback here if needed
      }}
    />
  )
}

// Component for edit post dialog
export function EditPostDialog({
  post,
  isOpen,
  onClose,
  onEditPost
}: {
  post: BlogPost | null
  isOpen: boolean
  onClose: () => void
  onEditPost?: (postId: string, post: Partial<BlogPost>) => void
}) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState('')
  const [readTime, setReadTime] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  // Update state when post changes
  React.useEffect(() => {
    if (post) {
      setContent(post.content)
      setTitle(post.title)
      setExcerpt(post.excerpt)
      setTags(post.tags.join(', '))
      setReadTime(post.readTime.toString())
      setImageUrl(post.imageUrl || '')
    }
  }, [post])

  if (!post) return null

  const handleEditPost = () => {
    const updatedPost: Partial<BlogPost> = {
      title,
      excerpt,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      readTime: parseInt(readTime) || 5,
      imageUrl: imageUrl || undefined
    }

    onEditPost?.(post.id, updatedPost)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <div className="border rounded-lg p-4 bg-background">
              <textarea
                value={content.replace(/<[^>]*>/g, '')} // Simple text extraction for editing
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[200px] border-none outline-none resize-none"
                placeholder="Edit your post content..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Read Time (minutes)</label>
              <Input value={readTime} onChange={(e) => setReadTime(e.target.value)} type="number" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleEditPost}>Update Post</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main AdminControls component - now just manages state and provides the components
export function AdminControls({ onCreatePost, onEditPost, onDeletePost }: AdminControlsProps) {
  const { isLoaded, user } = useUser()
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin'

  if (!isAdmin) {
    return {
      isAdmin: false,
      CreatePostButton: () => null,
      PostAdminButtons: () => null,
      EditPostDialog: () => null
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
  }

  const handleDelete = (postId: string) => {
    onDeletePost?.(postId)
  }

  return {
    isAdmin: true,
    CreatePostButton: () => (
      <CreatePostButton onCreatePost={onCreatePost} />
    ),
    PostAdminButtons: ({ post }: { post: BlogPost }) => (
      <PostAdminButtons
        post={post}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    EditPostDialog: () => (
      <EditPostDialog
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onEditPost={onEditPost}
      />
    )
  }
}
"use client"

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/presentation/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/presentation/components/ui/dialog'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { TiptapEditor } from '@/presentation/components/ui/tiptap-editor'
import { Edit, Trash2, Plus } from 'lucide-react'
import { BlogPost } from './BlogPostPortal'

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [content, setContent] = useState('')
  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin'

  if (!isAdmin) return null

  const handleCreatePost = (formData: FormData) => {
    const newPost: Omit<BlogPost, 'id'> = {
      title: formData.get('title') as string,
      excerpt: formData.get('excerpt') as string,
      content: content, // Use the HTML content from Tiptap
      author: user?.firstName + ' ' + user?.lastName || 'Admin',
      publishedAt: new Date().toISOString(),
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
      readTime: parseInt(formData.get('readTime') as string) || 5,
      imageUrl: formData.get('imageUrl') as string || undefined
    }

    onCreatePost?.(newPost)
    setIsDialogOpen(false)
    setContent('') // Reset content
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        <form action={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input name="title" required placeholder="Post title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <Textarea name="excerpt" required placeholder="Brief description" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Write your post content here..."
              height="300px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <Input name="tags" placeholder="React, Next.js, TypeScript" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Read Time (minutes)</label>
              <Input name="readTime" type="number" defaultValue="5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
              <Input name="imageUrl" placeholder="https://..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Post</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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

  // Update content when post changes
  React.useEffect(() => {
    if (post) {
      setContent(post.content)
    }
  }, [post])

  if (!post) return null

  const handleEditPost = (formData: FormData) => {
    const updatedPost: Partial<BlogPost> = {
      title: formData.get('title') as string,
      excerpt: formData.get('excerpt') as string,
      content: content, // Use the HTML content from Tiptap
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
      readTime: parseInt(formData.get('readTime') as string) || 5,
      imageUrl: formData.get('imageUrl') as string || undefined
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
        <form action={handleEditPost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input name="title" defaultValue={post.title} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <Textarea name="excerpt" defaultValue={post.excerpt} required rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Write your post content here..."
              height="300px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <Input name="tags" defaultValue={post.tags.join(', ')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Read Time (minutes)</label>
              <Input name="readTime" type="number" defaultValue={post.readTime} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
              <Input name="imageUrl" defaultValue={post.imageUrl || ''} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Post</Button>
          </div>
        </form>
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
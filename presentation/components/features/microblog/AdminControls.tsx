"use client"

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/presentation/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Edit, Trash2, Plus, Star } from 'lucide-react'
import { BlogPost } from './BlogPostPortal'
import { Category } from '@/domain/microblog/entities/category'
import { CreateBlogPostForm } from './forms/CreateBlogPostForm'
import { ImprovedEditBlogPostForm } from './forms/ImprovedEditBlogPostForm'
import { ColorPicker } from '@/presentation/components/shared/color-picker'
import { useIsMobile } from '../../../hooks/use-mobile'

interface AdminControlsProps {
  onCreatePost: (postData: Omit<BlogPost, 'id'>) => Promise<void>
  onDeletePost?: (postId: string) => void
  onToggleFeatured?: (postId: string) => void
  onCreateCategory?: (category: Omit<Category, 'id' | 'postCount' | 'createdAt' | 'updatedAt'>) => void
  onEditCategory?: (categoryId: string, category: Partial<Category>) => void
  onDeleteCategory?: (categoryId: string) => void
}

// Component for admin buttons that appear on each post
export function PostAdminButtons({
  post,
  onEdit,
  onDelete,
  onToggleFeatured
}: {
  post: BlogPost
  onEdit: (post: BlogPost) => void
  onDelete: (postId: string) => void
  onToggleFeatured: (postId: string) => void
}) {
  const { user, isLoaded } = useUser()
  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin'
  const isMobile = useIsMobile()

  if (!isAdmin) return null

  return (
    <div className={`flex items-center gap-1`}>
      <div className={`bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg ${isMobile ? 'p-1.5' : 'p-1'} flex items-center gap-1`}>
        <Button
          size="sm"
          variant="ghost"
          className={`p-0 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 ${
            post.featured
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-gray-400 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400'
          } hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors ${isMobile ? 'h-9 w-9' : 'h-8 w-8'}`}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation()
            onToggleFeatured(post.id)
          }}
          title={post.featured ? 'Remove from featured' : 'Mark as featured'}
        >
          <Star className={`h-3.5 w-3.5 ${post.featured ? 'fill-current' : ''}`} />
        </Button>
        <div className={`w-px ${isMobile ? 'h-5' : 'h-4'} bg-border`} />
        <Button
          size="sm"
          variant="ghost"
          className={`p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ${isMobile ? 'h-9 w-9' : 'h-8 w-8'}`}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation()
            onEdit(post)
          }}
          title="Edit post"
        >
          <Edit className={`${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
        </Button>
        <div className={`w-px ${isMobile ? 'h-5' : 'h-4'} bg-border`} />
        <Button
          size="sm"
          variant="ghost"
          className={`p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors ${isMobile ? 'h-9 w-9' : 'h-8 w-8'}`}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation()
            if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
              onDelete(post.id)
            }
          }}
          title="Delete post"
        >
          <Trash2 className={`${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
        </Button>
      </div>
    </div>
  )
}

interface CreatePostButtonProps {
  onCreatePost?: (postData: Omit<BlogPost, 'id'>) => Promise<void>
}

// Component for the create post button
export function CreatePostButton({ onCreatePost }: CreatePostButtonProps) {
  const { user, isLoaded } = useUser()
  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin'
  const isMobile = useIsMobile()

  if (!isAdmin) return null

  return (
    <div className="relative">
      <CreateBlogPostForm
        onBlogPostCreated={(postData) => {
          if (onCreatePost) {
            void onCreatePost(postData)
          }
        }}
        trigger={
          <Button
            variant="default"
            size={isMobile ? "sm" : "sm"}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${isMobile ? 'px-3 py-2 text-sm' : ''}`}
          >
            <Plus className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            {isMobile ? 'New Post' : 'New Blog Post'}
          </Button>
        }
      />
    </div>
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
      setReadTime((post.readTime || 5).toString())
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

// Component for admin buttons that appear on each category
export function CategoryAdminButtons({
  category,
  onEdit,
  onDelete
}: {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
}) {
  const { user, isLoaded } = useUser()
  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin'
  const isMobile = useIsMobile()

  if (!isAdmin) return null

  return (
    <div className={`flex items-center gap-1`}>
      <div className={`bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg ${isMobile ? 'p-1.5' : 'p-1'} flex items-center gap-1`}>
        <Button
          size="sm"
          variant="ghost"
          className={`p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ${isMobile ? 'h-9 w-9' : 'h-8 w-8'}`}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation()
            onEdit(category)
          }}
          title="Edit category"
        >
          <Edit className={`${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
        </Button>
        <div className={`w-px ${isMobile ? 'h-5' : 'h-4'} bg-border`} />
        <Button
          size="sm"
          variant="ghost"
          className={`p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors ${isMobile ? 'h-9 w-9' : 'h-8 w-8'}`}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation()
            if (confirm(`Are you sure you want to delete the "${category.name}" category? This action cannot be undone.`)) {
              onDelete(category.id)
            }
          }}
          title="Delete category"
        >
          <Trash2 className={`${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
        </Button>
      </div>
    </div>
  )
}

// Component for the create category button
export function CreateCategoryButton({ onCreateCategory }: { onCreateCategory?: (category: Omit<Category, 'id' | 'postCount' | 'createdAt' | 'updatedAt'>) => void }) {
  const { user, isLoaded } = useUser()
  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin'
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!isAdmin) return null

  return (
    <>
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Category
      </Button>
      <CreateCategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreateCategory={(categoryData: Omit<Category, 'id' | 'postCount' | 'createdAt' | 'updatedAt'>) => {
          onCreateCategory?.(categoryData)
          setIsDialogOpen(false)
        }}
      />
    </>
  )
}

// Component for create category dialog
export function CreateCategoryDialog({
  isOpen,
  onClose,
  onCreateCategory
}: {
  isOpen: boolean
  onClose: () => void
  onCreateCategory: (category: Omit<Category, 'id' | 'postCount' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('from-blue-500 to-cyan-500')

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setName('')
      setDescription('')
      setColor('from-blue-500 to-cyan-500')
    }
  }, [isOpen])

  const handleCreateCategory = () => {
    const categoryData: Omit<Category, 'id' | 'postCount' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: description.trim() || undefined,
      color: color.trim()
    }

    onCreateCategory(categoryData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Category name"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of the category"
            />
          </div>
          <div>
            <ColorPicker
              value={color}
              onChange={setColor}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={!name.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Create Category
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Component for edit category dialog
export function EditCategoryDialog({
  category,
  isOpen,
  onClose,
  onEditCategory
}: {
  category: Category | null
  isOpen: boolean
  onClose: () => void
  onEditCategory?: (categoryId: string, category: Partial<Category>) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('')

  // Update state when category changes
  React.useEffect(() => {
    if (category) {
      setName(category.name)
      setDescription(category.description || '')
      setColor(category.color)
    }
  }, [category])

  if (!category) return null

  const handleEditCategory = () => {
    const updatedCategory: Partial<Category> = {
      name: name.trim(),
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: description.trim() || undefined,
      color: color.trim()
    }

    onEditCategory?.(category.id, updatedCategory)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of the category"
            />
          </div>
          <div>
            <ColorPicker
              value={color}
              onChange={setColor}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory} disabled={!name.trim()}>
              Update Category
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main AdminControls component - now just manages state and provides the components
export function AdminControls({ onCreatePost, onDeletePost, onToggleFeatured, onCreateCategory, onEditCategory, onDeleteCategory }: AdminControlsProps) {
  const { isLoaded, user } = useUser()
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin'

  if (!isAdmin) {
    return {
      isAdmin: false,
      handleCreatePost: async () => {},
      CreatePostButton: () => null,
      PostAdminButtons: () => null,
      EditPostDialog: () => null,
      CreateCategoryButton: () => null,
      CategoryAdminButtons: () => null,
      EditCategoryDialog: () => null
    }
  }

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post)
  }

  const handleCreatePost = async (postData: Omit<BlogPost, 'id'>) => {
    await onCreatePost(postData)
  }

  const handleDeletePost = (postId: string) => {
    onDeletePost?.(postId)
  }

  const handleToggleFeatured = (postId: string) => {
    onToggleFeatured?.(postId)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
  }

  const handleDeleteCategory = (categoryId: string) => {
    onDeleteCategory?.(categoryId)
  }

  return {
    isAdmin: true,
    handleCreatePost,
    CreatePostButton: () => (
      <CreatePostButton onCreatePost={handleCreatePost} />
    ),
    PostAdminButtons: ({ post }: { post: BlogPost }) => (
      <PostAdminButtons
        post={post}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
        onToggleFeatured={handleToggleFeatured}
      />
    ),
    EditPostDialog: () => (
      editingPost ? (
        <ImprovedEditBlogPostForm
          blogPost={editingPost}
          open={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
          onBlogPostUpdated={() => {
            setEditingPost(null)
            // The store will be updated via the microblog page handlers
          }}
          onBlogPostDeleted={() => {
            setEditingPost(null)
            // The store will be updated via the microblog page handlers
          }}
        />
      ) : null
    ),
    CreateCategoryButton: () => (
      <CreateCategoryButton onCreateCategory={onCreateCategory} />
    ),
    CategoryAdminButtons: ({ category }: { category: Category }) => (
      <CategoryAdminButtons
        category={category}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />
    ),
    EditCategoryDialog: () => (
      <EditCategoryDialog
        category={editingCategory}
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onEditCategory={onEditCategory}
      />
    )
  }
}

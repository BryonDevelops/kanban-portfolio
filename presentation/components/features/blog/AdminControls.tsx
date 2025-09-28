"use client"

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/presentation/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog'
import { Edit, Trash2, Plus } from 'lucide-react'
import { BlogPost } from './BlogPostPortal'
import { EditBlogPostForm } from './forms/EditBlogPostForm'
import { CreateBlogPostForm } from './forms/CreateBlogPostForm'
import { StreamlinedBlogEditor } from './forms/StreamlinedBlogEditor';
import { useIsMobile } from '@/presentation/hooks/use-mobile';

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
  const isMobile = useIsMobile()

  if (!isAdmin) return null

  return (
    <div className={`flex items-center gap-1`}>
      <div className={`bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg ${isMobile ? 'p-1.5' : 'p-1'} flex items-center gap-1`}>
        <Button
          size="sm"
          variant="ghost"
          className={`p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ${isMobile ? 'h-9 w-9' : 'h-8 w-8'}`}
          onClick={(e) => {
            e.stopPropagation()
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
          onClick={(e) => {
            e.stopPropagation()
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

// Component for the create post button
export function CreatePostButton() {
  const { user, isLoaded } = useUser()
  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin'
  const isMobile = useIsMobile()

  if (!isAdmin) return null

  return (
    <div className="relative">
      <CreateBlogPostForm
        onBlogPostCreated={() => {
          // The CreateBlogPostForm handles the creation internally
          // We could add a callback here if needed
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
  onClose,
  onEditPost
}: {
  post: BlogPost | null
  onClose: () => void
  onEditPost?: (postId: string, post: Partial<BlogPost>) => void
}) {
  if (!post) return null;

  return (
    <EditBlogPostForm
      blogPost={post}
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      onBlogPostUpdated={() => {
        onEditPost?.(post.id, post);
        onClose();
      }}
    />
  );
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
      <CreatePostButton />
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
        onClose={() => setEditingPost(null)}
        onEditPost={onEditPost}
      />
    )
  }
}
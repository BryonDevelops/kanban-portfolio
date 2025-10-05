"use client"

import React, { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Button } from '@/presentation/components/ui/button'
import { cn } from '@/presentation/utils'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Type
} from 'lucide-react'

interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  height?: string
}

export function TiptapEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  className,
  height = '300px'
}: TiptapEditorProps) {
  const [isToolbarVisible, setIsToolbarVisible] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const hasSelection = from !== to

      if (hasSelection) {
        // Get the bounding rect of the selection
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          setToolbarPosition({
            top: rect.top - 50, // Position above selection
            left: rect.left + (rect.width / 2) - 100 // Center horizontally
          })
        }
        setIsToolbarVisible(true)
      } else {
        setIsToolbarVisible(false)
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-6 py-4 text-foreground leading-relaxed',
          'prose-headings:font-medium prose-headings:text-foreground prose-headings:mb-4 prose-headings:mt-8',
          'prose-p:text-foreground prose-p:mb-4 prose-p:leading-relaxed',
          'prose-strong:text-foreground prose-strong:font-semibold',
          'prose-em:text-foreground prose-em:italic',
          'prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-6',
          'prose-ul:my-4 prose-ol:my-4 prose-li:mb-1',
          'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono',
          'prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto',
          className
        ),
        style: `min-height: ${height};`,
      },
    },
  })

  const ToolbarButton = useCallback(({
    onClick,
    isActive = false,
    children,
    title
  }: {
    onClick: () => void
    isActive?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 w-8 p-0 rounded-md transition-all duration-150",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
      title={title}
    >
      {children}
    </Button>
  ), [])

  if (!editor) {
    return (
      <div className="min-h-[200px] border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Floating Toolbar */}
      {isToolbarVisible && (
        <div
          className="fixed z-50 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1 flex items-center gap-1 animate-in fade-in-0 zoom-in-95"
          style={{
            top: `${Math.max(60, toolbarPosition.top)}px`,
            left: `${toolbarPosition.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-border mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-border mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor Content */}
      <div className="border border-border rounded-lg bg-background focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
        <EditorContent
          editor={editor}
          className="min-h-[200px] cursor-text"
        />

        {/* Character count - minimal design */}
        <div className="border-t border-border/50 px-4 py-2 text-xs text-muted-foreground/70 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Type className="h-3 w-3" />
            <span>{editor.storage.characterCount.words()} words</span>
          </div>
          <span className="text-muted-foreground/50">
            {editor.storage.characterCount.characters()}/10,000
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-2 text-xs text-muted-foreground">
        Select text to see formatting options • Use keyboard shortcuts for quick formatting
      </div>
    </div>
  )
}
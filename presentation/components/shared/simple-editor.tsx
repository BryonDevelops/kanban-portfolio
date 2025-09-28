"use client";

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SlashCommandTriggerButton } from '@/components/tiptap-ui/slash-command-trigger-button';
import { SlashDropdownMenu } from '@/components/tiptap-ui/slash-dropdown-menu';
import { FloatingElement } from '@/components/tiptap-ui-utils/floating-element';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/presentation/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Strikethrough,
  Link,
  Minus,
  Undo,
  Redo
} from 'lucide-react';
import { defaultMarkdownSerializer, defaultMarkdownParser } from 'prosemirror-markdown';

interface SimpleEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function SimpleEditor({ content, onChange, placeholder = "Start writing your blog post..." }: SimpleEditorProps) {
  // Convert markdown content to ProseMirror document for initialization
  const getInitialContent = () => {
    if (!content) return '';
    try {
      const doc = defaultMarkdownParser.parse(content);
      return doc.toJSON();
    } catch {
      // Fallback to plain text if markdown parsing fails
      return content;
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure({
        limit: 10000,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: getInitialContent(),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Convert ProseMirror document to markdown
      const markdown = defaultMarkdownSerializer.serialize(editor.state.doc);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentMarkdown = defaultMarkdownSerializer.serialize(editor.state.doc);
      if (currentMarkdown !== content) {
        try {
          const doc = defaultMarkdownParser.parse(content);
          editor.commands.setContent(doc.toJSON());
        } catch {
          // Fallback to plain text if parsing fails
          editor.commands.setContent(content);
        }
      }
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background shadow-sm relative">
      {/* Slash Dropdown Menu */}
      <SlashDropdownMenu editor={editor} />

      {/* Floating Toolbar */}
      <FloatingElement editor={editor}>
        <div className="flex gap-1 bg-card border rounded-md shadow-lg p-1">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('strike') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('code') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </FloatingElement>

      {/* Toolbar */}
      <div className="border-b bg-card p-3 flex flex-wrap gap-2 items-center">
        {/* Slash Command Trigger */}
        <SlashCommandTriggerButton
          editor={editor}
          showShortcut={true}
          title="Insert block"
        />

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Text Formatting */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('strike') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('code') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists and Blocks */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('codeBlock') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Links and Special */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLink}
            title="Add Link"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="border-b px-4 py-2 text-xs text-muted-foreground bg-muted/20">
        <strong>Slash Commands:</strong> Type &quot;/&quot; to access quick formatting options or use the toolbar button
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[300px] focus-within:outline-none p-4"
      />

      {/* Character Count */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground bg-muted/30 flex justify-between items-center">
        <span>{editor.storage.characterCount.characters()}/10,000 characters</span>
        <span className="text-xs opacity-60">
          {editor.storage.characterCount.words()} words
        </span>
      </div>
    </div>
  );
}
"use client";

import React, { useCallback, useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
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
  Redo,
  Table as TableIcon
} from 'lucide-react';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

interface SimpleEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function SimpleEditor({ content, onChange, placeholder = "Start writing your blog post..." }: SimpleEditorProps) {
  // Markdown <-> HTML converters
  const turndown = useMemo(() => {
    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    td.use(gfm);
    return td;
  }, []);
  const mdToHtml = useCallback((md: string) => {
    try {
      const parsed = marked.parse(md || '');
      return typeof parsed === 'string' ? parsed : '';
    } catch {
      return md;
    }
  }, []);
  const htmlToMd = useCallback((html: string) => {
    try {
      return turndown.turndown(html || '');
    } catch {
      return html;
    }
  }, [turndown]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount.configure({
        limit: 10000,
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ],
    content: content ? mdToHtml(content) : '',
    immediatelyRender: false,
    editable: true,
    onCreate: ({ editor }) => {
      if (content && content.trim()) {
        const html = mdToHtml(content);
        editor.commands.setContent(html, { emitUpdate: false });
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMd(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 prose-table:border-collapse prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2',
      },
    },
  });

  // Update editor content when content prop changes (markdown -> HTML)
  useEffect(() => {
    if (!editor) return;
    if (typeof content !== 'string') return;
    const html = mdToHtml(content);
    editor.commands.setContent(html, { emitUpdate: false });
  }, [editor, content, mdToHtml]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="p-4 text-center text-muted-foreground">Loading editor…</div>
    );
  }

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
            variant={editor.isActive('table') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Insert Table"
          >
            <TableIcon className="h-4 w-4" />
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
      <div className="max-h-[65vh] overflow-y-auto">
        <EditorContent editor={editor} className="min-h-[300px] focus-within:outline-none p-4" />
      </div>

      {/* Character Count */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground bg-muted/30 flex justify-between items-center">
        <span>{editor.storage.characterCount.characters()}/10,000 characters</span>
        <span className="text-xs opacity-60">{editor.storage.characterCount.words()} words</span>
      </div>
    </div>
  );
}
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
    const td = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      fence: '```'
    });
    td.use(gfm);

    // Better code block handling
    td.addRule('codeBlock', {
      filter: ['pre'],
      replacement: function(content, node) {
        const firstChild = node.firstChild as HTMLElement;
        const className = firstChild?.className || '';
        const language = className.match(/language-(\w+)/)?.[1] || '';
        return '\n\n```' + language + '\n' + content + '\n```\n\n';
      }
    });

    // Better table handling
    td.addRule('tableSection', {
      filter: ['thead', 'tbody', 'tfoot'],
      replacement: function(content) {
        return content;
      }
    });

    return td;
  }, []);
  const mdToHtml = useCallback((md: string) => {
    try {
      // Configure marked for better code block and table handling
      marked.setOptions({
        gfm: true,
        breaks: false,
        pedantic: false
      });

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
        handleWidth: 5,
        cellMinWidth: 25,
        lastColumnResizable: false,
        allowTableNodeSelection: true,
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
        // Use a timeout to ensure proper initialization and prevent cursor issues
        setTimeout(() => {
          editor.commands.setContent(html, { emitUpdate: false });
        }, 0);
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMd(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 prose-table:border-0',
      },
    },
  });

  // Update editor content when content prop changes (markdown -> HTML)
  // Only update if the content is significantly different to preserve cursor position and table editing
  useEffect(() => {
    if (!editor) return;
    if (typeof content !== 'string') return;

    const currentHtml = editor.getHTML();
    const currentMarkdown = htmlToMd(currentHtml);

    // Don't update if currently editing a table or if content is very similar
    if (editor.isActive('table') || editor.isActive('tableRow') || editor.isActive('tableCell')) {
      return;
    }

    // Only update if content has significantly changed (more than whitespace)
    const normalizeContent = (str: string) => str.replace(/\\s+/g, ' ').trim();
    if (normalizeContent(currentMarkdown) !== normalizeContent(content)) {
      const html = mdToHtml(content);
      editor.commands.setContent(html, { emitUpdate: false });
    }
  }, [editor, content, mdToHtml, htmlToMd]);

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
          <div className="flex gap-1">
            <Button
              type="button"
              variant={editor.isActive('table') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (editor.isActive('table')) {
                  editor.chain().focus().deleteTable().run();
                } else {
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                }
              }}
              title={editor.isActive('table') ? 'Delete Table' : 'Insert Table'}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            {editor.isActive('table') && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  title="Add Row Before"
                  className="text-xs px-2"
                >
                  +R↑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  title="Add Row After"
                  className="text-xs px-2"
                >
                  +R↓
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  title="Add Column Before"
                  className="text-xs px-2"
                >
                  +C←
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  title="Add Column After"
                  className="text-xs px-2"
                >
                  +C→
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  title="Delete Row"
                  className="text-xs px-2 text-red-600 hover:text-red-700"
                >
                  -R
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  title="Delete Column"
                  className="text-xs px-2 text-red-600 hover:text-red-700"
                >
                  -C
                </Button>
              </>
            )}
          </div>
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
        <EditorContent
          editor={editor}
          className="min-h-[300px] focus-within:outline-none p-4 simple-editor-content"
        />
      </div>

      {/* Table Styles */}
      <style jsx global>{`
        .simple-editor-content .ProseMirror table {
          border-collapse: collapse;
          margin: 16px 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
          border: 2px solid #e2e8f0;
        }

        .simple-editor-content .ProseMirror table td,
        .simple-editor-content .ProseMirror table th {
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          min-width: 100px;
          padding: 8px 12px;
          position: relative;
          vertical-align: top;
          background: white;
        }

        .simple-editor-content .ProseMirror table th {
          background-color: #f8fafc !important;
          border-bottom: 2px solid #cbd5e1 !important;
          font-weight: 600;
          text-align: left;
          color: #374151;
        }

        .simple-editor-content .ProseMirror table .selectedCell:after {
          background: rgba(59, 130, 246, 0.1);
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }

        .simple-editor-content .ProseMirror table .column-resize-handle {
          background-color: #3b82f6;
          bottom: -2px;
          position: absolute;
          right: -2px;
          top: 0;
          width: 4px;
          pointer-events: auto;
          cursor: col-resize;
        }

        .simple-editor-content .ProseMirror table td:hover,
        .simple-editor-content .ProseMirror table th:hover {
          background-color: #f1f5f9;
        }

        .simple-editor-content .ProseMirror pre {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #374151;
          font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
          padding: 0.75rem 1rem;
          white-space: pre-wrap;
        }

        .simple-editor-content .ProseMirror code {
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 0.25rem;
          color: #374151;
          font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
          font-size: 0.85em;
          padding: 0.125rem 0.25rem;
        }

        /* Dark mode styles */
        .dark .simple-editor-content .ProseMirror table {
          border: 2px solid #374151;
        }

        .dark .simple-editor-content .ProseMirror table td,
        .dark .simple-editor-content .ProseMirror table th {
          border: 1px solid #374151;
          background: #1f2937;
          color: #f9fafb;
        }

        .dark .simple-editor-content .ProseMirror table th {
          background-color: #374151 !important;
          border-bottom: 2px solid #4b5563 !important;
          color: #f9fafb;
        }

        .dark .simple-editor-content .ProseMirror table td:hover,
        .dark .simple-editor-content .ProseMirror table th:hover {
          background-color: #374151;
        }

        .dark .simple-editor-content .ProseMirror pre {
          background: #374151;
          border: 1px solid #4b5563;
          color: #f9fafb;
        }

        .dark .simple-editor-content .ProseMirror code {
          background-color: #374151;
          border: 1px solid #4b5563;
          color: #f9fafb;
        }
      `}</style>

      {/* Character Count */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground bg-muted/30 flex justify-between items-center">
        <span>{editor.storage.characterCount.characters()}/10,000 characters</span>
        <span className="text-xs opacity-60">{editor.storage.characterCount.words()} words</span>
      </div>
    </div>
  );
}
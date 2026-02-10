'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TipTapLink from '@tiptap/extension-link';
import { sanitizeHtml } from '@/lib/sanitize-html';
// Farb-Extensions deaktiviert — Standardfarbe schwarz/weiss
// import { TextStyle } from '@tiptap/extension-text-style';
// import Color from '@tiptap/extension-color';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Link as LinkIcon,
  Undo,
  Redo,
  Heading2,
  Heading3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  disabled?: boolean;
  className?: string;
}


function MenuBar({ editor }: { editor: Editor }) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);

  const setLink = useCallback(() => {
    if (linkUrl) {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setLinkUrl('');
    setLinkPopoverOpen(false);
  }, [editor, linkUrl]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5 bg-muted/30">
      {/* Undo/Redo */}
      <Toggle
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Rückgängig"
      >
        <Undo className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Wiederholen"
      >
        <Redo className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Überschrift 2"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Überschrift 3"
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text formatting */}
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        title="Fett"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        title="Kursiv"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        title="Unterstrichen"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        title="Durchgestrichen"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Highlight */}
      <Toggle
        size="sm"
        pressed={editor.isActive('highlight')}
        onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
        title="Hervorheben"
      >
        <Highlighter className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        title="Aufzählung"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        title="Nummerierte Liste"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Alignment */}
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'left' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        title="Links"
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'center' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        title="Zentriert"
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'right' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        title="Rechts"
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Link */}
      <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-accent')}
            title="Link"
            onClick={() => {
              const currentLink = editor.getAttributes('link').href;
              setLinkUrl(currentLink || '');
            }}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="start">
          <div className="flex gap-2">
            <Input
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
              className="flex-1"
            />
            <Button size="sm" onClick={setLink}>OK</Button>
          </div>
          {editor.isActive('link') && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 text-xs text-destructive"
              onClick={() => {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                setLinkPopoverOpen(false);
              }}
            >
              Link entfernen
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  maxLength = 5000,
  minLength = 50,
  disabled = false,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline', target: '_blank', rel: 'noopener noreferrer' },
      }),
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  // Zeichenanzahl (nur Text, kein HTML)
  const charCount = editor.storage.characterCount?.characters?.() ?? editor.getText().length;

  return (
    <div className={cn('rounded-md border bg-background', disabled && 'opacity-50', className)}>
      {!disabled && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
      <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
        {charCount}/{maxLength} Zeichen • Min. {minLength} Zeichen
      </div>
    </div>
  );
}

/**
 * Komponente zum Darstellen von Rich-Text HTML-Inhalten.
 * Nutzt Tailwind prose-Klassen fuer die Formatierung.
 */
export function RichTextContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  // Pruefen ob der Inhalt HTML ist
  const isHtml = content.includes('<');

  if (!isHtml) {
    // Plaintext: Zeilenumbrueche beibehalten
    return (
      <div className={cn('prose prose-neutral dark:prose-invert max-w-none break-words', className)}>
        {content.split('\n').map((line, i) => (
          <p key={i}>{line || '\u00A0'}</p>
        ))}
      </div>
    );
  }

  // HTML sanitieren mit DOMPurify um XSS zu verhindern,
  // dann Inline-Color-Styles entfernen — Text soll standardmaessig schwarz/weiss sein
  const sanitizedContent = sanitizeHtml(content)
    .replace(/\s*color:\s*[^;"']+;?/gi, '')
    .replace(/\s*style="\s*"/gi, '');

  return (
    <div
      className={cn(
        'prose prose-neutral dark:prose-invert max-w-none',
        // Links stylen
        'prose-a:text-primary prose-a:underline prose-a:break-all',
        // Highlight stylen
        '[&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-800',
        // Inline-Farben ueberschreiben: immer aktuelle Textfarbe verwenden
        '[&_span[style]]:!text-foreground',
        // Lange Woerter/URLs umbrechen
        'break-words',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

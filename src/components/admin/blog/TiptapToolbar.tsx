"use client";

import { type Editor } from "@tiptap/react";

interface TiptapToolbarProps {
  editor: Editor | null;
}

export default function TiptapToolbar({ editor }: TiptapToolbarProps) {
  if (!editor) return null;

  const btnBase =
    "px-2.5 py-1.5 rounded text-sm font-medium transition-colors";
  const btnActive = "bg-brand-500 text-white";
  const btnInactive =
    "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700";

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${btnBase} ${editor.isActive("bold") ? btnActive : btnInactive}`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${btnBase} ${editor.isActive("italic") ? btnActive : btnInactive}`}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`${btnBase} ${editor.isActive("strike") ? btnActive : btnInactive}`}
      >
        S
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={`${btnBase} ${editor.isActive("heading", { level: 2 }) ? btnActive : btnInactive}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        className={`${btnBase} ${editor.isActive("heading", { level: 3 }) ? btnActive : btnInactive}`}
      >
        H3
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${btnBase} ${editor.isActive("bulletList") ? btnActive : btnInactive}`}
      >
        UL
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${btnBase} ${editor.isActive("orderedList") ? btnActive : btnInactive}`}
      >
        OL
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${btnBase} ${editor.isActive("blockquote") ? btnActive : btnInactive}`}
      >
        &ldquo;
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      <button
        type="button"
        onClick={() => {
          const url = window.prompt("Enter URL:");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`${btnBase} ${editor.isActive("link") ? btnActive : btnInactive}`}
      >
        Link
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("Image URL:");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        className={`${btnBase} ${btnInactive}`}
      >
        Image
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={`${btnBase} ${btnInactive}`}
      >
        HR
      </button>
    </div>
  );
}

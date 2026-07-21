"use client";

import { useRef, useState } from "react";

/**
 * Uploads photographs and keeps the newline-separated URL list in sync.
 *
 * The textarea stays the single source of truth — the server action already
 * reads it — so pasting a URL by hand still works exactly as before. This just
 * removes the need to host the file somewhere first.
 */
export function ImageUploader({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const urls = value
    .split(/\r?\n/)
    .map((u) => u.trim())
    .filter(Boolean);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);

    const body = new FormData();
    for (const file of files) body.append("files", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Upload failed.");
        return;
      }
      setValue((prev) => [...prev.split(/\r?\n/), ...data.urls].filter((u) => u.trim()).join("\n"));
    } catch {
      setError("Upload failed — check your connection.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    setValue(urls.filter((_, i) => i !== index).join("\n"));
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          upload(e.dataTransfer.files);
        }}
        className={`border border-dashed p-6 text-center transition-colors ${
          dragOver ? "border-black bg-grey-100" : "border-grey-200"
        }`}
      >
        <input
          ref={inputRef}
          id={`${name}-upload`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(e) => upload(e.target.files)}
          className="sr-only"
        />
        <label
          htmlFor={`${name}-upload`}
          className="cursor-pointer text-[11px] font-semibold tracking-[0.14em] uppercase underline underline-offset-4"
        >
          {busy ? "Uploading…" : "Choose photographs"}
        </label>
        <p className="mt-2 text-xs text-grey-600">
          or drag them here — JPG, PNG, WebP or AVIF, up to 8MB each
        </p>
      </div>

      {error && (
        <p className="text-xs text-black" role="alert">
          {error}
        </p>
      )}

      {urls.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <li key={`${url}-${i}`} className="relative">
              <div className="h-24 w-20 overflow-hidden bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
              <span className="mt-1 block text-center text-[10px] text-grey-600">
                {i === 0 ? "Main" : i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove image ${i + 1}`}
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center border border-grey-200 bg-white text-sm leading-none hover:bg-black hover:text-white"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* The action reads this. Kept visible so a URL can still be pasted. */}
      <textarea
        name={name}
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="One image URL per line — the first is the main image."
        className="w-full border border-grey-200 px-3 py-2 font-mono text-xs outline-none focus:border-black"
      />
    </div>
  );
}

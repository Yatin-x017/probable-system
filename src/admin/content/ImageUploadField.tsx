import { useRef, useState } from 'react'
import { Upload, X, Loader2, ImageOff } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { uploadContentImage } from '@/lib/supabase/content'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  folder: string
  aspect?: string // tailwind aspect-ratio class, e.g. 'aspect-[4/3]'
}

export function ImageUploadField({ label, value, onChange, folder, aspect = 'aspect-[4/3]' }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadContentImage(file, folder)
      onChange(url)
    } catch (err) {
      console.error(err)
      setError('Upload failed. Check that the "site-content" storage bucket exists (see supabase/migrations).')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className={`mt-2 relative w-full max-w-xs ${aspect} rounded-lg border border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center`}>
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-gray-600 hover:text-coral shadow-sm"
              aria-label="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <ImageOff className="w-6 h-6" />
            <span className="text-xs">No image set</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Upload className="w-3.5 h-3.5" />
        {value ? 'Replace image' : 'Upload image'}
      </button>
      {error && <p className="text-xs text-coral mt-1">{error}</p>}
    </div>
  )
}

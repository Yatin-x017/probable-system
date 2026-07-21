import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  getPostById,
  createPost,
  updatePost,
  uploadImage,
} from '@/lib/supabase/api'

export default function AdminBlogEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    published: false,
    published_at: '',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverError, setCoverError] = useState('')

  useEffect(() => {
    if (isNew) return
    async function load() {
      try {
        const post = await getPostById(id!)
        if (post) {
          setForm({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || '',
            content: post.content || '',
            cover_image_url: post.cover_image_url || '',
            published: post.published || false,
            published_at: post.published_at
              ? new Date(post.published_at).toISOString().slice(0, 16)
              : '',
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isNew])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.slug.trim()) errs.slug = 'Slug is required'
    if (!form.title.trim()) errs.title = 'Title is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const data = {
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt || null,
        content: form.content || null,
        cover_image_url: form.cover_image_url || null,
        published: form.published,
        published_at: form.published
          ? form.published_at || new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      }

      if (isNew) {
        await createPost(data)
      } else {
        await updatePost(id!, data)
      }
      navigate('/admin/blog')
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Failed to save. Check that the slug is unique.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverError('')
    setCoverUploading(true)
    try {
      const path = `covers/${Date.now()}-${file.name}`
      const url = await uploadImage('blog-images', path, file)
      setForm((prev) => ({ ...prev, cover_image_url: url }))
    } catch (err) {
      console.error(err)
      setCoverError('Upload failed. Check that the "blog-images" storage bucket exists (see supabase/migrations) and that you\'re still signed in.')
    } finally {
      setCoverUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <button
        onClick={() => navigate('/admin/blog')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to blog
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isNew ? 'New Blog Post' : 'Edit Post'}
      </h1>

      {errors.submit && (
        <div className="mb-4 p-4 bg-coral-50 border border-coral-200 rounded-lg text-coral text-sm">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className={errors.title ? 'border-coral' : ''}
              />
              {errors.title && (
                <p className="text-xs text-coral mt-1">{errors.title}</p>
              )}
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="my-post"
                className={errors.slug ? 'border-coral' : ''}
              />
              {errors.slug && (
                <p className="text-xs text-coral mt-1">{errors.slug}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
              rows={2}
              placeholder="Short summary..."
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              rows={15}
              placeholder="Write your post content here..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Plain text with line breaks. Markdown support coming soon.
            </p>
          </div>

          <div>
            <Label>Cover Image</Label>
            <div className="flex items-center gap-4">
              {form.cover_image_url && (
                <img
                  src={form.cover_image_url}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={coverUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {coverUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {coverUploading ? 'Uploading...' : form.cover_image_url ? 'Change' : 'Upload'}
                </Button>
                {coverError && <p className="text-xs text-coral mt-1.5 max-w-xs">{coverError}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="published"
                checked={form.published}
                onCheckedChange={(checked) =>
                  setForm((p) => ({ ...p, published: checked === true }))
                }
              />
              <Label htmlFor="published" className="cursor-pointer">
                Published
              </Label>
            </div>
            {form.published && (
              <div className="flex items-center gap-2">
                <Label htmlFor="published_at">Publish Date</Label>
                <Input
                  id="published_at"
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, published_at: e.target.value }))
                  }
                  className="w-auto"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-gray-900 hover:bg-gray-800"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isNew ? 'Create Post' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/blog')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

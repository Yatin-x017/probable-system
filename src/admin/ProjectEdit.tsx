import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Upload, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  getProjectById,
  createProject,
  updateProject,
  uploadImage,
  addProjectImage,
  deleteProjectImage,
  getProjectImages,
} from '@/lib/supabase/api'
import type { Database } from '@/types/supabase'

type ProjectImage = Database['public']['Tables']['project_images']['Row']

export default function AdminProjectEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    slug: '',
    title: '',
    summary: '',
    role: '',
    type: '',
    cover_image_url: '',
    video_url: '',
    problem: '',
    process: '',
    outcome: '',
    tech_stack: '',
    live_url: '',
    repo_url: '',
    featured: false,
    published: false,
    sort_order: 0,
  })
  const [images, setImages] = useState<ProjectImage[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverError, setCoverError] = useState('')
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoError, setVideoError] = useState('')
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [galleryError, setGalleryError] = useState('')

  useEffect(() => {
    if (isNew) return
    async function load() {
      try {
        const project = await getProjectById(id!)
        if (project) {
          setForm({
            slug: project.slug,
            title: project.title,
            summary: project.summary || '',
            role: project.role || '',
            type: project.type?.join(', ') || '',
            cover_image_url: project.cover_image_url || '',
            video_url: project.video_url || '',
            problem: project.problem || '',
            process: project.process || '',
            outcome: project.outcome || '',
            tech_stack: project.tech_stack?.join(', ') || '',
            live_url: project.live_url || '',
            repo_url: project.repo_url || '',
            featured: project.featured || false,
            published: project.published || false,
            sort_order: project.sort_order || 0,
          })
          const imgs = await getProjectImages(project.id)
          setImages(imgs)
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
        summary: form.summary || null,
        role: form.role || null,
        type: form.type ? form.type.split(',').map((s) => s.trim()).filter(Boolean) : null,
        cover_image_url: form.cover_image_url || null,
        video_url: form.video_url || null,
        problem: form.problem || null,
        process: form.process || null,
        outcome: form.outcome || null,
        tech_stack: form.tech_stack
          ? form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        live_url: form.live_url || null,
        repo_url: form.repo_url || null,
        featured: form.featured,
        published: form.published,
        sort_order: form.sort_order,
      }

      if (isNew) {
        await createProject(data)
      } else {
        await updateProject(id!, data)
      }
      navigate('/admin/projects')
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
      const url = await uploadImage('project-images', path, file)
      setForm((prev) => ({ ...prev, cover_image_url: url }))
    } catch (err) {
      console.error(err)
      setCoverError('Upload failed. Check that the "project-images" storage bucket exists (see supabase/migrations) and that you\'re still signed in.')
    } finally {
      setCoverUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoError('')
    setVideoUploading(true)
    try {
      const path = `reels/${Date.now()}-${file.name}`
      const url = await uploadImage('project-videos', path, file)
      setForm((prev) => ({ ...prev, video_url: url }))
    } catch (err) {
      console.error(err)
      setVideoError('Upload failed. Check that the "project-videos" storage bucket exists (see supabase/migrations) and that you\'re still signed in.')
    } finally {
      setVideoUploading(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !id || id === 'new') return
    setGalleryError('')
    setGalleryUploading(true)
    let failures = 0
    for (const file of files) {
      try {
        const path = `gallery/${Date.now()}-${file.name}`
        const url = await uploadImage('project-images', path, file)
        await addProjectImage({
          project_id: id,
          image_url: url,
          sort_order: images.length,
        })
        const imgs = await getProjectImages(id)
        setImages(imgs)
      } catch (err) {
        console.error(err)
        failures += 1
      }
    }
    if (failures > 0) {
      setGalleryError(
        `${failures} of ${files.length} image(s) failed to upload. Check that the "project-images" storage bucket exists and that you're still signed in.`
      )
    }
    setGalleryUploading(false)
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteProjectImage(imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (err) {
      console.error(err)
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
        onClick={() => navigate('/admin/projects')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isNew ? 'New Project' : 'Edit Project'}
      </h1>

      {errors.submit && (
        <div className="mb-4 p-4 bg-coral-50 border border-coral-200 rounded-lg text-coral text-sm">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Basic Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className={errors.title ? 'border-coral' : ''}
              />
              {errors.title && <p className="text-xs text-coral mt-1">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="my-project"
                className={errors.slug ? 'border-coral' : ''}
              />
              {errors.slug && <p className="text-xs text-coral mt-1">{errors.slug}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={form.summary}
              onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
              rows={2}
              placeholder="Brief description of the project..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                placeholder="Lead Designer"
              />
            </div>
            <div>
              <Label htmlFor="type">Type (comma-separated)</Label>
              <Input
                id="type"
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                placeholder="UI/UX, Branding, Development"
              />
            </div>
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

          <div>
            <Label>Case Study Video</Label>
            <p className="text-xs text-gray-500 mb-2">
              Shown at the top of the project page in place of the placeholder reel. MP4/WebM recommended.
            </p>
            <div className="flex items-center gap-4">
              {form.video_url && (
                <video
                  src={form.video_url}
                  className="w-32 aspect-video rounded-lg object-cover bg-gray-100"
                  muted
                />
              )}
              <div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={videoUploading}
                    onClick={() => videoInputRef.current?.click()}
                  >
                    {videoUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {videoUploading ? 'Uploading...' : form.video_url ? 'Change' : 'Upload'}
                  </Button>
                  {form.video_url && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setForm((p) => ({ ...p, video_url: '' }))}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                {videoError && <p className="text-xs text-coral mt-1.5 max-w-xs">{videoError}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Content
          </h2>

          <div>
            <Label htmlFor="problem">Problem</Label>
            <Textarea
              id="problem"
              value={form.problem}
              onChange={(e) => setForm((p) => ({ ...p, problem: e.target.value }))}
              rows={4}
              placeholder="What problem did this project solve?"
            />
          </div>

          <div>
            <Label htmlFor="process">Process</Label>
            <Textarea
              id="process"
              value={form.process}
              onChange={(e) => setForm((p) => ({ ...p, process: e.target.value }))}
              rows={4}
              placeholder="Describe your design/development process..."
            />
          </div>

          <div>
            <Label htmlFor="outcome">Outcome</Label>
            <Textarea
              id="outcome"
              value={form.outcome}
              onChange={(e) => setForm((p) => ({ ...p, outcome: e.target.value }))}
              rows={4}
              placeholder="What were the results?"
            />
          </div>
        </div>

        {/* Gallery */}
        {!isNew && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Gallery
            </h2>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              disabled={galleryUploading}
              onClick={() => galleryInputRef.current?.click()}
            >
              {galleryUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {galleryUploading ? 'Uploading...' : 'Add Images'}
            </Button>
            {galleryError && <p className="text-xs text-coral">{galleryError}</p>}

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.image_url}
                      alt=""
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-coral" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Links & Meta */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Links & Meta
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="live_url">Live URL</Label>
              <Input
                id="live_url"
                value={form.live_url}
                onChange={(e) => setForm((p) => ({ ...p, live_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="repo_url">Repo URL</Label>
              <Input
                id="repo_url"
                value={form.repo_url}
                onChange={(e) => setForm((p) => ({ ...p, repo_url: e.target.value }))}
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tech_stack">Tech Stack (comma-separated)</Label>
            <Input
              id="tech_stack"
              value={form.tech_stack}
              onChange={(e) => setForm((p) => ({ ...p, tech_stack: e.target.value }))}
              placeholder="React, TypeScript, Tailwind CSS"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="featured"
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm((p) => ({ ...p, featured: checked === true }))
                }
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured
              </Label>
            </div>
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
            <div className="flex items-center gap-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))
                }
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-gray-900 hover:bg-gray-800"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {isNew ? 'Create Project' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/projects')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

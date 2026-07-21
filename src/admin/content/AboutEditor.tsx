import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getSiteContent, saveSiteContent } from '@/lib/supabase/content'
import { DEFAULT_ABOUT_PAGE } from '@/lib/content/defaults'
import type { AboutPageContent, QuickFact, SkillGroup, ExperienceItem } from '@/lib/content/defaults'
import { ImageUploadField } from './ImageUploadField'

export default function AboutEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<AboutPageContent>(DEFAULT_ABOUT_PAGE)

  useEffect(() => {
    getSiteContent('about_page')
      .then(setContent)
      .catch((err) => {
        console.error(err)
        toast.error('Could not load About content')
      })
      .finally(() => setLoading(false))
  }, [])

  const update = <K extends keyof AboutPageContent>(key: K, value: AboutPageContent[K]) =>
    setContent((c) => ({ ...c, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSiteContent('about_page', content)
      toast.success('About page saved')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save. Have you run the site_content SQL migration in Supabase?')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  }

  const updateFact = (i: number, patch: Partial<QuickFact>) => {
    const next = [...content.quick_facts]
    next[i] = { ...next[i], ...patch }
    update('quick_facts', next)
  }
  const updateSkillGroup = (i: number, patch: Partial<SkillGroup>) => {
    const next = [...content.skills]
    next[i] = { ...next[i], ...patch }
    update('skills', next)
  }
  const updateJob = (i: number, patch: Partial<ExperienceItem>) => {
    const next = [...content.experience]
    next[i] = { ...next[i], ...patch }
    update('experience', next)
  }

  return (
    <div className="space-y-10">
      {/* Header + bio */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Header & Bio</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Label>Page heading</Label>
              <Input value={content.heading} onChange={(e) => update('heading', e.target.value)} />
            </div>
            <div>
              <Label>Intro</Label>
              <Textarea rows={2} value={content.intro} onChange={(e) => update('intro', e.target.value)} />
            </div>
            <div>
              <Label>Bio paragraphs (one per line)</Label>
              <Textarea
                rows={6}
                value={content.bio_paragraphs.join('\n')}
                onChange={(e) => update('bio_paragraphs', e.target.value.split('\n').filter((l) => l.trim().length > 0))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input value={content.location} onChange={(e) => update('location', e.target.value)} />
              </div>
              <div>
                <Label>Years of experience</Label>
                <Input value={content.years_experience} onChange={(e) => update('years_experience', e.target.value)} />
              </div>
            </div>
          </div>
          <ImageUploadField
            label="Portrait"
            value={content.portrait_url}
            onChange={(url) => update('portrait_url', url)}
            folder="about-portrait"
          />
        </div>
      </section>

      {/* Quick facts */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Facts</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => update('quick_facts', [...content.quick_facts, { label: 'Label', value: 'Value' }])}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {content.quick_facts.map((fact, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Input placeholder="Label" value={fact.label} onChange={(e) => updateFact(i, { label: e.target.value })} />
              <Input placeholder="Value" value={fact.value} onChange={(e) => updateFact(i, { value: e.target.value })} />
              <button
                type="button"
                onClick={() => update('quick_facts', content.quick_facts.filter((_, idx) => idx !== i))}
                className="p-2 text-gray-400 hover:text-coral"
                aria-label="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Skills & Tools</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => update('skills', [...content.skills, { category: 'Category', items: [] }])}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add group
          </Button>
        </div>
        <div className="space-y-4">
          {content.skills.map((group, i) => (
            <div key={i} className="flex gap-3 items-start bg-gray-50 rounded-lg p-3">
              <div className="w-40 shrink-0">
                <Label>Category</Label>
                <Input value={group.category} onChange={(e) => updateSkillGroup(i, { category: e.target.value })} />
              </div>
              <div className="flex-1">
                <Label>Items (comma separated)</Label>
                <Input
                  value={group.items.join(', ')}
                  onChange={(e) => updateSkillGroup(i, { items: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                />
              </div>
              <button
                type="button"
                onClick={() => update('skills', content.skills.filter((_, idx) => idx !== i))}
                className="p-2 mt-6 text-gray-400 hover:text-coral"
                aria-label="Remove group"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Experience</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update('experience', [...content.experience, { title: 'Title', company: 'Company', period: '2024 — Present', description: '' }])
            }
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add role
          </Button>
        </div>
        <div className="space-y-4">
          {content.experience.map((job, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Title</Label>
                  <Input value={job.title} onChange={(e) => updateJob(i, { title: e.target.value })} />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input value={job.company} onChange={(e) => updateJob(i, { company: e.target.value })} />
                </div>
                <div>
                  <Label>Period</Label>
                  <Input value={job.period} onChange={(e) => updateJob(i, { period: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={2} value={job.description} onChange={(e) => updateJob(i, { description: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => update('experience', content.experience.filter((_, idx) => idx !== i))}
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-coral"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Closing CTA</h3>
        <div>
          <Label>Heading</Label>
          <Input value={content.cta_heading} onChange={(e) => update('cta_heading', e.target.value)} />
        </div>
        <div className="mt-4">
          <Label>Body</Label>
          <Textarea rows={2} value={content.cta_body} onChange={(e) => update('cta_body', e.target.value)} />
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-gray-900 hover:bg-gray-800">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save About Page
        </Button>
      </div>
    </div>
  )
}

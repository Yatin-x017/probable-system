import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getSiteContent, saveSiteContent, uploadContentImage } from '@/lib/supabase/content'
import { DEFAULT_HERO, DEFAULT_ABOUT_TEASER, DEFAULT_CTA, DEFAULT_MARQUEE } from '@/lib/content/defaults'
import type { HeroContent, AboutTeaserContent, CtaContent, MarqueeContent } from '@/lib/content/defaults'
import { ImageUploadField } from './ImageUploadField'

export default function HomeEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO)
  const [teaser, setTeaser] = useState<AboutTeaserContent>(DEFAULT_ABOUT_TEASER)
  const [cta, setCta] = useState<CtaContent>(DEFAULT_CTA)
  const [marquee, setMarquee] = useState<MarqueeContent>(DEFAULT_MARQUEE)
  const [marqueeUploading, setMarqueeUploading] = useState(false)
  const [marqueeError, setMarqueeError] = useState('')

  useEffect(() => {
    Promise.all([
      getSiteContent('home_hero'),
      getSiteContent('home_about_teaser'),
      getSiteContent('home_cta'),
      getSiteContent('home_marquee'),
    ])
      .then(([h, t, c, m]) => {
        setHero(h)
        setTeaser(t)
        setCta(c)
        setMarquee(m)
      })
      .catch((err) => {
        console.error(err)
        toast.error('Could not load Home content')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        saveSiteContent('home_hero', hero),
        saveSiteContent('home_about_teaser', teaser),
        saveSiteContent('home_cta', cta),
        saveSiteContent('home_marquee', marquee),
      ])
      toast.success('Home page saved')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save. Have you run the site_content SQL migration in Supabase?')
    } finally {
      setSaving(false)
    }
  }

  const handleAddMarqueeImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setMarqueeError('')
    setMarqueeUploading(true)
    let failures = 0
    const urls: string[] = []
    for (const file of files) {
      try {
        urls.push(await uploadContentImage(file, 'home-marquee'))
      } catch (err) {
        console.error(err)
        failures += 1
      }
    }
    if (urls.length > 0) setMarquee((prev) => ({ ...prev, images: [...prev.images, ...urls] }))
    if (failures > 0) setMarqueeError(`${failures} image(s) failed to upload.`)
    setMarqueeUploading(false)
  }

  const handleRemoveMarqueeImage = (index: number) => {
    setMarquee((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  if (loading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Hero</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Heading — line 1</Label>
            <Input value={hero.heading_top} onChange={(e) => setHero({ ...hero, heading_top: e.target.value })} />
          </div>
          <div>
            <Label>Heading — highlighted line</Label>
            <Input value={hero.heading_highlight} onChange={(e) => setHero({ ...hero, heading_highlight: e.target.value })} />
          </div>
          <div>
            <Label>Heading — line 3</Label>
            <Input value={hero.heading_bottom} onChange={(e) => setHero({ ...hero, heading_bottom: e.target.value })} />
          </div>
        </div>
        <div className="mt-4">
          <Label>Subheading</Label>
          <Textarea rows={2} value={hero.subheading} onChange={(e) => setHero({ ...hero, subheading: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Primary button label</Label>
              <Input value={hero.primary_cta_label} onChange={(e) => setHero({ ...hero, primary_cta_label: e.target.value })} />
            </div>
            <div className="flex-1">
              <Label>Primary button link</Label>
              <Input value={hero.primary_cta_href} onChange={(e) => setHero({ ...hero, primary_cta_href: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Secondary button label</Label>
              <Input value={hero.secondary_cta_label} onChange={(e) => setHero({ ...hero, secondary_cta_label: e.target.value })} />
            </div>
            <div className="flex-1">
              <Label>Secondary button link</Label>
              <Input value={hero.secondary_cta_href} onChange={(e) => setHero({ ...hero, secondary_cta_href: e.target.value })} />
            </div>
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">About Teaser</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Label>Heading</Label>
              <Input value={teaser.heading} onChange={(e) => setTeaser({ ...teaser, heading: e.target.value })} />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea rows={4} value={teaser.body} onChange={(e) => setTeaser({ ...teaser, body: e.target.value })} />
            </div>
            <div>
              <Label>Skills (comma separated)</Label>
              <Input
                value={teaser.skills.join(', ')}
                onChange={(e) => setTeaser({ ...teaser, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              />
            </div>
          </div>
          <ImageUploadField
            label="Teaser image"
            value={teaser.image_url}
            onChange={(url) => setTeaser({ ...teaser, image_url: url })}
            folder="home-about-teaser"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Closing CTA</h3>
        <div>
          <Label>Heading</Label>
          <Input value={cta.heading} onChange={(e) => setCta({ ...cta, heading: e.target.value })} />
        </div>
        <div className="mt-4">
          <Label>Body</Label>
          <Textarea rows={2} value={cta.body} onChange={(e) => setCta({ ...cta, body: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Primary button label</Label>
              <Input value={cta.primary_cta_label} onChange={(e) => setCta({ ...cta, primary_cta_label: e.target.value })} />
            </div>
            <div className="flex-1">
              <Label>Primary button link</Label>
              <Input value={cta.primary_cta_href} onChange={(e) => setCta({ ...cta, primary_cta_href: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Secondary button label</Label>
              <Input value={cta.secondary_cta_label} onChange={(e) => setCta({ ...cta, secondary_cta_label: e.target.value })} />
            </div>
            <div className="flex-1">
              <Label>Secondary button link</Label>
              <Input value={cta.secondary_cta_href} onChange={(e) => setCta({ ...cta, secondary_cta_href: e.target.value })} />
            </div>
          </div>
        </div>
      </section>

      {/* Work Marquee */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Work Marquee (bottom of homepage)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Heading</Label>
            <Input value={marquee.heading} onChange={(e) => setMarquee({ ...marquee, heading: e.target.value })} />
          </div>
          <div>
            <Label>Body</Label>
            <Input value={marquee.body} onChange={(e) => setMarquee({ ...marquee, body: e.target.value })} />
          </div>
        </div>

        <div className="mt-4">
          <Label>Images</Label>
          <p className="text-xs text-gray-500 mb-2">
            Screenshots of your work. Upload as many as you like — the section only shows once at least one is added.
          </p>

          {marquee.images.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-3">
              {marquee.images.map((url, i) => (
                <div key={url + i} className="relative group">
                  <img src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => handleRemoveMarqueeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-coral" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            id="marquee-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              handleAddMarqueeImages(e.target.files)
              e.target.value = ''
            }}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            disabled={marqueeUploading}
            onClick={() => document.getElementById('marquee-upload')?.click()}
          >
            {marqueeUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {marqueeUploading ? 'Uploading...' : 'Add Images'}
          </Button>
          {marqueeError && <p className="text-xs text-coral mt-1.5">{marqueeError}</p>}
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-gray-900 hover:bg-gray-800">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Home Page
        </Button>
      </div>
    </div>
  )
}

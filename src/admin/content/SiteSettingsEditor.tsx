import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getSiteContent, saveSiteContent } from '@/lib/supabase/content'
import { DEFAULT_SITE_SETTINGS } from '@/lib/content/defaults'
import type { SiteSettingsContent } from '@/lib/content/defaults'

export default function SiteSettingsEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SiteSettingsContent>(DEFAULT_SITE_SETTINGS)

  useEffect(() => {
    getSiteContent('site_settings')
      .then(setSettings)
      .catch((err) => {
        console.error(err)
        toast.error('Could not load site settings')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSiteContent('site_settings', settings)
      toast.success('Site settings saved')
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

  return (
    <div className="space-y-10">
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Site Identity (Navbar &amp; Footer)
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Navigation links (Work, About, Blog, Contact, Book a Call) map to fixed pages and aren't editable here — everything else is.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Site name / logo text</Label>
            <Input value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} />
          </div>
          <div>
            <Label>Contact email</Label>
            <Input value={settings.contact_email} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} />
          </div>
        </div>
        <div className="mt-4">
          <Label>Footer tagline</Label>
          <Textarea rows={2} value={settings.footer_tagline} onChange={(e) => setSettings({ ...settings, footer_tagline: e.target.value })} />
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Social Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>GitHub URL</Label>
            <Input value={settings.social_github} onChange={(e) => setSettings({ ...settings, social_github: e.target.value })} />
          </div>
          <div>
            <Label>LinkedIn URL</Label>
            <Input value={settings.social_linkedin} onChange={(e) => setSettings({ ...settings, social_linkedin: e.target.value })} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-gray-900 hover:bg-gray-800">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Site Settings
        </Button>
      </div>
    </div>
  )
}

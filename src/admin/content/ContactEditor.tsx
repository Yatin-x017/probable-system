import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getSiteContent, saveSiteContent } from '@/lib/supabase/content'
import { DEFAULT_CONTACT_PAGE } from '@/lib/content/defaults'
import type { ContactPageContent } from '@/lib/content/defaults'

export default function ContactEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<ContactPageContent>(DEFAULT_CONTACT_PAGE)

  useEffect(() => {
    getSiteContent('contact_page')
      .then(setContent)
      .catch((err) => {
        console.error(err)
        toast.error('Could not load Contact content')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSiteContent('contact_page', content)
      toast.success('Contact page saved')
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
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contact Page</h3>
        <div>
          <Label>Intro text</Label>
          <Textarea rows={2} value={content.intro} onChange={(e) => setContent({ ...content, intro: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Email shown on page</Label>
            <Input value={content.email} onChange={(e) => setContent({ ...content, email: e.target.value })} />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={content.location} onChange={(e) => setContent({ ...content, location: e.target.value })} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-gray-900 hover:bg-gray-800">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Contact Page
        </Button>
      </div>
    </div>
  )
}

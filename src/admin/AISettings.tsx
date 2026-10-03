import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Sparkles, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  AI_SETTINGS_DEFAULTS,
  generatePost,
  getAIRuns,
  getAISettings,
  saveAISettings,
  type AIRun,
  type AISettings,
} from '@/lib/supabase/ai'

export default function AdminAISettings() {
  const [s, setS] = useState<AISettings>(AI_SETTINGS_DEFAULTS)
  const [queueText, setQueueText] = useState('')
  const [runs, setRuns] = useState<AIRun[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  async function loadRuns() {
    try {
      setRuns(await getAIRuns())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const settings = await getAISettings()
        setS(settings)
        setQueueText(settings.topic_queue.join('\n'))
        await loadRuns()
      } catch (err) {
        console.error(err)
        toast.error('Could not load AI settings. Have you run migration 0005_ai.sql?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const queueFromText = () =>
    queueText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

  async function handleSave() {
    setSaving(true)
    try {
      const next = { ...s, topic_queue: queueFromText() }
      await saveAISettings(next)
      setS(next)
      toast.success('AI settings saved')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save AI settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      // Save first so the function reads the latest voice/notes/queue.
      const next = { ...s, topic_queue: queueFromText() }
      await saveAISettings(next)
      setS(next)
      const res = await generatePost({ save: true })
      toast.success(`Draft created: ${res.post.title}`)
      // The function consumes the first queued topic when it uses one.
      const fresh = await getAISettings()
      setS(fresh)
      setQueueText(fresh.topic_queue.join('\n'))
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
      loadRuns()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const card = 'bg-white rounded-xl border border-gray-200 p-6 space-y-4'

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI</h1>
        <p className="mt-1 text-sm text-gray-500">
          Writes blog posts in your voice using your projects and notes. Powered by Groq.
        </p>
      </div>

      <div className={card}>
        <h2 className="font-semibold text-gray-900">Scheduled posting</h2>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enabled">Enabled</Label>
            <p className="text-xs text-gray-400">Checked daily at 04:00 UTC. A post is written only when enough days have passed since the last AI post.</p>
          </div>
          <Switch
            id="enabled"
            checked={s.enabled}
            onCheckedChange={(v) => setS((p) => ({ ...p, enabled: v }))}
          />
        </div>

        <div>
          <Label>Scheduled posts are</Label>
          <div className="flex gap-2 mt-1">
            <Button
              type="button"
              variant={s.mode === 'draft' ? 'default' : 'outline'}
              onClick={() => setS((p) => ({ ...p, mode: 'draft' }))}
            >
              Saved as drafts
            </Button>
            <Button
              type="button"
              variant={s.mode === 'auto' ? 'default' : 'outline'}
              onClick={() => setS((p) => ({ ...p, mode: 'auto' }))}
            >
              Auto-published
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gap">Days between posts</Label>
            <Input
              id="gap"
              type="number"
              min={1}
              value={s.min_gap_days}
              onChange={(e) =>
                setS((p) => ({ ...p, min_gap_days: Math.max(1, Number(e.target.value) || 1) }))
              }
            />
          </div>
          <div>
            <Label htmlFor="model">Groq model</Label>
            <Input
              id="model"
              value={s.model}
              onChange={(e) => setS((p) => ({ ...p, model: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className={card}>
        <h2 className="font-semibold text-gray-900">Your voice</h2>
        <div>
          <Label htmlFor="voice">Voice guide</Label>
          <Textarea
            id="voice"
            rows={3}
            value={s.voice_guide}
            onChange={(e) => setS((p) => ({ ...p, voice_guide: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="samples">Writing samples</Label>
          <Textarea
            id="samples"
            rows={8}
            value={s.writing_samples}
            onChange={(e) => setS((p) => ({ ...p, writing_samples: e.target.value }))}
            placeholder="Paste a few things you've written. The AI imitates tone and rhythm from these."
          />
        </div>
      </div>

      <div className={card}>
        <h2 className="font-semibold text-gray-900">What to write about</h2>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={5}
            value={s.raw_notes}
            onChange={(e) => setS((p) => ({ ...p, raw_notes: e.target.value }))}
            placeholder="What you actually built or learned lately. This and your published projects are the only things the AI may claim you did."
          />
        </div>
        <div>
          <Label htmlFor="queue">Topic queue (one per line, used in order)</Label>
          <Textarea
            id="queue"
            rows={4}
            value={queueText}
            onChange={(e) => setQueueText(e.target.value)}
            placeholder="Leave empty and the AI picks a topic from your projects and notes."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || generating} className="bg-gray-900 hover:bg-gray-800">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save settings
        </Button>
        <Button variant="outline" onClick={handleGenerate} disabled={saving || generating}>
          {generating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {generating ? 'Writing...' : 'Generate draft now'}
        </Button>
        <Link to="/admin/blog" className="text-sm text-gray-500 hover:text-gray-900">
          View posts
        </Link>
      </div>

      <div className={card}>
        <h2 className="font-semibold text-gray-900">Recent runs</h2>
        {runs.length === 0 ? (
          <p className="text-sm text-gray-400">No runs yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {runs.map((r) => (
              <li key={r.id} className="py-2 flex items-start gap-3 text-sm">
                {r.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-fresh shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 mt-0.5 text-coral shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-gray-900 truncate">{r.topic || 'Untitled run'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleString()} · {r.trigger}
                    {r.completion_tokens != null && ` · ${r.completion_tokens} tokens out`}
                  </p>
                  {r.error && <p className="text-xs text-coral mt-0.5">{r.error}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

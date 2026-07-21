import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar } from 'lucide-react'
import { getPostBySlug } from '@/lib/supabase/api'
import { Skeleton } from '@/components/ui/skeleton'
import { useRevealUp } from '@/lib/motion'
import type { Database } from '@/types/supabase'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const revealUp = useRevealUp()

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)

    getPostBySlug(slug)
      .then((data) => {
        if (!data) setNotFound(true)
        else setPost(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [slug])

  if (notFound) return <Navigate to="/blog" replace />

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-4 w-24 bg-gray-100" />
          <Skeleton className="h-10 w-3/4 bg-gray-100" />
          <Skeleton className="h-4 w-full bg-gray-100" />
          <Skeleton className="h-4 w-5/6 bg-gray-100" />
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        <motion.article {...revealUp}>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Calendar className="w-4 h-4" />
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Draft'}
          </div>

          <h1 className="text-display-md text-gray-900 mb-6">
            {post.title}
          </h1>

          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full rounded-xl mb-8"
            />
          )}

          {post.content ? (
            <div className="prose prose-gray max-w-none">
              {post.content.split('\n').map((paragraph, i) => (
                <p key={i} className="text-gray-600 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No content yet.</p>
          )}
        </motion.article>

        <motion.div {...revealUp} className="mt-16 pt-8 border-t border-gray-100">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Read more articles
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

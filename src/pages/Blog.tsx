import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'
import { getPublishedPosts } from '@/lib/supabase/api'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useRevealUp, useStagger } from '@/lib/motion'
import type { Database } from '@/types/supabase'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const revealUp = useRevealUp()
  const stagger = useStagger()

  useEffect(() => {
    getPublishedPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...revealUp} className="mb-12">
          <h1 className="text-display-md text-gray-900">Blog</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            Thoughts on design, development, and the craft of building great
            digital products.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
                <Skeleton className="h-4 w-24 mb-3 bg-gray-100" />
                <Skeleton className="h-7 w-3/4 mb-3 bg-gray-100" />
                <Skeleton className="h-4 w-full bg-gray-100" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="space-y-6"
          >
            {posts.map((post) => (
              <motion.article
                key={post.id}
                variants={stagger.item}
                className="group bg-white rounded-xl border border-gray-100 p-6 shadow-layer-sm hover:shadow-layer-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <Calendar className="w-4 h-4" />
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Draft'}
                </div>
                <Link to={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-sky transition-colors mb-2">
                    {post.title}
                  </h2>
                </Link>
                {post.excerpt && (
                  <p className="text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
                )}
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 group-hover:text-sky transition-colors"
                >
                  Read more
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}

        {!loading && posts.length === 0 && (
          <EmptyState message="No blog posts published yet." />
        )}
      </div>
    </div>
  )
}

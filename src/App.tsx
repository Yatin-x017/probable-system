import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Outlet, useLocation, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/hooks/useAuth'
import ScrollProvider, { useLenis } from '@/components/ScrollProvider'
import { pageVariants, pageTransition } from '@/lib/motion'
import TourProvider from '@/components/tour/TourProvider'
import TourOverlay from '@/components/tour/TourOverlay'
import TourLauncher from '@/components/tour/TourLauncher'
import CookieConsent from '@/components/CookieConsent'
import PageErrorBoundary from '@/components/PageErrorBoundary'

const Navbar = lazy(() => import('@/components/Navbar'))
const Footer = lazy(() => import('@/components/Footer'))

const Home = lazy(() => import('@/pages/Home'))
const Work = lazy(() => import('@/pages/Work'))
const WorkDetail = lazy(() => import('@/pages/WorkDetail'))
const About = lazy(() => import('@/pages/About'))
const Blog = lazy(() => import('@/pages/Blog'))
const BlogDetail = lazy(() => import('@/pages/BlogDetail'))
const Contact = lazy(() => import('@/pages/Contact'))
const Book = lazy(() => import('@/pages/Book'))
const Pricing = lazy(() => import('@/pages/Pricing'))
const TermsOfUse = lazy(() => import('@/pages/legal/TermsOfUse'))
const PrivacyPolicy = lazy(() => import('@/pages/legal/PrivacyPolicy'))
const TermsOfService = lazy(() => import('@/pages/legal/TermsOfService'))
const DataPolicy = lazy(() => import('@/pages/legal/DataPolicy'))
const CookiePreferences = lazy(() => import('@/pages/legal/CookiePreferences'))

const AdminLayout = lazy(() => import('@/admin/AdminLayout'))
const AdminLogin = lazy(() => import('@/admin/Login'))
const AdminDashboard = lazy(() => import('@/admin/Dashboard'))
const AdminContent = lazy(() => import('@/admin/Content'))
const AdminProjects = lazy(() => import('@/admin/Projects'))
const AdminProjectEdit = lazy(() => import('@/admin/ProjectEdit'))
const AdminBlog = lazy(() => import('@/admin/Blog'))
const AdminBlogEdit = lazy(() => import('@/admin/BlogEdit'))
const AdminMessages = lazy(() => import('@/admin/Messages'))
const AdminCalendar = lazy(() => import('@/admin/Calendar'))
const AdminPayments = lazy(() => import('@/admin/Payments'))
const AdminAISettings = lazy(() => import('@/admin/AISettings'))

// AdminProjectEdit/AdminBlogEdit read `id` from useParams themselves and treat
// `id === 'new'` as create-mode (see those components). Both routes below
// share a single :id route with AdminProjectEdit/AdminBlogEdit, so navigating
// project A -> project B, or project A -> "new", changes only the `id` param
// — React Router keeps the same component instance mounted rather than
// remounting it, since it's the same element at the same tree position. That
// left stale form state (title, slug, uploaded cover image, etc.) from the
// previous project visible under the new URL. Keying on `id` forces a full
// remount — and a clean form — on every navigation between edit targets.
function AdminProjectEditRoute() {
  const { id } = useParams()
  return <AdminProjectEdit key={id} />
}

function AdminBlogEditRoute() {
  const { id } = useParams()
  return <AdminBlogEdit key={id} />
}

function PageLoadingFallback() {
  return (
    <div role="status" aria-label="Loading page" aria-busy="true" className="relative isolate min-h-[70svh] overflow-hidden bg-[#f8f6f1]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-20 h-72 w-72 rounded-full bg-[#fec430]/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#d24b3e]/10 blur-3xl" />
      <div className="relative mx-auto max-w-[1440px] animate-pulse px-5 py-7 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <div className="h-8 w-28 rounded-full bg-[#121212]/10" />
          <div className="hidden items-center gap-6 md:flex">
            <div className="h-3 w-12 rounded-full bg-[#121212]/10" />
            <div className="h-3 w-16 rounded-full bg-[#121212]/10" />
            <div className="h-3 w-12 rounded-full bg-[#121212]/10" />
          </div>
          <div className="h-10 w-32 rounded-full bg-[#d24b3e]/20" />
        </div>
        <div className="grid min-h-[58svh] items-center gap-10 py-12 md:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="h-12 w-[min(20rem,80%)] rounded-md bg-[#121212]/10 sm:h-16" />
            <div className="h-12 w-[min(17rem,68%)] rounded-md bg-[#d24b3e]/20 sm:h-16" />
            <div className="h-6 w-[min(14rem,58%)] rounded-md bg-[#121212]/10" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full max-w-md rounded-full bg-[#121212]/10" />
              <div className="h-3 w-4/5 max-w-sm rounded-full bg-[#121212]/10" />
            </div>
            <div className="flex gap-4 pt-3">
              <div className="h-11 w-36 rounded-full bg-[#121212]/15" />
              <div className="h-11 w-28 rounded-full bg-[#121212]/8" />
            </div>
          </div>
          <div className="relative aspect-[1.45] overflow-hidden rounded-2xl bg-[#e7e0d3]/75 backdrop-blur-sm">
            <div aria-hidden="true" className="absolute -right-10 top-6 h-56 w-56 rounded-full bg-[#fec430]/35 blur-3xl" />
            <div aria-hidden="true" className="absolute bottom-0 left-8 h-40 w-40 rounded-full bg-[#d24b3e]/15 blur-3xl" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading page…</span>
    </div>
  )
}

// Navbar/Footer live here, outside the AnimatePresence key, so they never
// remount on navigation — only the routed page content underneath transitions.
function PublicLayout() {
  const location = useLocation()
  const lenis = useLenis()
  const prefersReducedMotion = useReducedMotion()
  return (
    <div className="min-h-screen flex flex-col">
      {location.pathname !== '/' && <Navbar />}
      <main className="flex-1">
        <AnimatePresence
          mode="wait"
          initial={false}
          onExitComplete={() => lenis?.scrollTo(0, { immediate: true })}
        >
          <motion.div
            key={location.pathname}
            variants={prefersReducedMotion ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={prefersReducedMotion ? { duration: 0.15 } : pageTransition}
          >
            {/* Keyed by path so a crashed page resets cleanly on the next
                navigation instead of staying stuck blank forever. */}
            <PageErrorBoundary resetKey={location.pathname}>
              <Outlet />
            </PageErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollProvider>
          <TourProvider>
            <Suspense
              fallback={
                <PageLoadingFallback />
              }
            >
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/work" element={<Work />} />
                <Route path="/work/:slug" element={<WorkDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/book" element={<Book />} />
                <Route path="/terms" element={<TermsOfUse />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/data-policy" element={<DataPolicy />} />
                <Route path="/cookies" element={<CookiePreferences />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="projects/:id" element={<AdminProjectEditRoute />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="blog/:id" element={<AdminBlogEditRoute />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="calendar" element={<AdminCalendar />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="ai" element={<AdminAISettings />} />
              </Route>
            </Routes>
            </Suspense>
            <TourOverlay />
            <TourLauncher />
          </TourProvider>
        </ScrollProvider>
      </AuthProvider>
      <CookieConsent />
      <Toaster position="top-right" />
      <Analytics />
    </BrowserRouter>
  )
}

export default App

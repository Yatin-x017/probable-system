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
                <div role="status" className="grid min-h-[50svh] place-items-center bg-[#f6f1e8] text-sm text-[#697282]">
                  Loading…
                </div>
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

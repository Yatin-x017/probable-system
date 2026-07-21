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

// Public Layout
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Public Pages
import Home from '@/pages/Home'
import Work from '@/pages/Work'
import WorkDetail from '@/pages/WorkDetail'
import About from '@/pages/About'
import Blog from '@/pages/Blog'
import BlogDetail from '@/pages/BlogDetail'
import Contact from '@/pages/Contact'
import Book from '@/pages/Book'
import Pricing from '@/pages/Pricing'
import TermsOfUse from '@/pages/legal/TermsOfUse'
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy'
import TermsOfService from '@/pages/legal/TermsOfService'
import DataPolicy from '@/pages/legal/DataPolicy'
import CookiePreferences from '@/pages/legal/CookiePreferences'

// Admin
import AdminLayout from '@/admin/AdminLayout'
import AdminLogin from '@/admin/Login'
import AdminDashboard from '@/admin/Dashboard'
import AdminContent from '@/admin/Content'
import AdminProjects from '@/admin/Projects'
import AdminProjectEdit from '@/admin/ProjectEdit'
import AdminBlog from '@/admin/Blog'
import AdminBlogEdit from '@/admin/BlogEdit'
import AdminMessages from '@/admin/Messages'
import AdminCalendar from '@/admin/Calendar'
import AdminPayments from '@/admin/Payments'

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
      <Navbar />
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
              </Route>
            </Routes>
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

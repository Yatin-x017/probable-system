import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import HomeEditor from './content/HomeEditor'
import AboutEditor from './content/AboutEditor'
import SiteSettingsEditor from './content/SiteSettingsEditor'
import ContactEditor from './content/ContactEditor'

export default function AdminContent() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Content</h1>
        <p className="mt-1 text-sm text-gray-500">
          Edit every piece of text and image on the public site. Changes go live as soon as you save.
        </p>
      </div>

      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="site">Navbar &amp; Footer</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-6">
          <HomeEditor />
        </TabsContent>
        <TabsContent value="about" className="mt-6">
          <AboutEditor />
        </TabsContent>
        <TabsContent value="site" className="mt-6">
          <SiteSettingsEditor />
        </TabsContent>
        <TabsContent value="contact" className="mt-6">
          <ContactEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}

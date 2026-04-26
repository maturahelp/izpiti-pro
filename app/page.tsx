import { Header } from '@/components/marketing/Header'
import { Hero } from '@/components/marketing/Hero'
import { Benefits } from '@/components/marketing/Benefits'
import { ForWhom } from '@/components/marketing/ForWhom'
import { ExamsSection } from '@/components/marketing/ExamsSection'
import { Features } from '@/components/marketing/Features'
import { ProductPreview } from '@/components/marketing/ProductPreview'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { Pricing } from '@/components/marketing/Pricing'
import { Testimonials } from '@/components/marketing/Testimonials'
import { FAQ } from '@/components/marketing/FAQ'
import { CTASection } from '@/components/marketing/CTASection'
import { Footer } from '@/components/marketing/Footer'
import { JsonLd } from '@/components/shared/JsonLd'
import { softwareApplicationSchema, faqPageSchema } from '@/lib/schema'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        <ForWhom />
        <ExamsSection />
        <Features />
        <ProductPreview />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
      <JsonLd data={[softwareApplicationSchema, faqPageSchema]} />
    </>
  )
}

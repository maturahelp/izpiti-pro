import { Header } from '@/components/marketing/Header'
import { Hero } from '@/components/marketing/Hero'
import { Benefits } from '@/components/marketing/Benefits'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { ProgressShowcase } from '@/components/marketing/ProgressShowcase'
import { ExamsSection } from '@/components/marketing/ExamsSection'
import { ForWhom } from '@/components/marketing/ForWhom'
import { Testimonials } from '@/components/marketing/Testimonials'
import { Pricing } from '@/components/marketing/Pricing'
import { FAQ } from '@/components/marketing/FAQ'
import { Footer } from '@/components/marketing/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        <HowItWorks />
        <ProgressShowcase />
        <ExamsSection />
        <ForWhom />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}

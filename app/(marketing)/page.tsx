import { Header } from '@/components/marketing/Header'
import { Hero } from '@/components/marketing/Hero'
import { Benefits } from '@/components/marketing/Benefits'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { ForWhom } from '@/components/marketing/ForWhom'
import { ExamsSection } from '@/components/marketing/ExamsSection'
import { Pricing } from '@/components/marketing/Pricing'
import { Testimonials } from '@/components/marketing/Testimonials'
import { FAQ } from '@/components/marketing/FAQ'
import { CTASection } from '@/components/marketing/CTASection'
import { Footer } from '@/components/marketing/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        <HowItWorks />
        <ForWhom />
        <ExamsSection />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}

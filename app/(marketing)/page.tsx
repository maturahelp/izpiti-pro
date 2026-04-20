import { CTASection } from '@/components/marketing/CTASection'
import { ExamsSection } from '@/components/marketing/ExamsSection'
import { FAQ } from '@/components/marketing/FAQ'
import { Features } from '@/components/marketing/Features'
import { Footer } from '@/components/marketing/Footer'
import { ForWhom } from '@/components/marketing/ForWhom'
import { Header } from '@/components/marketing/Header'
import { Hero } from '@/components/marketing/Hero'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { Pricing } from '@/components/marketing/Pricing'

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <ForWhom />
        <HowItWorks />
        <ExamsSection />
        <Pricing />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}

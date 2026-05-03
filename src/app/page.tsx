import { MarketingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { SocialProof } from "@/components/landing/social-proof";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <MarketingNav />
      <Hero />
      <Features />
      <SocialProof />
      <Footer />
    </div>
  );
}

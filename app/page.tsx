import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { Reveal } from "@/components/landing/Reveal";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { ProfileDemo } from "@/components/landing/ProfileDemo";
import { Safety } from "@/components/landing/Safety";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <div className="wrap">
        <NavBar />
        <Hero />
      </div>
      <Reveal />
      <HowItWorks />
      <Features />
      <ProfileDemo />
      <Safety />
      <Pricing />
      <Footer />
    </>
  );
}

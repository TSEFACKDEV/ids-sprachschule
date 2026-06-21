import HeroSlider from "@/components/home/HeroSlider";
import AdvantagesSection from "@/components/home/AdvantagesSection";
import CoursApercu from "@/components/home/CoursApercu";
import StatsSection from "@/components/home/StatsSection";
import AboutSection from "@/components/home/AboutSection";
import FAQApercu from "@/components/home/FAQApercu";
import Testimonials from "@/components/home/Testimonials";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <AdvantagesSection />
      <CoursApercu />
      <StatsSection />
      <AboutSection />
      <FAQApercu />
    </>
  );
}
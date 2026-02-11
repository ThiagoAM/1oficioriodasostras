import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import ConsultaProcessoSection from "@/components/consulta-processo-section";
import AboutSection from "@/components/about-section";
import PracticeAreas from "@/components/practice-areas";
import Statistics from "@/components/statistics";
import Testimonials from "@/components/testimonials";
import Appointment from "@/components/appointment";
import Gallery from "@/components/gallery";
import LinksSection from "@/components/links-section";
import NewsSection from "@/components/news-section";
import Footer from "@/components/footer";
import AvisosPopup from "@/components/avisos-popup";

export default function Home() {
  return (
    <div className="bg-white font-sans text-gray-800">
      <Header />
      <HeroSection />
      <ConsultaProcessoSection />
      <Appointment />
      <PracticeAreas />
      <Statistics />
      <Testimonials />
      <Gallery />
      <LinksSection />
      <NewsSection />
      <AboutSection />
      <Footer />
      <AvisosPopup />
    </div>
  );
}

import React from 'react';
import Navbar from '../Navbar';
import Hero from '../Hero';
import Trusted from '../Trusted';
import FeaturesShowcase from '../FeaturesShowcase';
import PricingSection from '../PricingSection';
import MobileAppSection from '../MobileAppSection';
import Footer from '../Footer';
import '../style.css';

export default function LandingPage() {
  return (
    <div className="landing-page-wrapper">
      <Navbar />
      <main>
        <Hero />
        <Trusted />
        <FeaturesShowcase />
        <MobileAppSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}

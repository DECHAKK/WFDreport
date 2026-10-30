import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { BenefitsSection } from '../components/BenefitsSection';
import { PlansSection } from '../components/PlansSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { FAQSection } from '../components/FAQSection';
import { LeadForm } from '../components/LeadForm';
import { Footer } from '../components/Footer';
import { Plan } from '../types';
import { apiClient } from '../services/apiClient';

import { InsuranceCalculator } from '../components/InsuranceCalculator';
import { QuoteCalculationResult } from '../services/quoteCalculationService';

export const HomePage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    setPlansError(null);
    try {
      const data = await apiClient.getPlans();
      setPlans(data);
    } catch (err: any) {
      setPlansError(
        err.message || 'ไม่สามารถโหลดข้อมูลแผนประกันภัยจากเซิร์ฟเวอร์ได้ กรุณาตรวจสอบสถานะเซิร์ฟเวอร์หลังบ้าน'
      );
    } finally {
      setPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const scrollToLeadForm = () => {
    const el = document.getElementById('lead-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPlans = () => {
    const el = document.getElementById('plans');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCalculator = () => {
    const el = document.getElementById('calculator-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    scrollToLeadForm();
  };

  const handleQuoteCalculated = (quote: QuoteCalculationResult) => {
    setSelectedPlan({
      id: 99,
      planName: quote.plan.name,
      description: `เบี้ยรายปี ${quote.annual.toLocaleString('th-TH')} บาท • ทุน ${quote.lifeCover.toLocaleString('th-TH')} บาท`,
      demoPremium: `${quote.annual.toLocaleString('th-TH')} บาท/ปี`,
      coverageSummary: [
        `ทุนประกันชีวิต: ${quote.lifeCover.toLocaleString('th-TH')} บาท`,
        quote.ciCover > 0 ? `ทุนคุ้มครอง CI50: ${quote.ciCover.toLocaleString('th-TH')} บาท` : '',
        `ชำระ ${quote.paymentYears} ปี คุ้มครองถึงอายุ ${quote.coverageYears} ปี`,
      ].filter(Boolean),
      isDemo: true,
      isActive: true,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <Navbar onConsultClick={scrollToLeadForm} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection
          onConsultClick={scrollToCalculator}
          onExplorePlansClick={scrollToPlans}
        />

        <BenefitsSection />

        {/* Embedded Interactive Insurance Calculator */}
        <section id="calculator-section" className="py-20 bg-gradient-to-b from-white via-orange-50/50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <InsuranceCalculator
              onContactRequest={() => scrollToLeadForm()}
              onQuoteCalculated={handleQuoteCalculated}
            />
          </div>
        </section>

        <PlansSection
          plans={plans}
          loading={plansLoading}
          error={plansError}
          onRetry={fetchPlans}
          onSelectPlan={handleSelectPlan}
        />

        <HowItWorksSection />

        <FAQSection />

        <LeadForm
          selectedPlan={selectedPlan}
          onClearSelectedPlan={() => setSelectedPlan(null)}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};


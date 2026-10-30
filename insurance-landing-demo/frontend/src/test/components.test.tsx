import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { BenefitsSection } from '../components/BenefitsSection';
import { FAQSection } from '../components/FAQSection';
import { Footer } from '../components/Footer';
import { LeadForm } from '../components/LeadForm';

describe('Frontend Component Tests', () => {
  it('Navbar renders brand logo and demo badge', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText(/Orange/i)).toBeInTheDocument();
    expect(screen.getByText(/Care/i)).toBeInTheDocument();
    expect(screen.getByText(/โครงการตัวอย่าง/i)).toBeInTheDocument();
    expect(screen.getByText(/ตัวอย่างระบบประกันภัย/i)).toBeInTheDocument();
  });

  it('Navbar opens and closes accessible mobile navigation', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const openButton = screen.getByRole('button', { name: 'เปิดเมนูนำทาง' });
    expect(openButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(openButton);

    expect(screen.getByRole('navigation', { name: 'เมนูมือถือ' })).toBeInTheDocument();
    const closeButton = screen.getByRole('button', { name: 'ปิดเมนูนำทาง' });
    expect(closeButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(closeButton);
    expect(screen.queryByRole('navigation', { name: 'เมนูมือถือ' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'เปิดเมนูนำทาง' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('navigation', { name: 'เมนูมือถือ' })).not.toBeInTheDocument();
  });

  it('HeroSection renders Thai headline and CTA buttons', () => {
    const handleConsult = vi.fn();
    const handleExplore = vi.fn();

    render(
      <HeroSection
        onConsultClick={handleConsult}
        onExplorePlansClick={handleExplore}
      />
    );

    expect(screen.getByText(/เลือกประกันอย่างมั่นใจ/i)).toBeInTheDocument();
    const consultBtn = screen.getByRole('button', { name: /รับคำปรึกษา/i });
    expect(consultBtn).toBeInTheDocument();
    fireEvent.click(consultBtn);
    expect(handleConsult).toHaveBeenCalledTimes(1);
  });

  it('BenefitsSection renders sample benefits', () => {
    render(<BenefitsSection />);
    expect(screen.getByText(/ทำไมต้องเริ่มต้นวางแผนความคุ้มครองกับเรา/i)).toBeInTheDocument();
    expect(screen.getByText(/ยื่นคำขอสะดวกผ่านออนไลน์/i)).toBeInTheDocument();
  });

  it('FAQSection toggles accordion item', () => {
    render(<FAQSection />);
    // Item 0 is open by default
    expect(screen.getByText(/OrangeCare Insurance Demo/i)).toBeInTheDocument();

    // Second question is closed
    const secondQuestion = screen.getByText(/ข้อมูลแผนประกันภัยและเบี้ยประกันที่แสดงเป็นของจริงหรือไม่/i);
    expect(secondQuestion).toBeInTheDocument();

    // Click second question to expand it
    fireEvent.click(secondQuestion);
    expect(screen.getByText(/ข้อมูลทั้งหมดเป็นข้อมูลสมมติ \(ข้อมูลตัวอย่าง\)/i)).toBeInTheDocument();
  });

  it('LeadForm validates required fields before submitting', async () => {
    render(<LeadForm />);
    const submitBtn = screen.getByRole('button', { name: /ส่งคำขอรับคำปรึกษาฟรี/i });
    
    // Click submit without entering values
    fireEvent.click(submitBtn);

    // Should show validation error messages
    expect(await screen.findByText(/กรุณาระบุชื่อ-นามสกุล/i)).toBeInTheDocument();
  });

  it('Footer renders prominent demo disclaimer', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByText(/ข้อความปฏิเสธความรับผิดชอบ:/i)).toBeInTheDocument();
  });
});

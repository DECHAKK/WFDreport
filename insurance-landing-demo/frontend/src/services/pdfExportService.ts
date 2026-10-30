/**
 * PDF and Image Export Service for Insurance Quotations
 * Uses jsPDF and HTML5 Canvas to render high-resolution Thai quotation documents
 */
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { QuoteCalculationResult, AGENT_CONTACT_INFO } from './quoteCalculationService';

export async function exportQuoteToPdf(elementId: string, quote: QuoteCalculationResult): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('ไม่พบข้อมูลเอกสารสำหรับการพิมพ์ PDF');
  }

  // Capture high-DPI canvas
  const canvas = await html2canvas(element, {
    scale: 2, // 2x for sharp retina text
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png');

  // Create A4 PDF (portrait)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Calculate scaled height to fit or multi-page
  const ratio = canvasWidth / (pdfWidth - 10);
  const imgHeight = canvasHeight / ratio;

  if (imgHeight <= pdfHeight - 10) {
    // Single page fit
    pdf.addImage(imgData, 'PNG', 5, 5, pdfWidth - 10, imgHeight);
  } else {
    // Multi-page slicing
    let heightLeft = imgHeight;
    let position = 5;

    pdf.addImage(imgData, 'PNG', 5, position, pdfWidth - 10, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 5, position, pdfWidth - 10, imgHeight);
      heightLeft -= pdfHeight;
    }
  }

  const filename = `ใบเสนอราคา_${quote.plan.name.replace(/[^a-zA-Z0-9ก-๙]/g, '_')}_อายุ${quote.age}_${quote.quoteRef}.pdf`;
  pdf.save(filename);
}

/**
 * Generate and download Quote as PNG image (similar to GAS app canvas implementation)
 */
export async function exportQuoteToPng(elementId: string, quote: QuoteCalculationResult): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('ไม่พบข้อมูลเอกสารสำหรับการบันทึกภาพ');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `ใบเสนอราคา_${quote.plan.name.replace(/[^a-zA-Z0-9ก-๙]/g, '_')}_อายุ${quote.age}_${quote.quoteRef}.png`;
  link.href = image;
  link.click();
}

/**
 * Copy text summary to clipboard
 */
export function copyQuoteTextToClipboard(quote: QuoteCalculationResult): Promise<void> {
  const formatBaht = (n: number) => n.toLocaleString('th-TH') + ' บาท';

  const lines = [
    `📄 สรุปผลคำนวณเบี้ยประกัน OrangeCare • ${quote.plan.name}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `👤 ข้อมูลผู้ขอเอาประกัน:`,
    `• เพศ: ${quote.gender === 'F' ? 'หญิง' : 'ชาย'} | อายุ: ${quote.age} ปี`,
    `• แผนประกัน: ${quote.plan.name}`,
    `• ทุนประกันชีวิตหลัก: ${formatBaht(quote.lifeCover)}`,
    quote.ciCover > 0 ? `• ทุนประกันโรคร้ายแรง CI50: ${formatBaht(quote.ciCover)}` : '',
    `• ระยะเวลาชำระเบี้ย: ชำระ ${quote.paymentYears === 90 ? 'ถึงอายุ 90 ปี' : quote.paymentYears + ' ปี'} (คุ้มครองถึงอายุ ${quote.coverageYears} ปี)`,
    ``,
    `💰 เบี้ยประกันตามงวดชำระ:`,
    `• รายปี: ${formatBaht(quote.annual)}`,
    quote.semiAnnualAvailable ? `• ราย 6 เดือน: ${formatBaht(quote.semiAnnual)}` : `• ราย 6 เดือน: - (ต่ำกว่าเกณฑ์ขั้นต่ำ 2,000 บ.)`,
    quote.quarterlyAvailable ? `• ราย 3 เดือน: ${formatBaht(quote.quarterly)}` : `• ราย 3 เดือน: - (ต่ำกว่าเกณฑ์ขั้นต่ำ 2,000 บ.)`,
    quote.monthlyAvailable ? `• รายเดือน: ${formatBaht(quote.monthly)}` : `• รายเดือน: - (ต่ำกว่าเกณฑ์ขั้นต่ำ 500 บ.)`,
    ``,
    `🎯 สรุปผลประโยชน์ความคุ้มครอง:`,
    `1. ความคุ้มครองชีวิตกรณีเสียชีวิตทุกกรณี: ${formatBaht(quote.totalDeathBenefit)}`,
    quote.plan.hasCashback ? `2. เงินคืนทุกปี 1%: ${formatBaht(quote.annualCashbackAmount)}/ปี (จ่ายสิ้นปีกรมธรรม์ 1-${quote.coverageYears})` : '',
    `3. เงินครบกำหนดสัญญา: ${formatBaht(quote.maturityBenefit)}`,
    quote.ciCover > 0 ? [
      `4. สัญญาเพิ่มเติม 50 โรคร้ายแรง CI50:`,
      `   - ตรวจพบ 5 โรคร้ายระยะเริ่มต้น: ${formatBaht(quote.ciCover * 0.20)} (20%)`,
      `   - โรคร้ายลุกลามขั้นรุนแรง: ${formatBaht(quote.ciCover * 0.80)} (80%)`,
      `   - ตรวจพบ 45 โรคร้ายแรงครั้งแรก: ${formatBaht(quote.ciCover)} (100%)`,
    ].join('\n') : '',
    ``,
    `💳 โปรโมชั่นบัตรเครดิต: ผ่อน 0% นาน 3-4 เดือน (SCB, ttb, Krungsri First Choice)`,
    `📅 วันที่คำนวณ: ${quote.quoteDate} (Ref: ${quote.quoteRef})`,
    `📞 ที่ปรึกษาการเงิน: ${AGENT_CONTACT_INFO[0].name} โทร 087-561-5690`,
    `* ข้อมูลตัวอย่างเพื่อการวางแผนประกันเบื้องต้น อัตราเบี้ยเป็นไปตามเงื่อนไขของบริษัท`,
  ].filter(line => line !== null && line !== undefined && line !== '');

  const text = lines.join('\n');
  return navigator.clipboard.writeText(text);
}

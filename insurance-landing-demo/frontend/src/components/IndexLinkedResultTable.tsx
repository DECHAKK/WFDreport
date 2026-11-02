import React from 'react';
import type { IndexLinkedQuote } from '../types';

interface IndexLinkedResultTableProps {
  quote: IndexLinkedQuote;
}

const formatNumber = (value: number): string =>
  value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

/**
 * Single page benefit projection table that mirrors the layout of a Thai
 * index linked savings quotation ("ตารางแสดงผลประโยชน์") with one extra
 * column for the 8% index growth scenario.
 */
export const IndexLinkedResultTable: React.FC<IndexLinkedResultTableProps> = ({ quote }) => {
  const scenarios = quote.scenarios;
  const splitYear = quote.plan.ngSplitYear;

  const totalGuaranteedPercent = quote.sumAssured > 0
    ? (quote.totalGuaranteedBenefit / quote.sumAssured) * 100
    : 0;

  return (
    <div
      id="printable-index-linked-document"
      className="bg-white rounded-3xl border border-orange-100 shadow-xl overflow-hidden"
    >
      {/* Document header */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-4 py-3 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-100">
              ตารางแสดงผลประโยชน์
            </p>
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight">{quote.plan.planName}</h3>
          </div>
          <div className="text-[10px] sm:text-[11px] sm:text-right text-orange-50 leading-relaxed">
            <p>ผู้เอาประกัน: เพศ{quote.gender === 'F' ? 'หญิง' : 'ชาย'} | อายุ {quote.age} ปี</p>
            <p>
              ทุนประกันภัย {formatNumber(quote.sumAssured)} บาท • คุ้มครอง {quote.plan.coverageYears} ปี •
              ชำระเบี้ย {quote.plan.paymentYears} ปี
            </p>
          </div>
        </div>
      </div>

      {/* Projection table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-[11px] leading-tight">
          <thead>
            <tr className="bg-orange-50 text-gray-700">
              <th rowSpan={2} className="border border-orange-100 px-1.5 py-1.5 font-bold">ปีที่</th>
              <th rowSpan={2} className="border border-orange-100 px-1.5 py-1.5 font-bold">
                เบี้ยประกันภัย<br />ต่อปี (บาท)
              </th>
              <th rowSpan={2} className="border border-orange-100 px-1.5 py-1.5 font-bold">
                เบี้ยประกันภัย<br />สะสม (บาท)
              </th>
              <th colSpan={2} className="border border-orange-100 px-1.5 py-1.5 font-bold">
                เงินคืนแบบรับรองการจ่าย<br />(ณ วันครบรอบปีกรมธรรม์)
              </th>
              <th colSpan={scenarios.length} className="border border-orange-100 px-1.5 py-1.5 font-bold">
                ผลประโยชน์ที่ไม่รับรองการจ่ายกรณีมีชีวิตอยู่ (ถ้ามี)
                <br />
                <span className="font-normal text-[10px]">
                  ตามระดับดัชนีอ้างอิงที่เปลี่ยนแปลง (% เฉลี่ยต่อปี)
                </span>
              </th>
              <th rowSpan={2} className="border border-orange-100 px-1.5 py-1.5 font-bold">
                ผลประโยชน์<br />กรณีเสียชีวิต (บาท)
              </th>
              <th rowSpan={2} className="border border-orange-100 px-1.5 py-1.5 font-bold">
                เงินค่าเวนคืน<br />(ณ สิ้นปีกรมธรรม์)
              </th>
            </tr>
            <tr className="bg-orange-50 text-gray-600">
              <th className="border border-orange-100 px-1.5 py-1 font-semibold">% ของทุนประกันภัย</th>
              <th className="border border-orange-100 px-1.5 py-1 font-semibold">จำนวนเงิน (บาท)</th>
              {scenarios.map((scenario) => (
                <th
                  key={scenario.scenarioCode}
                  className="border border-orange-100 px-1.5 py-1 font-semibold text-emerald-700"
                >
                  {scenario.annualIndexChangePercent}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quote.rows.map((row) => {
              const isSplitYear = row.policyYear === splitYear;
              const isMaturityYear = row.policyYear === quote.plan.coverageYears;
              const highlight = isSplitYear || isMaturityYear;

              return (
                <tr
                  key={row.policyYear}
                  className={highlight ? 'bg-amber-50/70 font-semibold' : 'odd:bg-white even:bg-gray-50/60'}
                >
                  <td className="border border-orange-100 px-1.5 py-1 text-center">{row.policyYear}</td>
                  <td className="border border-orange-100 px-1.5 py-1 text-right">
                    {row.annualPremium > 0 ? formatNumber(row.annualPremium) : '-'}
                  </td>
                  <td className="border border-orange-100 px-1.5 py-1 text-right">
                    {formatNumber(row.cumulativePremium)}
                  </td>
                  <td className="border border-orange-100 px-1.5 py-1 text-center">
                    {formatPercent(row.guaranteedPercent)}
                  </td>
                  <td className="border border-orange-100 px-1.5 py-1 text-right">
                    {formatNumber(row.guaranteedAmount)}
                  </td>
                  {scenarios.map((scenario) => {
                    const amount = row.nonGuaranteed[scenario.scenarioCode] ?? 0;
                    return (
                      <td
                        key={scenario.scenarioCode}
                        className={`border border-orange-100 px-1.5 py-1 text-right ${
                          amount > 0 ? 'text-emerald-700 font-semibold' : 'text-gray-400'
                        }`}
                      >
                        {amount > 0 ? formatNumber(amount) : '-'}
                      </td>
                    );
                  })}
                  <td className="border border-orange-100 px-1.5 py-1 text-right">
                    {formatNumber(row.deathBenefit)}
                  </td>
                  <td className="border border-orange-100 px-1.5 py-1 text-right">
                    {formatNumber(row.cashValue)}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-brand-500 text-white font-bold">
              <td className="border border-brand-400 px-1.5 py-1.5 text-center" colSpan={2}>รวม</td>
              <td className="border border-brand-400 px-1.5 py-1.5 text-right">
                {formatNumber(quote.totalPremium)}
              </td>
              <td className="border border-brand-400 px-1.5 py-1.5 text-center">
                {formatPercent(totalGuaranteedPercent)}
              </td>
              <td className="border border-brand-400 px-1.5 py-1.5 text-right">
                {formatNumber(quote.totalGuaranteedBenefit)}
              </td>
              {scenarios.map((scenario) => (
                <td key={scenario.scenarioCode} className="border border-brand-400 px-1.5 py-1.5 text-right">
                  {scenario.totalNonGuaranteed > 0 ? formatNumber(scenario.totalNonGuaranteed) : '-'}
                </td>
              ))}
              <td className="border border-brand-400 px-1.5 py-1.5 text-center">-</td>
              <td className="border border-brand-400 px-1.5 py-1.5 text-center">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals summary — same block as the bottom of the quotation table */}
      <div className="px-3 py-3 border-t border-orange-100">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="border border-orange-100 px-2 py-1.5 text-left font-semibold">รายการ</th>
              {scenarios.map((scenario) => (
                <th key={scenario.scenarioCode} className="border border-orange-100 px-2 py-1.5 text-center font-semibold">
                  {scenario.annualIndexChangePercent}%
                </th>
              ))}
              <th className="border border-orange-100 px-2 py-1.5 text-center font-semibold">หน่วย</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-orange-100 px-2 py-1.5">
                ผลประโยชน์แบบรับรองการจ่ายรวมตลอดสัญญา
              </td>
              {scenarios.map((scenario) => (
                <td key={scenario.scenarioCode} className="border border-orange-100 px-2 py-1.5 text-right">
                  {formatNumber(quote.totalGuaranteedBenefit)}
                </td>
              ))}
              <td className="border border-orange-100 px-2 py-1.5 text-center text-gray-500">บาท</td>
            </tr>
            <tr>
              <td className="border border-orange-100 px-2 py-1.5">
                รวมโอกาสรับผลประโยชน์ที่ไม่รับรองการจ่ายกรณีมีชีวิตอยู่
              </td>
              {scenarios.map((scenario) => (
                <td key={scenario.scenarioCode} className="border border-orange-100 px-2 py-1.5 text-right">
                  {scenario.totalNonGuaranteed > 0 ? formatNumber(scenario.totalNonGuaranteed) : '-'}
                </td>
              ))}
              <td className="border border-orange-100 px-2 py-1.5 text-center text-gray-500">บาท</td>
            </tr>
            <tr>
              <td className="border border-orange-100 px-2 py-1.5">หัก เบี้ยประกันชีวิตตลอดสัญญา</td>
              {scenarios.map((scenario) => (
                <td key={scenario.scenarioCode} className="border border-orange-100 px-2 py-1.5 text-right">
                  {formatNumber(quote.totalPremium)}
                </td>
              ))}
              <td className="border border-orange-100 px-2 py-1.5 text-center text-gray-500">บาท</td>
            </tr>
            <tr className="bg-amber-50 font-bold">
              <td className="border border-orange-100 px-2 py-1.5">
                รวมรับผลประโยชน์ตลอดสัญญา (รวมผลประโยชน์ที่ไม่รับรองการจ่าย)
              </td>
              {scenarios.map((scenario) => (
                <td key={scenario.scenarioCode} className="border border-orange-100 px-2 py-1.5 text-right">
                  {formatNumber(scenario.totalBenefit)}
                </td>
              ))}
              <td className="border border-orange-100 px-2 py-1.5 text-center text-gray-500">บาท</td>
            </tr>
            <tr>
              <td className="border border-orange-100 px-2 py-1.5">
                อัตราผลตอบแทนเฉลี่ยต่อปี (IRR) สำหรับการชำระเบี้ยประกันแบบรายปี
              </td>
              {scenarios.map((scenario) => (
                <td key={scenario.scenarioCode} className="border border-orange-100 px-2 py-1.5 text-right font-bold text-brand-700">
                  {scenario.irrPercent.toFixed(2)}%
                </td>
              ))}
              <td className="border border-orange-100 px-2 py-1.5 text-center text-gray-500">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Disclaimers */}
      <div className="bg-orange-50/70 px-4 py-3 text-[10px] leading-relaxed text-gray-600 space-y-1">
        <p>
          • ผลประโยชน์ที่ไม่รับรองการจ่ายขึ้นอยู่กับระดับดัชนีอ้างอิงและอัตราแลกเปลี่ยนจากดอลลาร์สหรัฐเป็นบาท
          โดยคำนวณจากสูตร 50% × เบี้ยประกันภัยที่ชำระมาแล้ว × PR × max(ระดับดัชนีปีที่จ่าย ÷ ระดับดัชนีวันแรก − 100%, 0)
          และมีค่าไม่ต่ำกว่าศูนย์ (PR = {quote.assumptions.participationRate}%)
        </p>
        <p>
          • ในกรณีที่แย่ที่สุดอาจไม่มีการจ่ายผลประโยชน์ที่ไม่รับรองการจ่าย ผู้เอาประกันภัยยังคงได้รับเงินคืนและเงินครบกำหนดสัญญา
          ตามที่รับรองไว้เต็มจำนวน • {quote.assumptions.exchangeRateAssumption}
        </p>
        <p>
          • ตารางนี้เป็นข้อมูลตัวอย่างเพื่อการวางแผนเบื้องต้น (DEMO DATA) ไม่ใช่ส่วนหนึ่งของสัญญาประกันภัย
          และไม่ใช่การชี้ชวนขายผลิตภัณฑ์จริง
        </p>
      </div>
    </div>
  );
};

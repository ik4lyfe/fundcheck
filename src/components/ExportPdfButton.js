'use client';

import { useState } from 'react';

function drawQualitativePage(doc, data, pageW, startY) {
  let y = startY;
  const meta = data || {};
  const criteria = meta.criteria || [];
  const scores = meta.scores || {};
  const total = meta.total || 0;
  const maxScore = meta.maxScore || 50;
  const notes = meta.notes || '';
  const label = meta.label || 'Section';

  // Section header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(label, 14, y);
  y += 8;

  doc.setDrawColor(200);
  doc.line(14, y, 200, y);
  y += 6;

  // Score summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(`Total Score: ${total} / ${maxScore}`, 14, y);
  y += 8;

  // Individual criteria with questions - each as a row with description
  const rows = criteria.map((c, i) => [
    { content: `${i + 1}. ${c.label}`, styles: { fontStyle: 'bold', fontSize: 8 } },
    { content: `${scores[i] || '-'}`, styles: { halign: 'center', fontSize: 9 } },
    { content: c.desc || '', styles: { fontSize: 7, textColor: [80, 80, 80] } },
  ]);

  doc.autoTable({
    startY: y,
    head: [['Criterion', 'Score', 'Question / Description']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 45, minCellHeight: 8 },
      1: { cellWidth: 15, halign: 'center', minCellHeight: 8 },
      2: { cellWidth: 120, minCellHeight: 8 },
    },
    margin: { left: 14, right: 14 },
    pageBreak: 'auto',
    rowPageBreak: 'avoid',
  });

  y = doc.lastAutoTable.finalY + 6;

  // Notes
  if (notes) {
    doc.setDrawColor(200);
    doc.line(14, y, 200, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30);
    doc.text('Notes:', 14, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    const splitNotes = doc.splitTextToSize(notes, 170);
    splitNotes.forEach(line => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 14, y);
      y += 4;
    });
    y += 2;
  }

  return y;
}

function drawQuantitativePage(doc, data, pageW, startY) {
  let y = startY;
  const d = data || {};
  const label = d.label || 'Quantitative';

  // Section header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(label, 14, y);
  y += 8;

  doc.setDrawColor(200);
  doc.line(14, y, 200, y);
  y += 6;

  // -- Key Market Stats (if available) --
  if (d.marketStats) {
    const ms = d.marketStats;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Market Statistics — Powered by TradingView', 14, y);
    y += 6;

    const statsRows = [
      ['Market Cap', ms.marketCap ? `RM ${Number(ms.marketCap).toFixed(1)}m` : '-'],
      ['P/E Ratio', ms.pe ? `${Number(ms.pe).toFixed(1)}x` : '-'],
      ['P/B Ratio', ms.pb ? `${Number(ms.pb).toFixed(2)}x` : '-'],
      ['ROE', ms.roe ? `${Number(ms.roe).toFixed(1)}%` : '-'],
      ['ROA', ms.roa ? `${Number(ms.roa).toFixed(1)}%` : '-'],
      ['Net Margin', ms.netMargin ? `${Number(ms.netMargin).toFixed(1)}%` : '-'],
      ['EBITDA', ms.ebitda ? `RM ${Number(ms.ebitda).toFixed(0)}m` : '-'],
      ['Free Cash Flow', ms.freeCashFlow ? `RM ${Number(ms.freeCashFlow).toFixed(0)}m` : '-'],
      ['Employees', ms.employees ? Number(ms.employees).toLocaleString() : '-'],
    ].filter(r => r[1] !== '-');

    if (statsRows.length > 0) {
      doc.autoTable({
        startY: y,
        head: [['Metric', 'Value']],
        body: statsRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 100, 180], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 50, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  // -- Step 1-2: Revenue & EPS --
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text('Step 1 & 2: Revenue & EPS Growth', 14, y);
  y += 6;

  const metrics1 = [
    { label: 'Revenue 5yr Ago', value: d.form?.rev5 || '-', unit: 'RM m' },
    { label: 'Revenue Current', value: d.form?.revCur || '-', unit: 'RM m' },
    { label: 'Revenue CAGR', value: d.revCagr != null ? `${d.revCagr.toFixed(2)}%` : '-', unit: '' },
    { label: 'EPS 5yr Ago', value: d.form?.eps5 || '-', unit: 'sen' },
    { label: 'EPS Current', value: d.form?.epsCur || '-', unit: 'sen' },
    { label: 'EPS CAGR', value: d.epsCagr != null ? `${d.epsCagr.toFixed(2)}%` : '-', unit: '' },
  ];

  doc.autoTable({
    startY: y,
    head: [['Metric', 'Value']],
    body: metrics1.map(m => [m.label, m.value]),
    theme: 'grid',
    headStyles: { fillColor: [60, 60, 60], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 6;

  // -- Step 3-5: OCF, Liquidity, Debt --
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Step 3-5: Cash Flow, Liquidity & Debt', 14, y);
  y += 6;

  const metrics2 = [
    { label: 'Positive OCF (Years)', value: d.form?.ocf || '-' },
    { label: 'Current Assets', value: d.form?.ca || '-' },
    { label: 'Current Liabilities', value: d.form?.cl || '-' },
    { label: 'Current Ratio', value: d.curRatio != null ? d.curRatio.toFixed(2) : '-' },
    { label: 'Total Liabilities', value: d.form?.tl || '-' },
    { label: 'Total Equity', value: d.form?.te || '-' },
    { label: 'D/E Ratio', value: d.deRatio != null ? d.deRatio.toFixed(2) : '-' },
  ];

  doc.autoTable({
    startY: y,
    head: [['Metric', 'Value']],
    body: metrics2.map(m => [m.label, m.value]),
    theme: 'grid',
    headStyles: { fillColor: [60, 60, 60], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 6;

  // -- Step 6-7: Dividend & Valuation --
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Step 6 & 7: Dividend & Valuation', 14, y);
  y += 6;

  const metrics3 = [
    { label: 'Dividend Per Share (DPS)', value: d.form?.dps || '-' },
    { label: 'Current Share Price', value: d.form?.price || '-' },
    { label: 'Dividend Yield', value: d.divYield != null ? `${d.divYield.toFixed(2)}%` : '-' },
    { label: 'Valuation Score (1-5)', value: d.valuation || '-' },
  ];

  doc.autoTable({
    startY: y,
    head: [['Metric', 'Value']],
    body: metrics3.map(m => [m.label, m.value]),
    theme: 'grid',
    headStyles: { fillColor: [60, 60, 60], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 6;

  // Notes
  if (d.notes) {
    doc.setDrawColor(200);
    doc.line(14, y, 200, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 14, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(d.notes, 170);
    splitNotes.forEach(line => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 14, y);
      y += 4;
    });
  }

  return y;
}

export default function ExportPdfButton({ stock, date, sections }) {
  const [exporting, setExporting] = useState(false);

  // Check if ALL 3 sections have data
  const biz = sections?.find(s => s.tab === 'business' || s.label === 'Qualitative — Business');
  const mgmt = sections?.find(s => s.tab === 'management' || s.label === 'Qualitative — Management');
  const quant = sections?.find(s => s.tab === 'quantitative' || s.label === 'Quantitative');

  const bizComplete = biz && biz.allRated && biz.total > 0;
  const mgmtComplete = mgmt && mgmt.allRated && mgmt.total > 0;
  const quantHasData = quant && Object.values(quant.form || {}).some(v => v !== '' && v !== undefined && v !== null);
  const allComplete = stock && bizComplete && mgmtComplete && quantHasData;

  async function handleExport() {
    if (!allComplete) return;
    setExporting(true);

    try {
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageW = 190;

      // ===== PAGE 1: COVER =====
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30);
      doc.text('Fundamental Analysis Report', pageW / 2, 60, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text('Based on WealthFort International Sdn. Bhd. checklists', pageW / 2, 68, { align: 'center' });

      doc.setDrawColor(200);
      doc.line(50, 75, 160, 75);

      // Stock info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30);
      doc.text(stock, pageW / 2, 95, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Date of Review: ${date || '-'}`, pageW / 2, 105, { align: 'center' });
      doc.text(`Report Generated: ${new Date().toLocaleDateString('en-MY', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })}`, pageW / 2, 113, { align: 'center' });

      // Section indicators
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text(`✓ Business Analysis (${biz ? `${biz.total}/50` : 'Incomplete'})`, pageW / 2, 135, { align: 'center' });
      doc.text(`✓ Management Analysis (${mgmt ? `${mgmt.total}/50` : 'Incomplete'})`, pageW / 2, 143, { align: 'center' });
      doc.text(`✓ Quantitative Financial Health Check`, pageW / 2, 151, { align: 'center' });

      // ===== PAGE 2: BUSINESS =====
      doc.addPage();
      let y = 20;
      y = drawQualitativePage(doc, biz, pageW, y);

      // ===== PAGE 3: MANAGEMENT =====
      doc.addPage();
      y = 20;
      y = drawQualitativePage(doc, mgmt, pageW, y);

      // ===== PAGE 4+: QUANTITATIVE =====
      doc.addPage();
      y = 20;
      y = drawQuantitativePage(doc, quant, pageW, y);

      // ===== FOOTERS =====
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150);
        doc.text(
          'Built by Zahiruddin Zaki · Based on WealthFort checklists',
          pageW / 2,
          285,
          { align: 'center' }
        );
        doc.setFontSize(7);
        doc.setTextColor(180);
        doc.text(`Page ${i} of ${pageCount}`, pageW / 2, 292, { align: 'center' });
        doc.setTextColor(0);
      }

      const filename = `${stock}_Full_Report_${date || 'review'}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF export error:', err);
    }

    setExporting(false);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={!allComplete || exporting}
      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
        allComplete
          ? 'bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-200'
          : 'border border-gray-300 dark:border-gray-600 dark:text-gray-500 cursor-not-allowed'
      }`}
    >
      {exporting
        ? '⏳ Generating Full Report...'
        : allComplete
          ? '📄 Export Full Report'
          : '📄 Complete all 3 sections to export'}
    </button>
  );
}

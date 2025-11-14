import { Disease } from "./diseasePredictor";
import { MedicineSafety } from "./safetyChecker";

export interface PDFReportData {
  userInfo?: {
    name?: string;
    email?: string;
  };
  assessment: {
    date: string;
    diseases: Disease[];
    safetyResults: MedicineSafety[];
    symptoms: string[];
    allergies: string[];
    currentMedications: string[];
  };
}

export async function generatePDFReport(data: PDFReportData): Promise<void> {
  // Create a simple HTML report that can be printed as PDF
  const htmlContent = generateHTMLReport(data);
  
  // Create a new window and print
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups to generate PDF.');
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

function generateHTMLReport(data: PDFReportData): string {
  const { userInfo, assessment } = data;
  const topDisease = assessment.diseases[0];
  const safeMeds = assessment.safetyResults.filter(m => m.isSafe);
  const unsafeMeds = assessment.safetyResults.filter(m => !m.isSafe);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Medical Assessment Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: #fff;
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header p {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section h2 {
      color: #2563eb;
      font-size: 20px;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }
    .info-label {
      font-weight: bold;
      color: #555;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin: 4px;
    }
    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }
    .badge-danger {
      background: #fee2e2;
      color: #991b1b;
    }
    .badge-info {
      background: #dbeafe;
      color: #1e40af;
    }
    .medication-list {
      margin-top: 10px;
    }
    .medication-item {
      padding: 12px;
      margin-bottom: 8px;
      border-left: 4px solid #2563eb;
      background: #f9fafb;
    }
    .medication-item.unsafe {
      border-left-color: #dc2626;
      background: #fef2f2;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .disclaimer {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      padding: 15px;
      border-radius: 8px;
      margin-top: 30px;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🩺 Medical Assessment Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
    ${userInfo ? `<p>Patient: ${userInfo.name || 'N/A'} | Email: ${userInfo.email || 'N/A'}</p>` : ''}
  </div>

  <div class="section">
    <h2>Assessment Summary</h2>
    <div class="info-grid">
      <div class="info-label">Assessment Date:</div>
      <div>${assessment.date}</div>
      <div class="info-label">Primary Condition:</div>
      <div><strong>${topDisease.name}</strong> <span class="badge badge-info">${topDisease.confidence}% confidence</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Reported Symptoms</h2>
    <div>
      ${assessment.symptoms.map(s => `<span class="badge badge-info">${s}</span>`).join('')}
    </div>
  </div>

  ${assessment.allergies.length > 0 ? `
  <div class="section">
    <h2>Known Allergies</h2>
    <div>
      ${assessment.allergies.map(a => `<span class="badge badge-danger">${a}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  ${assessment.currentMedications.length > 0 ? `
  <div class="section">
    <h2>Current Medications</h2>
    <div>
      ${assessment.currentMedications.map(m => `<span class="badge badge-info">${m}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  <div class="section">
    <h2>Predicted Conditions</h2>
    ${assessment.diseases.map((disease, idx) => `
      <div style="margin-bottom: 15px; padding: 15px; background: ${idx === 0 ? '#eff6ff' : '#f9fafb'}; border-radius: 8px;">
        <strong>${disease.name}</strong>
        <span class="badge badge-info">${disease.confidence}% confidence</span>
        <div style="margin-top: 8px; font-size: 14px; color: #666;">
          Associated symptoms: ${disease.symptoms.slice(0, 5).join(', ')}${disease.symptoms.length > 5 ? '...' : ''}
        </div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>Medication Recommendations</h2>
    ${safeMeds.length > 0 ? `
      <h3 style="color: #059669; font-size: 16px; margin: 15px 0 10px 0;">✅ Safe Medications</h3>
      <div class="medication-list">
        ${safeMeds.map(med => `
          <div class="medication-item">
            <strong>${med.medicine}</strong> - ${med.category}
            <div style="margin-top: 5px; font-size: 14px; color: #666;">
              ${med.reason} | Estimated cost: $${med.price.toFixed(2)}
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    ${unsafeMeds.length > 0 ? `
      <h3 style="color: #dc2626; font-size: 16px; margin: 15px 0 10px 0;">⚠️ Medications with Warnings</h3>
      <div class="medication-list">
        ${unsafeMeds.map(med => `
          <div class="medication-item unsafe">
            <strong>${med.medicine}</strong> - ${med.category}
            <div style="margin-top: 5px; font-size: 14px; color: #991b1b;">
              ${med.reason} | Estimated cost: $${med.price.toFixed(2)}
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}
  </div>

  <div class="disclaimer">
    <strong>⚠️ Medical Disclaimer:</strong> This report is generated for educational purposes only. 
    It is not a substitute for professional medical advice, diagnosis, or treatment. 
    Always seek the advice of qualified healthcare providers with any questions you may have regarding a medical condition. 
    Never disregard professional medical advice or delay in seeking it because of information in this report.
  </div>

  <div class="footer">
    <p>This report was generated by AI Medical Assistant</p>
    <p>For questions or concerns, please consult with a qualified healthcare professional.</p>
  </div>
</body>
</html>
  `;
}


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CarbonData {
  fuel: number;
  electricity: number;
  travel: number;
  waste: number;
}

export interface CarbonResults {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export const calculateFootprint = (data: CarbonData): CarbonResults => {
  // Mock factors based on standard averages
  const factors = {
    fuel: 2.68, // kg CO2e per liter (Diesel avg)
    electricity: 0.42, // kg CO2e per kWh (Grid avg)
    travel: 0.15, // kg CO2e per km (Avg car)
    waste: 0.5, // kg CO2e per kg (Mixed waste)
  };

  const scope1 = (data.fuel || 0) * factors.fuel;
  const scope2 = (data.electricity || 0) * factors.electricity;
  const scope3 = ((data.travel || 0) * factors.travel) + ((data.waste || 0) * factors.waste);
  
  return {
    scope1,
    scope2,
    scope3,
    total: scope1 + scope2 + scope3
  };
};

export const generatePDF = (data: CarbonData, results: CarbonResults) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(46, 125, 50); // Forest Green
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("EcoTrack", 14, 25);
  doc.setFontSize(12);
  doc.text("Carbon Footprint Report", 14, 33);
  
  // Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 50);
  doc.text("Methodology: ISO 14064-1 Compliant Mockup", 14, 55);
  
  // Results Summary
  doc.setFontSize(14);
  doc.text("Results Summary", 14, 70);
  
  autoTable(doc, {
    startY: 75,
    head: [['Category', 'Input', 'Emissions (kg CO2e)']],
    body: [
      ['Scope 1: Direct Emissions (Fuel)', `${data.fuel || 0} L`, results.scope1.toFixed(2)],
      ['Scope 2: Indirect Emissions (Electricity)', `${data.electricity || 0} kWh`, results.scope2.toFixed(2)],
      ['Scope 3: Value Chain (Travel/Waste)', `${data.travel || 0} km / ${data.waste || 0} kg`, results.scope3.toFixed(2)],
      [{ content: 'TOTAL FOOTPRINT', styles: { fontStyle: 'bold' } }, '', { content: results.total.toFixed(2), styles: { fontStyle: 'bold' } }],
    ],
    headStyles: { fillColor: [46, 125, 50] },
    theme: 'grid'
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text('EcoTrack - Sustainable Future', 14, 285);
    doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
  }
  
  doc.save("ecotrack-report.pdf");
};
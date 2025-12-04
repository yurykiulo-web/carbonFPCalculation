import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Enums from backend
export enum FuelType {
  NATURAL_GAS = "Natural Gas",
  HEATING_OIL = "Heating Oil",
  DIESEL = "Diesel",
  PETROL = "Petrol",
  COAL = "Coal",
  ELECTRICITY = "Electricity",
}

export enum Unit {
  M3 = "m3",
  LITERS = "l",
  TONNES = "t",
  KWH = "kWh",
  KM = "km",
}

export enum RefrigerantType {
  R407C = "R407C",
  R32 = "R32",
  R410A = "R410A",
  CUSTOM = "Custom",
}

// Scope 1 Inputs
export interface CombustionInput {
  source: string;
  fuel_type: FuelType;
  unit: Unit;
  amount: number;
  calorific_value_mj_kg?: number;
  density_kg_l?: number;
  distance_km?: number;
  vehicle_type?: string;
  emission_factor_co2_kg_gj?: number;
  emission_factor_ch4_kg_gj?: number;
  emission_factor_n2o_kg_gj?: number;
}

export interface FugitiveEmissionInput {
  source: string;
  refrigerant_type: RefrigerantType;
  amount_kg: number;
  gwp_factor?: number;
}

export interface Scope1CalculationInput {
  combustion_emissions: CombustionInput[];
  fugitive_emissions: FugitiveEmissionInput[];
}

// Scope 2 Inputs
export interface ElectricityInput {
  amount_kwh: number;
}

export interface HeatingInput {
  amount_gj: number;
}

export interface Scope2CalculationInput {
  electricity?: ElectricityInput;
  district_heating?: HeatingInput;
}

// Scope 3 Inputs
export interface WaterSupplyInput {
  volume_m3: number;
}

export interface PaperUsageInput {
  mass_kg: number;
  eco_labeled: boolean;
}

export interface SolidWasteDisposalInput {
  mass_kg: number;
}

export interface WastewaterTreatmentInput {
  volume_m3: number;
}

export interface AirTravelInput {
  distance_km: number;
  flight_class?: string;
}

export interface RailTravelInput {
  distance_km: number;
}

export interface TaxiBusTravelInput {
  distance_km: number;
  vehicle_type: string;
}

export interface Scope3CalculationInput {
  purchased_goods_services: (WaterSupplyInput | PaperUsageInput)[];
  waste_generated: (SolidWasteDisposalInput | WastewaterTreatmentInput)[];
  business_travel: (AirTravelInput | RailTravelInput | TaxiBusTravelInput)[];
}

// Backend Output Interfaces
export interface EmissionResult {
  source: string;
  fuel_type?: FuelType;
  refrigerant_type?: RefrigerantType;
  co2e: number;
  details: { [key: string]: number };
}

export interface Scope1Output {
  total_co2e: number;
  breakdown: EmissionResult[];
}

export interface Scope2Output {
  total_co2_emissions: number;
  breakdown: { [key: string]: number };
}

export interface Scope3Output {
  total_co2e_emissions: number;
  breakdown: { [key: string]: { [key: string]: number } };
}

// Combined Frontend CarbonData (simplified for UI, will be converted to backend models)
export interface CarbonData {
  // Scope 1
  s1_fuel_type?: FuelType;
  s1_fuel_amount?: number;
  s1_fuel_unit?: Unit;
  s1_refrigerant_type?: RefrigerantType;
  s1_refrigerant_amount_kg?: number;
  
  // Scope 2
  s2_electricity_kwh?: number;
  s2_heating_gj?: number;

  // Scope 3
  s3_water_m3?: number;
  s3_paper_kg?: number;
  s3_paper_eco_labeled?: boolean;
  s3_solid_waste_kg?: number;
  s3_wastewater_m3?: number;
  s3_air_travel_km?: number;
  s3_air_travel_class?: string;
  s3_rail_travel_km?: number;
  s3_taxi_bus_travel_km?: number;
  s3_taxi_bus_vehicle_type?: string;
}

// Frontend CarbonResults (simplified aggregate)
export interface CarbonResults {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  scope1_breakdown?: EmissionResult[];
  scope2_breakdown?: { [key: string]: number };
  scope3_breakdown?: { [key: string]: { [key: string]: number } };
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"; // Assuming FastAPI runs on 8000

async function authenticatedFetch(url: string, method: string, data?: any): Promise<Response> {
  const token = localStorage.getItem("token"); // Changed from "access_token" to "token"
  console.log("Token from localStorage:", token); // Add this line for debugging
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method: method,
    headers: headers,
  };
  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options);
}

export const calculateFootprint = async (formData: CarbonData): Promise<CarbonResults> => {
  let scope1Total = 0;
  let scope2Total = 0;
  let scope3Total = 0;
  let scope1Breakdown: EmissionResult[] = [];
  let scope2Breakdown: { [key: string]: number } = {};
  let scope3Breakdown: { [key: string]: { [key: string]: number } } = {};

  // --- Scope 1 Calculation ---
  const scope1Inputs: Scope1CalculationInput = {
    combustion_emissions: [],
    fugitive_emissions: []
  };

  if (formData.s1_fuel_amount && formData.s1_fuel_type && formData.s1_fuel_unit) {
    scope1Inputs.combustion_emissions.push({
      source: "User Input - Fuel",
      fuel_type: formData.s1_fuel_type,
      unit: formData.s1_fuel_unit,
      amount: formData.s1_fuel_amount,
    });
  }
  if (formData.s1_refrigerant_amount_kg && formData.s1_refrigerant_type) {
    scope1Inputs.fugitive_emissions.push({
      source: "User Input - Refrigerant",
      refrigerant_type: formData.s1_refrigerant_type,
      amount_kg: formData.s1_refrigerant_amount_kg,
    });
  }
  

  if (scope1Inputs.combustion_emissions.length > 0 || scope1Inputs.fugitive_emissions.length > 0) {
    const response = await authenticatedFetch(`${BACKEND_URL}/api/calculate/scope1`, "POST", scope1Inputs);
    if (response.ok) {
      const result: Scope1Output = await response.json();
      scope1Total = result.total_co2e;
      scope1Breakdown = result.breakdown;
    } else {
      const errorData = await response.json();
      throw new Error(`Scope 1 Calculation Failed: ${errorData.detail}`);
    }
  }

  // --- Scope 2 Calculation ---
  const scope2Inputs: Scope2CalculationInput = {};
  if (formData.s2_electricity_kwh) {
    scope2Inputs.electricity = { amount_kwh: formData.s2_electricity_kwh };
  }
  if (formData.s2_heating_gj) {
    scope2Inputs.district_heating = { amount_gj: formData.s2_heating_gj };
  }

  if (scope2Inputs.electricity || scope2Inputs.district_heating) {
    const response = await authenticatedFetch(`${BACKEND_URL}/api/calculate/scope2`, "POST", scope2Inputs);
    if (response.ok) {
      const result: Scope2Output = await response.json();
      scope2Total = result.total_co2_emissions;
      scope2Breakdown = result.breakdown;
    } else {
      const errorData = await response.json();
      throw new Error(`Scope 2 Calculation Failed: ${errorData.detail}`);
    }
  }

  // --- Scope 3 Calculation ---
  const scope3Inputs: Scope3CalculationInput = {
    purchased_goods_services: [],
    waste_generated: [],
    business_travel: []
  };

  if (formData.s3_water_m3) {
    scope3Inputs.purchased_goods_services.push({ volume_m3: formData.s3_water_m3 });
  }
  if (formData.s3_paper_kg) {
    scope3Inputs.purchased_goods_services.push({
      mass_kg: formData.s3_paper_kg,
      eco_labeled: formData.s3_paper_eco_labeled || false,
    });
  }
  if (formData.s3_solid_waste_kg) {
    scope3Inputs.waste_generated.push({ mass_kg: formData.s3_solid_waste_kg });
  }
  if (formData.s3_wastewater_m3) {
    scope3Inputs.waste_generated.push({ volume_m3: formData.s3_wastewater_m3 });
  }
  if (formData.s3_air_travel_km) {
    scope3Inputs.business_travel.push({
      distance_km: formData.s3_air_travel_km,
      flight_class: formData.s3_air_travel_class,
    });
  }
  if (formData.s3_rail_travel_km) {
    scope3Inputs.business_travel.push({ distance_km: formData.s3_rail_travel_km });
  }
  if (formData.s3_taxi_bus_travel_km && formData.s3_taxi_bus_vehicle_type) {
    scope3Inputs.business_travel.push({
      distance_km: formData.s3_taxi_bus_travel_km,
      vehicle_type: formData.s3_taxi_bus_vehicle_type,
    });
  }


  if (
    scope3Inputs.purchased_goods_services.length > 0 ||
    scope3Inputs.waste_generated.length > 0 ||
    scope3Inputs.business_travel.length > 0
  ) {
    const response = await authenticatedFetch(`${BACKEND_URL}/api/calculate/scope3`, "POST", scope3Inputs);
    if (response.ok) {
      const result: Scope3Output = await response.json();
      scope3Total = result.total_co2e_emissions;
      scope3Breakdown = result.breakdown;
    } else {
      const errorData = await response.json();
      throw new Error(`Scope 3 Calculation Failed: ${errorData.detail}`);
    }
  }

  return {
    scope1: scope1Total,
    scope2: scope2Total,
    scope3: scope3Total,
    total: scope1Total + scope2Total + scope3Total,
    scope1_breakdown: scope1Breakdown,
    scope2_breakdown: scope2Breakdown,
    scope3_breakdown: scope3Breakdown,
  };
};

// PDF generation will remain mostly the same, but will need to be updated to use the new CarbonData and CarbonResults structure
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
    head: [['Category', 'Emissions (kg CO2e)']],
    body: [
      ['Scope 1: Direct Emissions', results.scope1.toFixed(2)],
      ['Scope 2: Indirect Emissions', results.scope2.toFixed(2)],
      ['Scope 3: Value Chain', results.scope3.toFixed(2)],
      [{ content: 'TOTAL FOOTPRINT', styles: { fontStyle: 'bold' } }, { content: results.total.toFixed(2), styles: { fontStyle: 'bold' } }],
    ],
    headStyles: { fillColor: [46, 125, 50] },
    theme: 'grid'
  });

  // Detailed breakdown for Scope 1
  if (results.scope1_breakdown && results.scope1_breakdown.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Scope 1 Detailed Breakdown", 14, 20);
    const scope1Body = results.scope1_breakdown.map(item => [
      `${item.source} (${item.fuel_type || item.refrigerant_type})`,
      item.co2e.toFixed(2)
    ]);
    autoTable(doc, {
      startY: 25,
      head: [['Source/Type', 'Emissions (kg CO2e)']],
      body: scope1Body,
      headStyles: { fillColor: [46, 125, 50] },
      theme: 'grid'
    });
  }

  // Detailed breakdown for Scope 2
  if (results.scope2_breakdown && Object.keys(results.scope2_breakdown).length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Scope 2 Detailed Breakdown", 14, 20);
    const scope2Body = Object.entries(results.scope2_breakdown).map(([key, value]) => [
      key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format key
      value.toFixed(2)
    ]);
    autoTable(doc, {
      startY: 25,
      head: [['Source/Type', 'Emissions (kg CO2e)']],
      body: scope2Body,
      headStyles: { fillColor: [46, 125, 50] },
      theme: 'grid'
    });
  }

  // Detailed breakdown for Scope 3
  if (results.scope3_breakdown && Object.keys(results.scope3_breakdown).length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Scope 3 Detailed Breakdown", 14, 20);
    
    let scope3Body: string[][] = [];
    for (const category in results.scope3_breakdown) {
      scope3Body.push([category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), '']); // Category name, empty for value
      for (const subCategory in results.scope3_breakdown[category]) {
        scope3Body.push([
          `  ${subCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          results.scope3_breakdown[category][subCategory].toFixed(2)
        ]);
      }
    }

    autoTable(doc, {
      startY: 25,
      head: [['Category/Source', 'Emissions (kg CO2e)']],
      body: scope3Body,
      headStyles: { fillColor: [46, 125, 50] },
      theme: 'grid'
    });
  }
  
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
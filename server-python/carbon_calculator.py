from typing import List, Optional, Dict, Union
from pydantic import BaseModel, Field

# --- Constants ---
# Global Warming Potentials (GWP)
GWP_CH4 = 28
GWP_N2O = 265

# Standard Densities (kg/l)
DENSITY_DIESEL = 0.82
DENSITY_PETROL = 0.72

# Default Calorific Values (MJ/kg) - These are illustrative, actual values vary
# and should ideally come from a database or more comprehensive source.
# For natural gas, calorific value is often per m3 or standard m3
CALORIFIC_VALUE_NATURAL_GAS_MJ_M3 = 38.0  # Example value, can be 37-39 MJ/m3
CALORIFIC_VALUE_HEATING_OIL_MJ_KG = 42.6  # Example value
CALORIFIC_VALUE_DIESEL_MJ_KG = 43.1  # Example value
CALORIFIC_VALUE_PETROL_MJ_KG = 44.3  # Example value
CALORIFIC_VALUE_COAL_MJ_KG = 24.0  # Example value for general coal

# Emission Factors (kg/GJ) - These are illustrative and need precise values from source document
# For demonstration, using placeholder values based on typical ranges.
# Actual values should be verified against EPA/DEFRA/IPCC.
# CO2 Emission Factors (kg/GJ)
EF_CO2_NATURAL_GAS = 56.1  # kg CO2 / GJ
EF_CO2_HEATING_OIL = 74.1  # kg CO2 / GJ (similar to diesel)
EF_CO2_DIESEL = 74.1  # kg CO2 / GJ
EF_CO2_PETROL = 69.3  # kg CO2 / GJ
EF_CO2_COAL = 94.6  # kg CO2 / GJ (based on hard coal)

# CH4 Emission Factors (kg/GJ) - Often much smaller
EF_CH4_NATURAL_GAS = 0.0001  # Example, needs specific source
EF_CH4_HEATING_OIL = 0.00003  # Example
EF_CH4_DIESEL = 0.00003  # Example
EF_CH4_PETROL = 0.00003  # Example
EF_CH4_COAL = 0.001  # Example

# N2O Emission Factors (kg/GJ) - Often much smaller
EF_N2O_NATURAL_GAS = 0.00002  # Example
EF_N2O_HEATING_OIL = 0.00006  # Example
EF_N2O_DIESEL = 0.00006  # Example
EF_N2O_PETROL = 0.00005  # Example
EF_N2O_COAL = 0.0001  # Example

# Refrigerant GWP Factors
GWP_R407C = 1624
GWP_R32 = 677
GWP_R410A = 1924

# Typical Fuel Consumption Figures (g/km) for Distance-based Fleet Calculation
# These are illustrative, actual values vary greatly by vehicle and driving conditions.
FUEL_CONSUMPTION_PASSENGER_CAR_DIESEL_G_KM = 60 # g/km, example


# --- Helper Functions ---
def convert_g_mmbtu_to_kg_gj(value_g_mmbtu: float) -> float:
    """Converts emission factor from g/mmBtu to kg/GJ."""
    # 1 mmBtu = 1.055 GJ
    # 1 kg = 1000 g
    # value_g_mmbtu (g/mmBtu) * (1 kg / 1000 g) * (1 mmBtu / 1.055 GJ) = kg/GJ
    return value_g_mmbtu / (1000 * 1.055)

def calculate_co2e(mass_co2: float, mass_ch4: float, mass_n2o: float) -> float:
    """Calculates CO2 equivalent from mass of CO2, CH4, and N2O."""
    return mass_co2 + (mass_ch4 * GWP_CH4) + (mass_n2o * GWP_N2O)

# --- Pydantic Models for Input and Output ---
class FuelType(str, BaseModel):
    NATURAL_GAS = "Natural Gas"
    HEATING_OIL = "Heating Oil"
    DIESEL = "Diesel"
    PETROL = "Petrol"
    COAL = "Coal"
    ELECTRICITY = "Electricity" # Although not in Scope 1 combustion, adding for completeness if needed later

class Unit(str, BaseModel):
    M3 = "m3"
    LITERS = "l"
    TONNES = "t"
    KWH = "kWh" # For electricity, if needed
    KM = "km" # For distance-based calculation

class CombustionInput(BaseModel):
    source: str = Field(..., description="Source of combustion, e.g., 'Heating', 'Generators', 'Fleet'")
    fuel_type: FuelType
    unit: Unit
    amount: float = Field(..., gt=0, description="Amount of fuel consumed")
    
    # Optional overrides for calorific value and density if not using standard defaults
    calorific_value_mj_kg: Optional[float] = Field(None, gt=0, description="Calorific Value in MJ/kg")
    density_kg_l: Optional[float] = Field(None, gt=0, description="Density in kg/l for liquid fuels")

    # Optional for Fleet Method 2 (Distance-based)
    distance_km: Optional[float] = Field(None, gt=0, description="Distance traveled in km for fleet (Method 2)")
    vehicle_type: Optional[str] = Field(None, description="Type of vehicle for fleet (Method 2), e.g., 'Passenger Car Diesel'")

    # Optional overrides for emission factors if not using standard defaults
    emission_factor_co2_kg_gj: Optional[float] = Field(None, gt=0, description="CO2 Emission Factor in kg/GJ")
    emission_factor_ch4_kg_gj: Optional[float] = Field(None, gt=0, description="CH4 Emission Factor in kg/GJ")
    emission_factor_n2o_kg_gj: Optional[float] = Field(None, gt=0, description="N2O Emission Factor in kg/GJ")

class RefrigerantType(str, BaseModel):
    R407C = "R407C"
    R32 = "R32"
    R410A = "R410A"
    CUSTOM = "Custom"

class FugitiveEmissionInput(BaseModel):
    source: str = Field(..., description="Source of fugitive emission, e.g., 'Refrigerants'")
    refrigerant_type: RefrigerantType
    amount_kg: float = Field(..., gt=0, description="Amount of refrigerant refilled in kg")
    gwp_factor: Optional[float] = Field(None, gt=0, description="Global Warming Potential factor (required for Custom type)")

class Scope1CalculationInput(BaseModel):
    combustion_emissions: List[CombustionInput] = Field(default_factory=list)
    fugitive_emissions: List[FugitiveEmissionInput] = Field(default_factory=list)

class EmissionResult(BaseModel):
    source: str
    fuel_type: Optional[FuelType] = None
    refrigerant_type: Optional[RefrigerantType] = None
    co2e: float
    details: Dict[str, float] = Field(default_factory=dict) # To store CO2, CH4, N2O mass and GJ values

class Scope1Output(BaseModel):
    total_co2e: float
    breakdown: List[EmissionResult] = Field(default_factory=list)

# --- Core Calculation Logic ---

def calculate_combustion_emissions(input_data: CombustionInput) -> EmissionResult:
    """Calculates CO2e for combustion activities (Heating, Generators, Fleet Method 1 & 2)."""
    energy_gj: float = 0.0
    mass_co2: float = 0.0
    mass_ch4: float = 0.0
    mass_n2o: float = 0.0

    # Determine Calorific Value and Density
    calorific_value_mj_kg = input_data.calorific_value_mj_kg
    density_kg_l = input_data.density_kg_l

    if input_data.unit == Unit.LITERS: # Liquid Fuels (Heating Oil, Diesel, Petrol)
        if input_data.fuel_type == FuelType.DIESEL:
            density_kg_l = density_kg_l or DENSITY_DIESEL
            calorific_value_mj_kg = calorific_value_mj_kg or CALORIFIC_VALUE_DIESEL_MJ_KG
        elif input_data.fuel_type == FuelType.PETROL:
            density_kg_l = density_kg_l or DENSITY_PETROL
            calorific_value_mj_kg = calorific_value_mj_kg or CALORIFIC_VALUE_PETROL_MJ_KG
        elif input_data.fuel_type == FuelType.HEATING_OIL:
             density_kg_l = density_kg_l or DENSITY_DIESEL # Assuming similar to diesel if not specified
             calorific_value_mj_kg = calorific_value_mj_kg or CALORIFIC_VALUE_HEATING_OIL_MJ_KG
        
        if density_kg_l is None or calorific_value_mj_kg is None:
            raise ValueError(f"Density or Calorific Value missing for liquid fuel type {input_data.fuel_type}")
        
        # Energy(GJ)=(Volume(l)×Density(kg/l)×CalorificValue(MJ/kg)) / 1000
        energy_gj = (input_data.amount * density_kg_l * calorific_value_mj_kg) / 1000

    elif input_data.unit == Unit.M3 and input_data.fuel_type == FuelType.NATURAL_GAS:
        # For Natural Gas, calorific value is typically per m3, so direct conversion
        calorific_value_mj_m3 = calorific_value_mj_kg or CALORIFIC_VALUE_NATURAL_GAS_MJ_M3 # Using calorific_value_mj_kg field for MJ/m3
        if calorific_value_mj_m3 is None:
             raise ValueError("Calorific Value missing for Natural Gas")
        energy_gj = input_data.amount * (calorific_value_mj_m3 / 1000) # Convert MJ to GJ

    elif input_data.unit == Unit.TONNES and input_data.fuel_type == FuelType.COAL:
        calorific_value_mj_kg = input_data.calorific_value_mj_kg or CALORIFIC_VALUE_COAL_MJ_KG
        if calorific_value_mj_kg is None:
             raise ValueError("Calorific Value missing for Coal")
        energy_gj = input_data.amount * 1000 * (calorific_value_mj_kg / 1000) # tonnes to kg, MJ to GJ
    
    elif input_data.unit == Unit.KM and input_data.source == "Fleet": # Fleet Method 2 (Distance-based)
        if input_data.distance_km is None or input_data.vehicle_type is None:
            raise ValueError("distance_km and vehicle_type are required for distance-based fleet calculation.")
        
        # Estimate fuel usage based on distance and typical consumption
        # For Passenger Car Diesel = 60g/km (0.06 kg/km)
        # Convert to liters: kg / density_kg_l
        estimated_fuel_kg = input_data.distance_km * (FUEL_CONSUMPTION_PASSENGER_CAR_DIESEL_G_KM / 1000) # in kg
        
        # Assuming diesel for now based on example, needs to be more robust
        density_kg_l = density_kg_l or DENSITY_DIESEL
        calorific_value_mj_kg = calorific_value_mj_kg or CALORIFIC_VALUE_DIESEL_MJ_KG

        if density_kg_l is None or calorific_value_mj_kg is None:
            raise ValueError(f"Density or Calorific Value missing for estimated liquid fuel for vehicle type {input_data.vehicle_type}")

        estimated_fuel_liters = estimated_fuel_kg / density_kg_l
        energy_gj = (estimated_fuel_liters * density_kg_l * calorific_value_mj_kg) / 1000
        
    else:
        raise ValueError(f"Unsupported unit '{input_data.unit}' or fuel type '{input_data.fuel_type}' combination for combustion calculation, or missing distance/vehicle type for fleet method 2.")

    # Determine Emission Factors (kg/GJ)
    ef_co2 = input_data.emission_factor_co2_kg_gj
    ef_ch4 = input_data.emission_factor_ch4_kg_gj
    ef_n2o = input_data.emission_factor_n2o_kg_gj

    if input_data.fuel_type == FuelType.NATURAL_GAS:
        ef_co2 = ef_co2 or EF_CO2_NATURAL_GAS
        ef_ch4 = ef_ch4 or EF_CH4_NATURAL_GAS
        ef_n2o = ef_n2o or EF_N2O_NATURAL_GAS
    elif input_data.fuel_type == FuelType.HEATING_OIL:
        ef_co2 = ef_co2 or EF_CO2_HEATING_OIL
        ef_ch4 = ef_ch4 or EF_CH4_HEATING_OIL
        ef_n2o = ef_n2o or EF_N2O_HEATING_OIL
    elif input_data.fuel_type == FuelType.DIESEL:
        ef_co2 = ef_co2 or EF_CO2_DIESEL
        ef_ch4 = ef_ch4 or EF_CH4_DIESEL
        ef_n2o = ef_n2o or EF_N2O_DIESEL
    elif input_data.fuel_type == FuelType.PETROL:
        ef_co2 = ef_co2 or EF_CO2_PETROL
        ef_ch4 = ef_ch4 or EF_CH4_PETROL
        ef_n2o = ef_n2o or EF_N2O_PETROL
    elif input_data.fuel_type == FuelType.COAL:
        ef_co2 = ef_co2 or EF_CO2_COAL
        ef_ch4 = ef_ch4 or EF_CH4_COAL
        ef_n2o = ef_n2o or EF_N2O_COAL
    
    if ef_co2 is None or ef_ch4 is None or ef_n2o is None:
        raise ValueError(f"Emission factors missing for fuel type {input_data.fuel_type}")

    # Calculate Emissions
    mass_co2 = energy_gj * ef_co2
    mass_ch4 = energy_gj * ef_ch4
    mass_n2o = energy_gj * ef_n2o

    co2e = calculate_co2e(mass_co2, mass_ch4, mass_n2o)

    return EmissionResult(
        source=input_data.source,
        fuel_type=input_data.fuel_type,
        co2e=co2e,
        details={
            "energy_gj": energy_gj,
            "mass_co2": mass_co2,
            "mass_ch4": mass_ch4,
            "mass_n2o": mass_n2o,
        }
    )

def calculate_fugitive_emissions(input_data: FugitiveEmissionInput) -> EmissionResult:
    """Calculates CO2e for fugitive emissions (Refrigerants)."""
    gwp_factor = input_data.gwp_factor

    if input_data.refrigerant_type == RefrigerantType.R407C:
        gwp_factor = gwp_factor or GWP_R407C
    elif input_data.refrigerant_type == RefrigerantType.R32:
        gwp_factor = gwp_factor or GWP_R32
    elif input_data.refrigerant_type == RefrigerantType.R410A:
        gwp_factor = gwp_factor or GWP_R410A
    elif input_data.refrigerant_type == RefrigerantType.CUSTOM:
        if gwp_factor is None:
            raise ValueError("GWP factor is required for custom refrigerant type.")
    else:
        raise ValueError(f"Unsupported refrigerant type: {input_data.refrigerant_type}")
    
    if gwp_factor is None: # Should not happen with above logic, but for safety
        raise ValueError(f"GWP factor could not be determined for {input_data.refrigerant_type}")

    co2e = input_data.amount_kg * gwp_factor

    return EmissionResult(
        source=input_data.source,
        refrigerant_type=input_data.refrigerant_type,
        co2e=co2e,
        details={
            "amount_kg": input_data.amount_kg,
            "gwp_factor": gwp_factor,
        }
    )

def calculate_scope1_emissions(input_data: Scope1CalculationInput) -> Scope1Output:
    """Aggregates all Scope 1 emission calculations."""
    total_co2e = 0.0
    breakdown: List[EmissionResult] = []

    for combustion_input in input_data.combustion_emissions:
        result = calculate_combustion_emissions(combustion_input)
        total_co2e += result.co2e
        breakdown.append(result)
    
    for fugitive_input in input_data.fugitive_emissions:
        result = calculate_fugitive_emissions(fugitive_input)
        total_co2e += result.co2e
        breakdown.append(result)

    return Scope1Output(
        total_co2e=total_co2e,
        breakdown=breakdown
    )

# --- Scope 2 Constants ---
EF_ELECTRICITY_KG_CO2_PER_MWH = 698  # kg CO2/MWh (KOBiZE)
EF_DISTRICT_HEATING_KG_CO2_PER_GJ = 95.05 # kg CO2/GJ

# --- Pydantic Models for Scope 2 Input and Output ---
class ElectricityInput(BaseModel):
    amount_kwh: float = Field(..., gt=0, description="Electricity consumption in kWh")

class HeatingInput(BaseModel):
    amount_gj: float = Field(..., gt=0, description="District heating consumption in GJ")

class Scope2CalculationInput(BaseModel):
    electricity: Optional[ElectricityInput] = None
    district_heating: Optional[HeatingInput] = None

class Scope2Output(BaseModel):
    total_co2_emissions: float
    breakdown: Dict[str, float] = Field(default_factory=dict)

# --- Scope 2 Core Calculation Logic ---
def calculate_electricity_emissions(input_data: ElectricityInput) -> float:
    """Calculates CO2 emissions from purchased electricity."""
    mwh = input_data.amount_kwh / 1000
    emissions_kg = mwh * EF_ELECTRICITY_KG_CO2_PER_MWH
    return emissions_kg

def calculate_district_heating_emissions(input_data: HeatingInput) -> float:
    """Calculates CO2 emissions from district heating."""
    emissions_kg = input_data.amount_gj * EF_DISTRICT_HEATING_KG_CO2_PER_GJ
    return emissions_kg

def calculate_scope2_emissions(input_data: Scope2CalculationInput) -> Scope2Output:
    """Aggregates all Scope 2 emission calculations."""
    total_co2_emissions = 0.0
    breakdown: Dict[str, float] = {}

    if input_data.electricity:
        electricity_emissions = calculate_electricity_emissions(input_data.electricity)
        total_co2_emissions += electricity_emissions
        breakdown["electricity"] = electricity_emissions
    
    if input_data.district_heating:
        heating_emissions = calculate_district_heating_emissions(input_data.district_heating)
        total_co2_emissions += heating_emissions
        breakdown["district_heating"] = heating_emissions

    return Scope2Output(
        total_co2_emissions=total_co2_emissions,
        breakdown=breakdown
    )

# --- Scope 3 Constants ---
KM_TO_MILES = 0.621371
KG_TO_TONNES = 0.001

# Category 1: Purchased Goods and Services
EF_WATER_SUPPLY_KG_CO2E_PER_M3 = 0.149
EF_PAPER_ECO_LABELED_KG_CO2E_PER_TONNE = 739.4
EF_PAPER_STANDARD_KG_CO2E_PER_TONNE = 919.4

# Category 5: Waste Generated in Operations
EF_SOLID_WASTE_DISPOSAL_KG_CO2E_PER_TONNE = 21.29
EF_WASTEWATER_TREATMENT_KG_CO2E_PER_M3 = 0.272

# Category 6: Business Travel - Air Travel (Illustrative factors, needs real data)
# CO2 factors in kg/mile, CH4 and N2O in g/mile
# Short Haul (<300 miles)
AIR_SH_CO2_KG_PER_MILE = 0.15
AIR_SH_CH4_G_PER_MILE = 0.001
AIR_SH_N2O_G_PER_MILE = 0.001

# Medium Haul (300-2300 miles)
AIR_MH_CO2_KG_PER_MILE = 0.12
AIR_MH_CH4_G_PER_MILE = 0.0008
AIR_MH_N2O_G_PER_MILE = 0.0008

# Long Haul (>2300 miles)
AIR_LH_CO2_KG_PER_MILE = 0.10
AIR_LH_CH4_G_PER_MILE = 0.0005
AIR_LH_N2O_G_PER_MILE = 0.0005

# Category 6: Business Travel - Rail Travel
EF_RAIL_CO2_KG_PER_KM = 0.028 # PKP Intercity factor
EF_RAIL_CH4_KG_PER_MILE = 0.0000092 # EPA factors
EF_RAIL_N2O_KG_PER_MILE = 0.0000026 # EPA factors

# Category 6: Business Travel - Taxis and Buses (Illustrative factors, needs real data)
EF_TAXI_KG_CO2E_PER_KM = 0.2
EF_BUS_KG_CO2E_PER_KM = 0.1


# --- Pydantic Models for Scope 3 Input and Output ---
class WaterSupplyInput(BaseModel):
    volume_m3: float = Field(..., gt=0, description="Water consumption in cubic meters")

class PaperUsageInput(BaseModel):
    mass_kg: float = Field(..., gt=0, description="Mass of paper used in kilograms")
    eco_labeled: bool = False

class SolidWasteDisposalInput(BaseModel):
    mass_kg: float = Field(..., gt=0, description="Mass of solid waste in kilograms")

class WastewaterTreatmentInput(BaseModel):
    volume_m3: float = Field(..., gt=0, description="Volume of wastewater treated in cubic meters")

class AirTravelInput(BaseModel):
    distance_km: float = Field(..., gt=0, description="Distance traveled by air in kilometers")
    flight_class: Optional[str] = Field("economy", description="Flight class, e.g., 'economy', 'business'")

class RailTravelInput(BaseModel):
    distance_km: float = Field(..., gt=0, description="Distance traveled by rail in kilometers")

class TaxiBusTravelInput(BaseModel):
    distance_km: float = Field(..., gt=0, description="Distance traveled by taxi or bus in kilometers")
    vehicle_type: str = Field(..., description="Type of vehicle, e.g., 'taxi', 'bus'")

class Scope3CalculationInput(BaseModel):
    purchased_goods_services: List[Union[WaterSupplyInput, PaperUsageInput]] = Field(default_factory=list)
    waste_generated: List[Union[SolidWasteDisposalInput, WastewaterTreatmentInput]] = Field(default_factory=list)
    business_travel: List[Union[AirTravelInput, RailTravelInput, TaxiBusTravelInput]] = Field(default_factory=list)

class Scope3Output(BaseModel):
    total_co2e_emissions: float
    breakdown: Dict[str, Dict[str, float]] = Field(default_factory=dict)

# --- Scope 3 Core Calculation Logic ---

def km_to_miles(km: float) -> float:
    return km * KM_TO_MILES

def get_flight_haul_class(miles: float) -> str:
    if miles < 300:
        return "Short Haul"
    elif 300 <= miles < 2300:
        return "Medium Haul"
    else:
        return "Long Haul"

def calculate_water_supply_emissions(input_data: WaterSupplyInput) -> float:
    return input_data.volume_m3 * EF_WATER_SUPPLY_KG_CO2E_PER_M3

def calculate_paper_usage_emissions(input_data: PaperUsageInput) -> float:
    mass_tonnes = input_data.mass_kg * KG_TO_TONNES
    if input_data.eco_labeled:
        return mass_tonnes * EF_PAPER_ECO_LABELED_KG_CO2E_PER_TONNE
    else:
        return mass_tonnes * EF_PAPER_STANDARD_KG_CO2E_PER_TONNE

def calculate_solid_waste_emissions(input_data: SolidWasteDisposalInput) -> float:
    mass_tonnes = input_data.mass_kg * KG_TO_TONNES
    return mass_tonnes * EF_SOLID_WASTE_DISPOSAL_KG_CO2E_PER_TONNE

def calculate_wastewater_emissions(input_data: WastewaterTreatmentInput) -> float:
    return input_data.volume_m3 * EF_WASTEWATER_TREATMENT_KG_CO2E_PER_M3

def calculate_air_travel_emissions(input_data: AirTravelInput) -> float:
    distance_miles = km_to_miles(input_data.distance_km)
    haul_class = get_flight_haul_class(distance_miles)

    co2_factor_kg_per_mile: float
    ch4_factor_g_per_mile: float
    n2o_factor_g_per_mile: float

    if haul_class == "Short Haul":
        co2_factor_kg_per_mile = AIR_SH_CO2_KG_PER_MILE
        ch4_factor_g_per_mile = AIR_SH_CH4_G_PER_MILE
        n2o_factor_g_per_mile = AIR_SH_N2O_G_PER_MILE
    elif haul_class == "Medium Haul":
        co2_factor_kg_per_mile = AIR_MH_CO2_KG_PER_MILE
        ch4_factor_g_per_mile = AIR_MH_CH4_G_PER_MILE
        n2o_factor_g_per_mile = AIR_MH_N2O_G_PER_MILE
    else: # Long Haul
        co2_factor_kg_per_mile = AIR_LH_CO2_KG_PER_MILE
        ch4_factor_g_per_mile = AIR_LH_CH4_G_PER_MILE
        n2o_factor_g_per_mile = AIR_LH_N2O_G_PER_MILE
    
    mass_co2 = distance_miles * co2_factor_kg_per_mile
    mass_ch4 = (distance_miles * ch4_factor_g_per_mile) / 1000 # Convert g to kg
    mass_n2o = (distance_miles * n2o_factor_g_per_mile) / 1000 # Convert g to kg

    return calculate_co2e(mass_co2, mass_ch4, mass_n2o)

def calculate_rail_travel_emissions(input_data: RailTravelInput) -> float:
    # CO2 from km
    co2_emissions_kg = input_data.distance_km * EF_RAIL_CO2_KG_PER_KM

    # CH4 & N2O from miles
    distance_miles = km_to_miles(input_data.distance_km)
    mass_ch4 = distance_miles * EF_RAIL_CH4_KG_PER_MILE
    mass_n2o = distance_miles * EF_RAIL_N2O_KG_PER_MILE

    co2e_ch4_n2o = (mass_ch4 * GWP_CH4) + (mass_n2o * GWP_N2O)

    return co2_emissions_kg + co2e_ch4_n2o

def calculate_taxi_bus_travel_emissions(input_data: TaxiBusTravelInput) -> float:
    if input_data.vehicle_type.lower() == "taxi":
        return input_data.distance_km * EF_TAXI_KG_CO2E_PER_KM
    elif input_data.vehicle_type.lower() == "bus":
        return input_data.distance_km * EF_BUS_KG_CO2E_PER_KM
    else:
        raise ValueError(f"Unsupported vehicle type for taxi/bus: {input_data.vehicle_type}")

def calculate_scope3_emissions(input_data: Scope3CalculationInput) -> Scope3Output:
    total_co2e_emissions = 0.0
    breakdown = {
        "purchased_goods_services": {},
        "waste_generated": {},
        "business_travel": {}
    }

    # Category 1: Purchased Goods and Services
    for item in input_data.purchased_goods_services:
        if isinstance(item, WaterSupplyInput):
            emissions = calculate_water_supply_emissions(item)
            total_co2e_emissions += emissions
            breakdown["purchased_goods_services"]["water_supply"] = breakdown["purchased_goods_services"].get("water_supply", 0.0) + emissions
        elif isinstance(item, PaperUsageInput):
            emissions = calculate_paper_usage_emissions(item)
            total_co2e_emissions += emissions
            breakdown["purchased_goods_services"]["paper_usage"] = breakdown["purchased_goods_services"].get("paper_usage", 0.0) + emissions

    # Category 5: Waste Generated in Operations
    for item in input_data.waste_generated:
        if isinstance(item, SolidWasteDisposalInput):
            emissions = calculate_solid_waste_emissions(item)
            total_co2e_emissions += emissions
            breakdown["waste_generated"]["solid_waste_disposal"] = breakdown["waste_generated"].get("solid_waste_disposal", 0.0) + emissions
        elif isinstance(item, WastewaterTreatmentInput):
            emissions = calculate_wastewater_emissions(item)
            total_co2e_emissions += emissions
            breakdown["waste_generated"]["wastewater_treatment"] = breakdown["waste_generated"].get("wastewater_treatment", 0.0) + emissions

    # Category 6: Business Travel
    for item in input_data.business_travel:
        if isinstance(item, AirTravelInput):
            emissions = calculate_air_travel_emissions(item)
            total_co2e_emissions += emissions
            breakdown["business_travel"]["air_travel"] = breakdown["business_travel"].get("air_travel", 0.0) + emissions
        elif isinstance(item, RailTravelInput):
            emissions = calculate_rail_travel_emissions(item)
            total_co2e_emissions += emissions
            breakdown["business_travel"]["rail_travel"] = breakdown["business_travel"].get("rail_travel", 0.0) + emissions
        elif isinstance(item, TaxiBusTravelInput):
            emissions = calculate_taxi_bus_travel_emissions(item)
            total_co2e_emissions += emissions
            breakdown["business_travel"]["taxi_bus_travel"] = breakdown["business_travel"].get("taxi_bus_travel", 0.0) + emissions

    return Scope3Output(
        total_co2e_emissions=total_co2e_emissions,
        breakdown=breakdown
    )

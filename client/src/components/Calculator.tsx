import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { 
  Car, Zap, Plane, Trash2, ArrowRight, Download, RefreshCw, CheckCircle2
} from 'lucide-react';
import { 
  calculateFootprint, generatePDF, CarbonData, CarbonResults, 
  FuelType, Unit, RefrigerantType 
} from '@/lib/calculator'; // Import new enums

import { toast } from '@/hooks/use-toast';

const COLORS = ['#16a34a', '#0d9488', '#0284c7', '#84cc16'];

export function Calculator() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CarbonResults | null>(null);
  const [stats, setStats] = useState({ count: 1243 }); // Mock starting stats
  
  const [formData, setFormData] = useState<CarbonData>({
    // Initializing all fields as undefined to reflect optional nature
    s1_fuel_type: undefined,
    s1_fuel_amount: undefined,
    s1_fuel_unit: undefined,
    s1_refrigerant_type: undefined,
    s1_refrigerant_amount_kg: undefined,
    
    s2_electricity_kwh: undefined,
    s2_heating_gj: undefined,

    s3_water_m3: undefined,
    s3_paper_kg: undefined,
    s3_paper_eco_labeled: false,
    s3_solid_waste_kg: undefined,
    s3_wastewater_m3: undefined,
    s3_air_travel_km: undefined,
    s3_air_travel_class: undefined,
    s3_rail_travel_km: undefined,
    s3_taxi_bus_travel_km: undefined,
    s3_taxi_bus_vehicle_type: undefined,
  });

  useEffect(() => {
    // Mock database fetch
    const savedCount = localStorage.getItem('calc_count');
    if (savedCount) {
      setStats({ count: parseInt(savedCount) });
    }
  }, []);

  // Generic handler for input changes
  const handleInputChange = (field: keyof CarbonData, value: string | boolean) => {
    setFormData(prev => {
      const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
      return {
        ...prev,
        [field]: parsedValue || (typeof parsedValue === 'boolean' ? parsedValue : undefined)
      };
    });
  };

  // Generic handler for Select component changes (string values)
  const handleSelectChange = (field: keyof CarbonData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await calculateFootprint(formData);
      setResults(res);
      setStep(4);
      
      // Update mock database
      const newCount = stats.count + 1;
      setStats({ count: newCount });
      localStorage.setItem('calc_count', newCount.toString());
      toast({
        title: "Calculation Complete",
        description: "Your carbon footprint has been analyzed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Calculation Failed",
        description: error.message || "An unexpected error occurred during calculation.",
        variant: "destructive",
      });
      console.error("Calculation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (results) {
      generatePDF(formData, results);
      toast({
        title: "Report Generated",
        description: "Your PDF report is downloading.",
      });
    }
  };

  const reset = () => {
    setStep(1);
    setResults(null);
    setFormData({
      s1_fuel_type: undefined, s1_fuel_amount: undefined, s1_fuel_unit: undefined,
      s1_refrigerant_type: undefined, s1_refrigerant_amount_kg: undefined,
      s2_electricity_kwh: undefined, s2_heating_gj: undefined,
      s3_water_m3: undefined, s3_paper_kg: undefined, s3_paper_eco_labeled: false,
      s3_solid_waste_kg: undefined, s3_wastewater_m3: undefined,
      s3_air_travel_km: undefined, s3_air_travel_class: undefined,
      s3_rail_travel_km: undefined, s3_taxi_bus_travel_km: undefined, s3_taxi_bus_vehicle_type: undefined,
    });
  };

  const chartData = results ? [
    { name: 'Scope 1', value: results.scope1 },
    { name: 'Scope 2', value: results.scope2 },
    { name: 'Scope 3', value: results.scope3 },
  ] : [];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">{t('calc.title')}</h2>
          <p className="text-muted-foreground mt-2">ISO 14064-1 Compliant Calculation Engine</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-muted-foreground">{t('stats.calcs')}</p>
          <p className="text-2xl font-mono font-bold text-primary">{stats.count.toLocaleString()}</p>
        </div>
      </div>

      <Card className="border-2 border-border/50 shadow-xl overflow-hidden">
        <div className="bg-secondary/30 p-1">
           <div className="flex justify-between px-8 py-4">
             {[1, 2, 3, 4].map((s) => (
               <div key={s} className="flex items-center gap-2">
                 <div className={`
                   w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                   ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                   ${step === s ? 'ring-4 ring-primary/20' : ''}
                 `}>
                   {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                 </div>
                 <span className={`text-sm font-medium hidden md:block ${step >= s ? 'text-primary' : 'text-muted-foreground'}`}>
                   {s === 4 ? t('results.title') : t(`calc.step${s}`)}
                 </span>
               </div>
             ))}
           </div>
           <div className="h-1 bg-muted w-full">
             <div 
               className="h-full bg-primary transition-all duration-500 ease-in-out" 
               style={{ width: `${(step / 4) * 100}%` }}
             />
           </div>
        </div>

        <CardContent className="p-8 min-h-[400px]">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-100 rounded-xl text-green-700">
                  <Car className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t('calc.step1')}</h3>
                  <p className="text-muted-foreground">Direct GHG emissions from sources owned or controlled by the company (Combustion & Fugitive Emissions).</p>
                </div>
              </div>
              
              <Tabs defaultValue="combustion" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="combustion">Combustion</TabsTrigger>
                  <TabsTrigger value="fugitive">Fugitive Emissions</TabsTrigger>
                </TabsList>
                <TabsContent value="combustion" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="s1_fuel_type">Fuel Type</Label>
                    <Select onValueChange={(value) => handleSelectChange('s1_fuel_type', value)} value={formData.s1_fuel_type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Fuel Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FuelType).map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="s1_fuel_amount">Amount Consumed</Label>
                    <Input 
                      id="s1_fuel_amount"
                      type="number" 
                      placeholder="e.g., 1000"
                      value={formData.s1_fuel_amount || ''}
                      onChange={(e) => handleInputChange('s1_fuel_amount', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="s1_fuel_unit">Unit</Label>
                    <Select onValueChange={(value) => handleSelectChange('s1_fuel_unit', value)} value={formData.s1_fuel_unit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Unit).filter(unit => [Unit.M3, Unit.LITERS, Unit.TONNES].includes(unit as Unit)).map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="fugitive" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="s1_refrigerant_type">Refrigerant Type</Label>
                    <Select onValueChange={(value) => handleSelectChange('s1_refrigerant_type', value)} value={formData.s1_refrigerant_type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Refrigerant Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(RefrigerantType).map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="s1_refrigerant_amount_kg">Amount Refilled (kg)</Label>
                    <Input 
                      id="s1_refrigerant_amount_kg"
                      type="number" 
                      placeholder="e.g., 50"
                      value={formData.s1_refrigerant_amount_kg || ''}
                      onChange={(e) => handleInputChange('s1_refrigerant_amount_kg', e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-teal-100 rounded-xl text-teal-700">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t('calc.step2')}</h3>
                  <p className="text-muted-foreground">Indirect GHG emissions from the generation of purchased electricity & district heating.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="s2_electricity_kwh">Electricity Consumption (kWh)</Label>
                  <Input 
                    id="s2_electricity_kwh"
                    type="number" 
                    placeholder="e.g., 5000"
                    value={formData.s2_electricity_kwh || ''}
                    onChange={(e) => handleInputChange('s2_electricity_kwh', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="s2_heating_gj">District Heating Consumption (GJ)</Label>
                  <Input 
                    id="s2_heating_gj"
                    type="number" 
                    placeholder="e.g., 200"
                    value={formData.s2_heating_gj || ''}
                    onChange={(e) => handleInputChange('s2_heating_gj', e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-700">
                  <Plane className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t('calc.step3')}</h3>
                  <p className="text-muted-foreground">All other indirect emissions (not included in Scope 2) that occur in the value chain.</p>
                </div>
              </div>

              <Tabs defaultValue="purchased_goods" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="purchased_goods">Purchased Goods/Services</TabsTrigger>
                  <TabsTrigger value="waste_generated">Waste Generated</TabsTrigger>
                  <TabsTrigger value="business_travel">Business Travel</TabsTrigger>
                </TabsList>

                <TabsContent value="purchased_goods" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="s3_water_m3">Water Supply (m³)</Label>
                    <Input 
                      id="s3_water_m3"
                      type="number" 
                      placeholder="e.g., 50"
                      value={formData.s3_water_m3 || ''}
                      onChange={(e) => handleInputChange('s3_water_m3', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="s3_paper_kg">Paper Usage (kg)</Label>
                    <Input 
                      id="s3_paper_kg"
                      type="number" 
                      placeholder="e.g., 100"
                      value={formData.s3_paper_kg || ''}
                      onChange={(e) => handleInputChange('s3_paper_kg', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="s3_paper_eco_labeled"
                      checked={formData.s3_paper_eco_labeled}
                      onCheckedChange={(checked: boolean) => handleInputChange('s3_paper_eco_labeled', checked)}
                    />
                    <Label htmlFor="s3_paper_eco_labeled">Eco-labeled Paper</Label>
                  </div>
                </TabsContent>

                <TabsContent value="waste_generated" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="s3_solid_waste_kg">Solid Waste Disposal (kg)</Label>
                    <Input 
                      id="s3_solid_waste_kg"
                      type="number" 
                      placeholder="e.g., 200"
                      value={formData.s3_solid_waste_kg || ''}
                      onChange={(e) => handleInputChange('s3_solid_waste_kg', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="s3_wastewater_m3">Wastewater Treatment (m³)</Label>
                    <Input 
                      id="s3_wastewater_m3"
                      type="number" 
                      placeholder="e.g., 75"
                      value={formData.s3_wastewater_m3 || ''}
                      onChange={(e) => handleInputChange('s3_wastewater_m3', e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="business_travel" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="s3_air_travel_km">Air Travel (km)</Label>
                    <Input 
                      id="s3_air_travel_km"
                      type="number" 
                      placeholder="e.g., 1000"
                      value={formData.s3_air_travel_km || ''}
                      onChange={(e) => handleInputChange('s3_air_travel_km', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="s3_air_travel_class">Air Travel Class</Label>
                    <Select onValueChange={(value) => handleSelectChange('s3_air_travel_class', value)} value={formData.s3_air_travel_class}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        {/* Add other classes if needed */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="s3_rail_travel_km">Rail Travel (km)</Label>
                    <Input 
                      id="s3_rail_travel_km"
                      type="number" 
                      placeholder="e.g., 500"
                      value={formData.s3_rail_travel_km || ''}
                      onChange={(e) => handleInputChange('s3_rail_travel_km', e.target.value)}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="s3_taxi_bus_travel_km">Taxi/Bus Travel (km)</Label>
                      <Input 
                        id="s3_taxi_bus_travel_km"
                        type="number" 
                        placeholder="e.g., 100"
                        value={formData.s3_taxi_bus_travel_km || ''}
                        onChange={(e) => handleInputChange('s3_taxi_bus_travel_km', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="s3_taxi_bus_vehicle_type">Vehicle Type</Label>
                      <Select onValueChange={(value) => handleSelectChange('s3_taxi_bus_vehicle_type', value)} value={formData.s3_taxi_bus_vehicle_type}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="taxi">Taxi</SelectItem>
                          <SelectItem value="bus">Bus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {step === 4 && results && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid md:grid-cols-2 gap-8 items-center">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${value.toFixed(2)} kg CO2e`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{t('results.total')}</h3>
                  <p className="text-5xl font-mono font-bold text-primary mt-2">
                    {results.total.toFixed(2)} <span className="text-lg text-muted-foreground font-sans font-normal">kg CO2e</span>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm border-b py-2">
                    <span className="flex items-center gap-2"><Car className="w-4 h-4 text-green-600"/> Scope 1</span>
                    <span className="font-mono font-bold">{results.scope1.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b py-2">
                    <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-teal-600"/> Scope 2</span>
                    <span className="font-mono font-bold">{results.scope2.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b py-2">
                    <span className="flex items-center gap-2"><Plane className="w-4 h-4 text-blue-600"/> Scope 3</span>
                    <span className="font-mono font-bold">{results.scope3.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleDownload} className="flex-1" size="lg" data-testid="btn-download">
                    <Download className="mr-2 h-4 w-4" /> {t('results.download')}
                  </Button>
                  <Button variant="outline" onClick={reset} size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" /> New
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/30 p-6 flex justify-between">
          {step > 1 && step < 4 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} size="lg">
              Back
            </Button>
          )}
          
          {step === 1 && <div />} {/* Spacer */}

          {step < 3 && (
            <Button onClick={() => setStep(s => s + 1)} size="lg" className="ml-auto" data-testid="btn-next">
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          {step === 3 && (
            <Button onClick={handleCalculate} size="lg" disabled={loading} className="ml-auto" data-testid="btn-calculate">
              {loading ? "Calculating..." : t('calculate')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
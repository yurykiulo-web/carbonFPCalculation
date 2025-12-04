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
import { 
  Car, Zap, Plane, Trash2, ArrowRight, Download, RefreshCw, CheckCircle2
} from 'lucide-react';
import { calculateFootprint, generatePDF, CarbonData, CarbonResults } from '@/lib/calculator';
import { toast } from '@/hooks/use-toast';

const COLORS = ['#16a34a', '#0d9488', '#0284c7', '#84cc16'];

export function Calculator() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CarbonResults | null>(null);
  const [stats, setStats] = useState({ count: 1243 }); // Mock starting stats
  
  const [formData, setFormData] = useState<CarbonData>({
    fuel: 0,
    electricity: 0,
    travel: 0,
    waste: 0
  });

  useEffect(() => {
    // Mock database fetch
    const savedCount = localStorage.getItem('calc_count');
    if (savedCount) {
      setStats({ count: parseInt(savedCount) });
    }
  }, []);

  const handleInputChange = (field: keyof CarbonData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleCalculate = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const res = calculateFootprint(formData);
      setResults(res);
      setLoading(false);
      setStep(4);
      
      // Update mock database
      const newCount = stats.count + 1;
      setStats({ count: newCount });
      localStorage.setItem('calc_count', newCount.toString());
      toast({
        title: "Calculation Complete",
        description: "Your carbon footprint has been analyzed successfully.",
      });
    }, 800);
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
    setFormData({ fuel: 0, electricity: 0, travel: 0, waste: 0 });
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
                  <p className="text-muted-foreground">Direct GHG emissions from sources owned or controlled by the company.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="fuel">{t('calc.fuel')}</Label>
                  <Input 
                    id="fuel"
                    data-testid="input-fuel"
                    type="number" 
                    placeholder={t('calc.fuel.placeholder')}
                    value={formData.fuel || ''}
                    onChange={(e) => handleInputChange('fuel', e.target.value)}
                    className="text-lg p-6"
                  />
                </div>
              </div>
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
                  <p className="text-muted-foreground">Indirect GHG emissions from the generation of purchased electricity.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="electricity">{t('calc.electricity')}</Label>
                  <Input 
                    id="electricity"
                    data-testid="input-electricity"
                    type="number" 
                    placeholder={t('calc.electricity.placeholder')}
                    value={formData.electricity || ''}
                    onChange={(e) => handleInputChange('electricity', e.target.value)}
                    className="text-lg p-6"
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

              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="travel">{t('calc.travel')}</Label>
                  <Input 
                    id="travel"
                    data-testid="input-travel"
                    type="number" 
                    placeholder={t('calc.travel.placeholder')}
                    value={formData.travel || ''}
                    onChange={(e) => handleInputChange('travel', e.target.value)}
                    className="text-lg p-6"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="waste">{t('calc.waste')}</Label>
                  <Input 
                    id="waste"
                    data-testid="input-waste"
                    type="number" 
                    placeholder={t('calc.waste.placeholder')}
                    value={formData.waste || ''}
                    onChange={(e) => handleInputChange('waste', e.target.value)}
                    className="text-lg p-6"
                  />
                </div>
              </div>
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
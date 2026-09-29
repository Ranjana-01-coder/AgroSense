

"use client";

import { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  analyzeSoilComposition,
  AnalyzeSoilCompositionOutput,
} from "@/ai/flows/soil-nutrient-analysis";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Beaker, Syringe, Plus, Minus, Lightbulb, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useAgroStore } from "@/lib/store";
import { useTranslation } from "@/lib/translation";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, serverTimestamp } from "firebase/firestore";

const soilNutrientSchema = z.object({
  nitrogen: z.coerce.number(),
  phosphorus: z.coerce.number(),
  potassium: z.coerce.number(),
  ph: z.coerce.number().min(0).max(14),
  organicMatter: z.coerce.number(),
});

type FormData = z.infer<typeof soilNutrientSchema>;

type SoilAnalysisResult = AnalyzeSoilCompositionOutput & { input: FormData };

const NutrientInput = ({ field, label, unit }: { field: any, label: string, unit: string }) => {
  const form = useFormContext();
  const currentValue = field.value || 0;

  const setValue = (val: number) => {
    form.setValue(field.name, Math.max(0, val));
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => setValue(currentValue - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <FormControl>
          <Input type="number" {...field} className="text-center" />
        </FormControl>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => setValue(currentValue + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground w-12">{unit}</span>
      </div>
      <FormMessage />
    </FormItem>
  );
};


export default function SoilAnalysisForm() {
  const [result, setResult] = useState<SoilAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language, setSoilData } = useAgroStore();
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<FormData>({
    resolver: zodResolver(soilNutrientSchema),
    defaultValues: {
      nitrogen: 15,
      phosphorus: 8,
      potassium: 25,
      ph: 6.5,
      organicMatter: 2.5,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await analyzeSoilComposition({ ...data, language });
      const newResult = { ...response, input: data };
      setResult(newResult);
      setSoilData(newResult); // Save to store

      if (user) {
        const reportData = {
          userId: user.uid,
          latitude: 0,
          longitude: 0,
          nitrogenLevel: data.nitrogen,
          phosphorusLevel: data.phosphorus,
          potassiumLevel: data.potassium,
          reportDate: serverTimestamp(),
        };
        const soilReportsRef = collection(firestore, 'users', user.uid, 'soilReports');
        addDocumentNonBlocking(soilReportsRef, reportData);
      }
    } catch (error) {
      console.error("Error analyzing soil:", error);
      toast({
        variant: "destructive",
        title: t('soilAnalysis.errorTitle'),
        description: t('soilAnalysis.errorDescription'),
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!result) return;

    const reportContent = `
=================================
    ${t('soilAnalysis.report.title')}
=================================

${t('soilAnalysis.report.condition').toUpperCase()}
---------------------------------
${t('soilAnalysis.report.nitrogen').padEnd(20)}: ${result.input.nitrogen} ppm
${t('soilAnalysis.report.phosphorus').padEnd(20)}: ${result.input.phosphorus} ppm
${t('soilAnalysis.report.potassium').padEnd(20)}: ${result.input.potassium} ppm
${t('soilAnalysis.report.ph').padEnd(20)}: ${result.input.ph}
${t('soilAnalysis.report.organicMatter').padEnd(20)}: ${result.input.organicMatter}%

${t('soilAnalysis.report.analysis').toUpperCase()}
---------------------------------
${result.nutrientDeficiencies}

${t('soilAnalysis.report.fertilizerAdvice').toUpperCase()}
---------------------------------
${result.fertilizationRecommendations}

${t('soilAnalysis.report.improvementTips').toUpperCase()}
---------------------------------
${result.tips}
    `;
    
    const blob = new Blob([reportContent.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soil-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const chartData = result ? [
    { name: "N", value: result.input.nitrogen, fill: "hsl(var(--chart-1))" },
    { name: "P", value: result.input.phosphorus, fill: "hsl(var(--chart-2))" },
    { name: "K", value: result.input.potassium, fill: "hsl(var(--chart-3))" },
    { name: "pH", value: result.input.ph, fill: "hsl(var(--chart-4))" },
    { name: "OM", value: result.input.organicMatter, fill: "hsl(var(--chart-5))" },
  ] : [];


  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('soilAnalysis.enterData')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nitrogen" render={({ field }) => <NutrientInput field={field} label={t('soilAnalysis.nitrogen')} unit="ppm" />} />
              <FormField control={form.control} name="phosphorus" render={({ field }) => <NutrientInput field={field} label={t('soilAnalysis.phosphorus')} unit="ppm" />} />
              <FormField control={form.control} name="potassium" render={({ field }) => <NutrientInput field={field} label={t('soilAnalysis.potassium')} unit="ppm" />} />
              <FormField control={form.control} name="ph" render={({ field }) => <NutrientInput field={field} label={t('soilAnalysis.ph')} unit="" />} />
              <FormField control={form.control} name="organicMatter" render={({ field }) => <NutrientInput field={field} label={t('soilAnalysis.organicMatter')} unit="%" />} />
              
              <Button type="submit" disabled={isLoading} className="mt-4 cursor-pointer">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('soilAnalysis.analyzeSoil')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {isLoading ? (
            <Card className="flex flex-col h-full">
                <CardHeader>
                <CardTitle>{t('soilAnalysis.analysisResult')}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">{t('soilAnalysis.analyzing')}</p>
                </div>
                </CardContent>
            </Card>
        ) : result ? (
            <>
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>{t('soilAnalysis.nutrientLevels')}</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleDownload} className="cursor-pointer">
                        <Download className="mr-2 h-4 w-4" />
                        {t('common.downloadReport')}
                    </Button>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip cursor={{fill: 'rgba(200, 200, 200, 0.1)'}} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex-row items-start gap-4 space-y-0 pb-2">
                  <Beaker className="h-8 w-8 text-primary mt-1" />
                  <div>
                    <CardTitle>{t('soilAnalysis.nutrientDeficiencies')}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {result.nutrientDeficiencies}
                    </p>
                  </div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="flex-row items-start gap-4 space-y-0 pb-2">
                  <Syringe className="h-8 w-8 text-primary mt-1" />
                  <div>
                    <CardTitle>{t('soilAnalysis.fertilizationRecs')}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {result.fertilizationRecommendations}
                    </p>
                  </div>
                </CardHeader>
              </Card>
               <Card>
                <CardHeader className="flex-row items-start gap-4 space-y-0 pb-2">
                  <Lightbulb className="h-8 w-8 text-primary mt-1" />
                  <div>
                    <CardTitle>{t('soilAnalysis.improvementTips')}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {result.tips}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            </>
        ) : (
            <Card className="flex flex-col h-full">
                <CardHeader>
                <CardTitle>{t('soilAnalysis.analysisResult')}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <p>{t('soilAnalysis.enterToSee')}</p>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

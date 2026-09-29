
"use client";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTranslation } from "@/lib/translation";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { useMemo } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

const chartConfigYield = {
  yield: {
    label: "Yield (tons/ha)",
    color: "hsl(var(--chart-1))",
  },
};

const NoData = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-full min-h-[200px] text-center text-muted-foreground p-4">
    <p>{message}</p>
  </div>
);


export default function ReportsPage() {
    const { t } = useTranslation();
    const { user } = useUser();
    const firestore = useFirestore();

    const diseaseReportsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'reports') : null, [user, firestore]);
    const soilReportsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'soilReports') : null, [user, firestore]);
    const yieldPredictionsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'yieldPredictions') : null, [user, firestore]);

    const { data: diseaseReports, isLoading: diseaseLoading } = useCollection(diseaseReportsRef);
    const { data: soilReports, isLoading: soilLoading } = useCollection(soilReportsRef);
    const { data: yieldPredictions, isLoading: yieldLoading } = useCollection(yieldPredictionsRef);

    const isLoading = diseaseLoading || soilLoading || yieldLoading;

    const yieldData = useMemo(() => {
      if (!yieldPredictions) return [];
      const monthlyYields = yieldPredictions.reduce((acc, prediction) => {
        if (prediction.predictionDate?.toDate) {
          const month = format(prediction.predictionDate.toDate(), 'MMM');
          acc[month] = (acc[month] || 0) + prediction.predictedYield;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.map(month => ({
        month,
        yield: monthlyYields[month] || 0,
      })).filter(m => m.yield > 0);

    }, [yieldPredictions]);

    const diseaseData = useMemo(() => {
        if (!diseaseReports) return [];
        const counts = diseaseReports.reduce((acc, report) => {
            const disease = report.detectedDisease || 'Unknown';
            acc[disease] = (acc[disease] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
        return Object.entries(counts).map(([name, value], index) => ({
            name,
            value,
            fill: colors[index % colors.length],
        }));
    }, [diseaseReports]);

    const soilNutrientData = useMemo(() => {
        if (!soilReports || soilReports.length === 0) return [];
        const totals = soilReports.reduce((acc, report) => {
            acc.N += report.nitrogenLevel || 0;
            acc.P += report.phosphorusLevel || 0;
            acc.K += report.potassiumLevel || 0;
            return acc;
        }, { N: 0, P: 0, K: 0 });

        const count = soilReports.length;
        return [
            { name: 'Nitrogen', value: parseFloat((totals.N / count).toFixed(2)), fill: 'hsl(var(--chart-1))' },
            { name: 'Phosphorus', value: parseFloat((totals.P / count).toFixed(2)), fill: 'hsl(var(--chart-2))' },
            { name: 'Potassium', value: parseFloat((totals.K / count).toFixed(2)), fill: 'hsl(var(--chart-3))' },
        ];
    }, [soilReports]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }


  return (
    <div className="container space-y-8 py-8">
      <PageHeader
        title={t('reports.title')}
        description={t('reports.description')}
      />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('reports.monthlyYield')}</CardTitle>
            <CardDescription>Yield predictions over time</CardDescription>
          </CardHeader>
          <CardContent>
            {yieldData.length > 0 ? (
                <ChartContainer config={chartConfigYield} className="min-h-[300px] w-full">
                <BarChart accessibilityLayer data={yieldData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar dataKey="yield" fill="var(--color-yield)" radius={4} />
                </BarChart>
                </ChartContainer>
            ) : <NoData message="No yield predictions found. Make a prediction to see data here." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.diseaseDistribution')}</CardTitle>
             <CardDescription>Breakdown of detected diseases</CardDescription>
          </CardHeader>
          <CardContent>
             {diseaseData.length > 0 ? (
                <ChartContainer config={{}} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={diseaseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {diseaseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
             ) : <NoData message="No disease reports found. Analyze an image to see data here." />}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('reports.soilNutrient')}</CardTitle>
            <CardDescription>{t('reports.acrossFields')}</CardDescription>
          </CardHeader>
          <CardContent>
             {soilNutrientData.length > 0 ? (
                <ChartContainer config={{}} className="min-h-[200px] w-full">
                    <BarChart data={soilNutrientData} layout="vertical" margin={{left: 10}}>
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" hide/>
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <Bar dataKey="value" radius={5}>
                            {soilNutrientData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
             ) : <NoData message="No soil reports found. Analyze your soil to see data here." />}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}



"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  predictCropYield,
  YieldPredictionOutput,
} from "@/ai/flows/yield-prediction";
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
import { Loader2, TrendingUp, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import indianStates from "@/lib/india-states-districts.json";
import { useAgroStore } from "@/lib/store";
import { useTranslation } from "@/lib/translation";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, serverTimestamp } from "firebase/firestore";

const yieldPredictionSchema = z.object({
  cropType: z.string().min(1, { message: "Crop type is required." }),
  state: z.string().min(1, { message: "Please select a state." }),
  district: z.string().min(1, { message: "Please select a district." }),
  previousYield: z.coerce.number().min(0, "Yield must be a positive number."),
  avgRainfall: z.coerce.number().min(0, "Rainfall must be a positive number."),
  avgTemperature: z.coerce.number(),
  soilPh: z.coerce.number().min(0, "pH must be positive.").max(14, "pH cannot exceed 14."),
});

type FormData = z.infer<typeof yieldPredictionSchema>;

export default function YieldPredictionForm() {
  const [result, setResult] = useState<YieldPredictionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const { language } = useAgroStore();
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<FormData>({
    resolver: zodResolver(yieldPredictionSchema),
    defaultValues: {
      cropType: "",
      state: "",
      district: "",
      previousYield: 0,
      avgRainfall: 0,
      avgTemperature: 0,
      soilPh: 0,
    }
  });
  
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const stateData = indianStates.states.find(s => s.state === state);
    setDistricts(stateData ? stateData.districts : []);
    form.setValue("state", state);
    form.setValue("district", "");
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await predictCropYield({ ...data, language });
      setResult(response);
      
      if (user) {
        const predictionData = {
            userId: user.uid,
            cropType: data.cropType,
            predictedYield: response.predictedYield,
            predictionDate: serverTimestamp(),
        };
        const yieldPredictionsRef = collection(firestore, 'users', user.uid, 'yieldPredictions');
        addDocumentNonBlocking(yieldPredictionsRef, predictionData);
      }

    } catch (error) {
      console.error("Error predicting yield:", error);
      toast({
        variant: "destructive",
        title: t('yieldPrediction.errorTitle'),
        description: t('yieldPrediction.errorDescription'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('yieldPrediction.enterData')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cropType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('yieldPrediction.cropType')}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Corn, Wheat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('yieldPrediction.state')}</FormLabel>
                       <Select onValueChange={handleStateChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('yieldPrediction.selectState')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {indianStates.states.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('yieldPrediction.district')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedState}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('yieldPrediction.selectDistrict')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="previousYield"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('yieldPrediction.previousYield')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avgRainfall"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('yieldPrediction.avgRainfall')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avgTemperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('yieldPrediction.avgTemp')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="soilPh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('yieldPrediction.soilPh')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 6.8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="cursor-pointer">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('yieldPrediction.predictYield')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>{t('yieldPrediction.prediction')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">{t('yieldPrediction.calculating')}</p>
            </div>
          ) : result ? (
            <div className="w-full space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    {t('yieldPrediction.predictedYield')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold font-headline">
                    {result.predictedYield.toFixed(2)}{" "}
                    <span className="text-lg font-normal text-muted-foreground">
                      {t('yieldPrediction.unit')}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('yieldPrediction.confidence', { interval: result.confidenceInterval })}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    {t('yieldPrediction.influencingFactors')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <h4 className="font-semibold">{t('yieldPrediction.keyFactors')}</h4>
                    <p className="text-sm text-muted-foreground">{result.factorsInfluencingYield}</p>
                    <h4 className="font-semibold pt-2">{t('yieldPrediction.recommendations')}</h4>
                    <p className="text-sm text-muted-foreground">{result.recommendations}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>{t('yieldPrediction.enterToSee')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

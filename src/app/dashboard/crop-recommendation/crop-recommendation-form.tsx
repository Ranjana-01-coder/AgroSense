

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  recommendCrops,
  CropRecommendationOutput,
} from "@/ai/flows/crop-recommendation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, BadgeCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAgroStore } from "@/lib/store";
import { useTranslation } from "@/lib/translation";

const cropRecommendationSchema = z.object({
  season: z.string().min(1, { message: "Please select a season." }),
  soilPh: z.coerce.number().min(0, "pH must be positive.").max(14, "pH cannot exceed 14."),
  avgRainfall: z.coerce.number().min(0, "Rainfall must be a positive number."),
  avgTemperature: z.coerce.number(),
});

type FormData = z.infer<typeof cropRecommendationSchema>;

export default function CropRecommendationForm() {
  const [result, setResult] = useState<CropRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useAgroStore();
  const { t } = useTranslation();

  const form = useForm<FormData>({
    resolver: zodResolver(cropRecommendationSchema),
    defaultValues: {
      season: "",
      soilPh: 0,
      avgRainfall: 0,
      avgTemperature: 0,
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await recommendCrops({ ...data, language });
      setResult(response);
    } catch (error) {
      console.error("Error recommending crops:", error);
      toast({
        variant: "destructive",
        title: t('cropRecommendation.errorTitle'),
        description: t('cropRecommendation.errorDescription'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const seasons = [
    { value: "Spring", label: t('cropRecommendation.seasons.spring') },
    { value: "Summer", label: t('cropRecommendation.seasons.summer') },
    { value: "Autumn", label: t('cropRecommendation.seasons.autumn') },
    { value: "Winter", label: t('cropRecommendation.seasons.winter') },
    { value: "Monsoon", label: t('cropRecommendation.seasons.monsoon') },
    { value: "Dry Season", label: t('cropRecommendation.seasons.dry') },
  ];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('cropRecommendation.enterConditions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('cropRecommendation.season')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('cropRecommendation.selectSeason')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {seasons.map(season => (
                            <SelectItem key={season.value} value={season.value}>{season.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soilPh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('cropRecommendation.soilPh')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 6.8" {...field} />
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
                    <FormLabel>{t('cropRecommendation.avgRainfall')}</FormLabel>
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
                    <FormLabel>{t('cropRecommendation.avgTemp')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 25" {...field} />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
                />

              <Button type="submit" disabled={isLoading} className="cursor-pointer">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('cropRecommendation.getRecommendations')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>{t('cropRecommendation.aiRecommendations')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">{t('cropRecommendation.generating')}</p>
            </div>
          ) : result ? (
            <div className="w-full space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <BadgeCheck className="h-6 w-6 text-primary" />
                    {t('cropRecommendation.recommendedCrops')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {result.recommendedCrops.map((crop) => (
                    <div
                      key={crop}
                      className="bg-primary/10 text-primary-foreground-dark font-semibold px-3 py-1 rounded-full text-sm"
                    >
                      {crop}
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    {t('cropRecommendation.reasoning')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {result.reasoning}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>{t('cropRecommendation.enterToSee')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

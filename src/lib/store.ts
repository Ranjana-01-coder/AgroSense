
import { create } from 'zustand';
import { z } from 'zod';
import { AnalyzeSoilCompositionOutput } from '@/ai/flows/soil-nutrient-analysis';
import { WeatherForecastOutput } from '@/ai/flows/weather-forecast';
import { YieldPredictionOutput } from '@/ai/flows/yield-prediction';
import { languageEnum } from './schemas';

export const languages = languageEnum.options;
export type Language = z.infer<typeof languageEnum>;

const soilNutrientSchema = z.object({
  nitrogen: z.coerce.number(),
  phosphorus: z.coerce.number(),
  potassium: z.coerce.number(),
  ph: z.coerce.number().min(0).max(14),
  organicMatter: z.coerce.number(),
});

type SoilAnalysisResult = AnalyzeSoilCompositionOutput & { input: z.infer<typeof soilNutrientSchema> };

type AgroState = {
  // Global language state
  language: Language;
  setLanguage: (language: Language) => void;

  soilData: SoilAnalysisResult | null;
  setSoilData: (data: SoilAnalysisResult | null) => void;
  weatherData: WeatherForecastOutput | null;
  setWeatherData: (data: WeatherForecastOutput | null) => void;
  yieldData: YieldPredictionOutput | null;
  setYieldData: (data: YieldPredictionOutput | null) => void;
  
  // For weather page specifically
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
};

export const useAgroStore = create<AgroState>((set) => ({
  language: 'English',
  setLanguage: (language) => set({ language }),

  soilData: null,
  setSoilData: (data) => set({ soilData: data }),
  weatherData: null,
  setWeatherData: (data) => set({ weatherData: data }),
  yieldData: null,
  setYieldData: (data) => set({ yieldData: data }),
  
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error: error }),
}));

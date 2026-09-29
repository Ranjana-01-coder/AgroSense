
'use server';
/**
 * @fileOverview Predicts crop yield based on historical data, weather patterns, and soil conditions.
 *
 * - predictCropYield - A function that handles the crop yield prediction process.
 * - YieldPredictionInput - The input type for the predictCropYield function.
 * - YieldPredictionOutput - The return type for the predictCropYield function.
 */

import {z} from 'zod';
import { languageEnum } from '@/lib/schemas';

const yieldPredictionSchema = z.object({
  cropType: z.string().min(1, { message: "Crop type is required." }),
  state: z.string().min(1, { message: "State is required." }),
  district: z.string().min(1, { message: "District is required." }),
  previousYield: z.coerce.number().min(0, "Yield must be a positive number."),
  avgRainfall: z.coerce.number().min(0, "Rainfall must be a positive number."),
  avgTemperature: z.coerce.number(),
  soilPh: z.coerce.number().min(0, "pH must be positive.").max(14, "pH cannot exceed 14."),
  language: languageEnum,
});

export type YieldPredictionInput = z.infer<typeof yieldPredictionSchema>;

const YieldPredictionOutputSchema = z.object({
  predictedYield: z.number().describe('The predicted crop yield in tons per hectare.'),
  confidenceInterval: z.string().describe('A range representing the confidence interval for the prediction.'),
  factorsInfluencingYield: z.string().describe('A list of key factors influencing the predicted yield, such as weather events or soil quality.'),
  recommendations: z.string().describe('Recommendations for improving yield based on the analysis.'),
});
export type YieldPredictionOutput = z.infer<typeof YieldPredictionOutputSchema>;

export async function predictCropYield(input: YieldPredictionInput): Promise<YieldPredictionOutput> {
    // TODO: Replace this with your own model inference logic.
    // The input object contains all the data entered by the user.
    console.log('Simulating yield prediction for input:', input);

    // This is a stable, hardcoded response.
    const predicted = (input.previousYield || 3) * 1.05; 

    return {
        predictedYield: predicted,
        confidenceInterval: `${(predicted * 0.95).toFixed(2)} - ${(predicted * 1.05).toFixed(2)}`,
        factorsInfluencingYield: 'Simulated Factors: Rainfall and temperature were considered key factors. Your model would provide real influencing factors.',
        recommendations: 'Simulated Recommendation: Ensure proper irrigation during dry spells to mitigate risk. This is a placeholder.',
    };
}

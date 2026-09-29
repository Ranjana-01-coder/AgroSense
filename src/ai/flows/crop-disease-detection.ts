
'use server';

/**
 * @fileOverview This file defines a function for detecting crop diseases from an image using a simulated model.
 *
 * It includes:
 * - `detectCropDisease`: A function that takes an image of a crop and returns a simulated diagnosis.
 * - `DetectCropDiseaseInput`: The input type for the `detectCropDisease` function.
 * - `DetectCropDiseaseOutput`: The output type for the `detectCropDisease` function.
 */

import { z } from "zod";
import { languageEnum } from '@/lib/schemas';
import diseaseLabels from '@/ai/ml_models/crop_disease_model/crop_disease_labels.json';

const DetectCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  language: languageEnum,
});
export type DetectCropDiseaseInput = z.infer<typeof DetectCropDiseaseInputSchema>;

const DetectCropDiseaseOutputSchema = z.object({
  healthStatus: z
    .enum(['Healthy', 'Moderate', 'Poor'])
    .describe('The overall health status of the crop.'),
  diseaseName: z
    .string()
    .describe('The name of the detected disease, or "Healthy" if no disease is detected.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the disease detection (0-1).'),
  recommendations: z
    .string()
    .describe('Actionable recommendations for treatment or prevention.'),
});
export type DetectCropDiseaseOutput = z.infer<typeof DetectCropDiseaseOutputSchema>;


export async function detectCropDisease(
  input: DetectCropDiseaseInput
): Promise<DetectCropDiseaseOutput> {
  // Simulate a small delay to make it feel more like a real API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  const diseases = Object.keys(diseaseLabels);
  const randomDiseaseKey = diseases[Math.floor(Math.random() * diseases.length)];
  const diseaseName = randomDiseaseKey.replace(/__/g, ' - ').replace(/_/g, ' ');
  const randomConfidence = Math.random() * (0.98 - 0.75) + 0.75;

  let healthStatus: 'Healthy' | 'Moderate' | 'Poor';
  let recommendations: string;

  if (randomDiseaseKey.includes('healthy')) {
    healthStatus = 'Healthy';
    recommendations = 'The plant appears to be healthy. Continue with regular monitoring and care routines. Ensure proper watering and nutrient levels to maintain plant health.';
  } else if (randomDiseaseKey.includes('Late_blight') || randomDiseaseKey.includes('Virus')) {
    healthStatus = 'Poor';
    recommendations = 'This is a severe condition. Isolate the affected plants immediately to prevent spread. Apply a targeted fungicide or antiviral treatment as recommended by a local agricultural extension service. Remove and destroy heavily infected plant matter.';
  } else {
    healthStatus = 'Moderate';
    recommendations = 'This condition is treatable. Apply a suitable fungicide or pesticide. Prune affected leaves and ensure good air circulation around the plants. Adjust watering practices to avoid overly moist conditions.';
  }

  return {
    healthStatus,
    diseaseName: healthStatus === 'Healthy' ? 'Healthy' : diseaseName,
    confidence: parseFloat(randomConfidence.toFixed(2)),
    recommendations,
  };
}

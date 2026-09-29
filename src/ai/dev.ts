'use server';
import { config } from 'dotenv';
config({ path: '.env.local' });
config();

// The Genkit-related imports are no longer needed as the flows have been replaced.
// You can remove them or leave them if you plan to re-integrate Genkit later.
// import '@/ai/flows/crop-disease-detection.ts';
// import '@/ai/flows/crop-recommendation.ts';
// import '@/ai/flows/yield-prediction.ts';
// import '@/ai/flows/soil-nutrient-analysis.ts';
// import '@/ai/flows/weather-forecast.ts';
// import '@/ai/flows/ai-farmer.ts';


'use server';
/**
 * @fileOverview Fetches weather forecast data based on geographical coordinates.
 *
 * - getWeatherForecast - A function that returns current weather and a 5-day forecast.
 * - WeatherForecastInput - The input type for the getWeatherForecast function.
 * - WeatherForecastOutput - The return type for the getWeatherForecast function.
 */

import { z } from 'zod';

const WeatherForecastInputSchema = z.object({
  lat: z.number().describe('The latitude for the weather forecast.'),
  lon: z.number().describe('The longitude for the weather forecast.'),
});
export type WeatherForecastInput = z.infer<typeof WeatherForecastInputSchema>;

const CurrentWeatherSchema = z.object({
  location: z.string(),
  temp: z.number(),
  condition: z.string(),
  icon: z.string(),
  wind: z.number(),
  humidity: z.number(),
});

const DailyForecastSchema = z.object({
  day: z.string(),
  temp: z.number(),
  icon: z.string(),
});

const WeatherForecastOutputSchema = z.object({
  current: CurrentWeatherSchema,
  forecast: z.array(DailyForecastSchema),
});
export type WeatherForecastOutput = z.infer<typeof WeatherForecastOutputSchema>;

async function fetchWeatherData(lat: number, lon: number) {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('WEATHER_API_KEY is not set.');
  }
  const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=6`;

  const response = await fetch(forecastUrl);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Weather API Error:", errorBody);
    throw new Error('Failed to fetch weather data.');
  }

  const data = await response.json();
  return data;
}


export async function getWeatherForecast(
  input: WeatherForecastInput
): Promise<WeatherForecastOutput> {
    const weatherData = await fetchWeatherData(input.lat, input.lon);

    const output: WeatherForecastOutput = {
      current: {
        location: weatherData.location.name,
        temp: Math.round(weatherData.current.temp_f),
        condition: weatherData.current.condition.text,
        icon: weatherData.current.condition.icon,
        wind: Math.round(weatherData.current.wind_mph),
        humidity: weatherData.current.humidity,
      },
      forecast: weatherData.forecast.forecastday.slice(1).map((item: any) => ({
        day: new Date(item.date_epoch * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(item.day.avgtemp_f),
        icon: item.day.condition.icon,
      })),
    };
    return output;
}

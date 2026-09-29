
"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Wind, Droplets, Loader2, AlertTriangle, LocateIcon } from "lucide-react";
import { getWeatherForecast, WeatherForecastOutput } from "@/ai/flows/weather-forecast";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAgroStore } from "@/lib/store";
import { useTranslation } from "@/lib/translation";

const WeatherIcon = ({ iconCode, ...props }: { iconCode: string } & Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) => {
    if (!iconCode) return null;
    // WeatherAPI provides full URLs for icons
    const iconUrl = iconCode.startsWith('//') ? `https:${iconCode}` : iconCode;
    return (
        <Image
            src={iconUrl}
            alt="Weather icon"
            unoptimized
            {...props}
        />
    )
};

export default function WeatherPage() {
    const { weatherData, setWeatherData, isLoading, setIsLoading, error, setError } = useAgroStore();
    const { toast } = useToast();
    const { t } = useTranslation();

    const fetchWeather = useCallback((lat: number, lon: number) => {
        setIsLoading(true);
        getWeatherForecast({ lat, lon })
            .then(data => {
                setWeatherData(data);
                setError(null);
            })
            .catch(e => {
                console.error(e);
                setError(t('weather.errorFetch'));
                toast({
                    variant: "destructive",
                    title: t('weather.error'),
                    description: t('weather.errorFetch'),
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [setIsLoading, setWeatherData, setError, toast, t]);

    const handleFetchWeatherForCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setError(t('weather.errorLocation'));
                    toast({
                        variant: "destructive",
                        title: t('weather.errorLocationDenied'),
                        description: t('weather.errorLocationDeniedDesc'),
                    });
                    setIsLoading(false);
                }
            );
        } else {
            setError(t('weather.errorGeolocation'));
            toast({
                variant: "destructive",
                title: t('weather.errorGeolocationNotSupported'),
                description: t('weather.errorGeolocationNotSupportedDesc'),
            });
            setIsLoading(false);
        }
    };


    useEffect(() => {
        // Fetch weather only if there's no data yet
        if (!weatherData && !error && !isLoading) {
            handleFetchWeatherForCurrentLocation();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


  return (
    <div className="container space-y-8 py-8">
      <div className="flex justify-between items-center">
        <PageHeader
            title={t('weather.title')}
            description={t('weather.description')}
        />
        <Button onClick={handleFetchWeatherForCurrentLocation} disabled={isLoading}>
            <LocateIcon className="mr-2 h-4 w-4" />
            {t('weather.getCurrentLocation')}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{t('weather.fetching')}</p>
        </div>
      ) : error ? (
        <Card className="bg-destructive/10 border-destructive text-destructive-foreground">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle />
                    {t('weather.error')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
                 <Button onClick={handleFetchWeatherForCurrentLocation} variant="secondary" className="mt-4">
                    {t('weather.retry')}
                </Button>
            </CardContent>
        </Card>
      ) : weatherData ? (
        <div className="grid gap-8 md:grid-cols-5">
            <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {weatherData.current.location}
                </CardTitle>
                <CardDescription>{t('weather.currentWeather')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center">
                <WeatherIcon iconCode={weatherData.current.icon} width={100} height={100} />
                <p className="text-7xl font-bold">{weatherData.current.temp}°F</p>
                <p className="text-muted-foreground">{weatherData.current.condition}</p>
                <div className="mt-6 flex justify-around w-full text-sm">
                    <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-muted-foreground"/>
                        <span>{weatherData.current.wind} mph</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-muted-foreground"/>
                        <span>{weatherData.current.humidity}%</span>
                    </div>
                </div>
            </CardContent>
            </Card>

            <Card className="md:col-span-3">
            <CardHeader>
                <CardTitle>{t('weather.fiveDayForecast')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-around">
                {weatherData.forecast.map((day) => (
                    <div key={day.day} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                    <p className="font-semibold text-muted-foreground">{day.day}</p>
                    <WeatherIcon iconCode={day.icon} width={50} height={50} />
                    <p className="font-bold">{day.temp}°F</p>
                    </div>
                ))}
                </div>
            </CardContent>
            </Card>
        </div>
      ) : <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t('weather.fetchForLocation')}</p>
        </div>}
    </div>
  );
}

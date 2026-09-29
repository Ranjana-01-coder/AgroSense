'use client';
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart,
  Bot,
  CloudSun,
  FlaskConical,
  Leaf,
  PieChart,
  PlayCircle,
  Settings,
  Sprout,
  User
} from "lucide-react";
import { useTranslation } from "@/lib/translation";
import Image from "next/image";

export default function HomePage() {
  const { t } = useTranslation();
    
  const features = [
   {
    id: "aiFarmer",
    icon: <Bot className="h-8 w-8 text-primary" />,
    href: "/dashboard/ai-farmer",
  },
  {
    id: "diseaseDetection",
    icon: <Leaf className="h-8 w-8 text-primary" />,
    href: "/dashboard/disease-detection",
  },
  {
    id: "soilAnalysis",
    icon: <FlaskConical className="h-8 w-8 text-primary" />,
    href: "/dashboard/soil-analysis",
  },
  {
    id: "weather",
    icon: <CloudSun className="h-8 w-8 text-primary" />,
    href: "/dashboard/weather",
  },
  {
    id: "cropRecommendation",
    icon: <Sprout className="h-8 w-8 text-primary" />,
    href: "/dashboard/crop-recommendation",
  },
  {
    id: "yieldPrediction",
    icon: <BarChart className="h-8 w-8 text-primary" />,
    href: "/dashboard/yield-prediction",
  },
  {
    id: "reports",
    icon: <PieChart className="h-8 w-8 text-primary" />,
    href: "/dashboard/reports",
  },
   {
    id: "tutorials",
    icon: <PlayCircle className="h-8 w-8 text-primary" />,
    href: "/dashboard/tutorials",
  },
  {
    id: "profile",
    icon: <User className="h-8 w-8 text-primary" />,
    href: "/dashboard/profile",
  },
  {
    id: "settings",
    icon: <Settings className="h-8 w-8 text-primary" />,
    href: "/dashboard/settings",
  }
];

  return (
    <div className="container relative">
      <section className="relative flex flex-col items-center justify-center text-center py-12 md:py-24">
        <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-primary shadow-lg mb-4">
            <Image 
                src="https://easydrawingguides.com/wp-content/uploads/2024/06/Plant_plant-drawing-tutorial.png"
                alt="AgroSense Logo"
                fill
                className="object-cover"
            />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
          AgroSense
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          {t('dashboard.description')}
        </p>
      </section>

      <section className="pb-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                {feature.icon}
                <div>
                  <CardTitle className="font-headline">{t(`dashboard.features.${feature.id}.title`)}</CardTitle>
                  <CardDescription>{t(`dashboard.features.${feature.id}.description`)}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={feature.href}>
                    {t('dashboard.goTo', { feature: t(`dashboard.features.${feature.id}.title`) })} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

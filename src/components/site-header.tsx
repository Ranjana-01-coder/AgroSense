
'use client';
import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button";
import { Menu, Sprout } from "lucide-react";
import { useTranslation } from "@/lib/translation";

export function SiteHeader() {
  const { t } = useTranslation();

  const navItems = [
    { href: "/", label: t('common.dashboard')},
    { href: "/ai-farmer", label: t('common.aiFarmer')},
    { href: "/disease-detection", label: t('common.diseaseDetection')},
    { href: "/soil-analysis", label: t('common.soilAnalysis')},
    { href: "/weather", label: t('common.weatherForecast')},
    { href: "/crop-recommendation", label: t('common.cropRecommendation')},
    { href: "/yield-prediction", label: t('common.yieldPrediction')},
    { href: "/reports", label: t('common.reports')},
    { href: "/tutorials", label: t('common.tutorials')},
    { href: "/settings", label: t('common.settings')},
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="h-8 w-8 relative rounded-full overflow-hidden">
                <Image 
                    src="https://easydrawingguides.com/wp-content/uploads/2024/06/Plant_plant-drawing-tutorial.png"
                    alt="AgroSense Logo"
                    fill
                    className="object-cover"
                />
            </div>
            <span className="font-bold sm:inline-block">
              AgroSense
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navItems.slice(1, 5).map(item => (
                <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground/80 text-foreground/60">{item.label}</Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Sprout className="h-6 w-6" />
                    <span className="font-bold">AgroSense</span>
                </Link>
                <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                    <div className="flex flex-col space-y-3">
                         {navItems.map(item => (
                            <Link key={item.href} href={item.href} className="text-foreground">{item.label}</Link>
                        ))}
                    </div>
                </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}

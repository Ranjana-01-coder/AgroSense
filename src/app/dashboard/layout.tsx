
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Bot,
  FlaskConical,
  CloudSun,
  Sprout,
  BarChart,
  PieChart,
  PlayCircle,
  Settings,
  User,
  Leaf,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserNav } from '@/components/user-nav';
import { useTranslation } from '@/lib/translation';
import Image from 'next/image';

const navItems = [
  { href: '/dashboard', label: 'common.dashboard', icon: Home },
  { href: '/dashboard/ai-farmer', label: 'common.aiFarmer', icon: Bot },
  {
    href: '/dashboard/disease-detection',
    label: 'common.diseaseDetection',
    icon: Leaf,
  },
  {
    href: '/dashboard/soil-analysis',
    label: 'common.soilAnalysis',
    icon: FlaskConical,
  },
  { href: '/dashboard/weather', label: 'common.weatherForecast', icon: CloudSun },
  {
    href: '/dashboard/crop-recommendation',
    label: 'common.cropRecommendation',
    icon: Sprout,
  },
  {
    href: '/dashboard/yield-prediction',
    label: 'common.yieldPrediction',
    icon: BarChart,
  },
  { href: '/dashboard/reports', label: 'common.reports', icon: PieChart },
  { href: '/dashboard/tutorials', label: 'common.tutorials', icon: PlayCircle },
  { href: '/dashboard/settings', label: 'common.settings', icon: Settings },
];

const secondaryNavItems = [
  { href: '/dashboard/profile', label: 'common.profile', icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 relative rounded-full overflow-hidden">
                <Image 
                    src="https://easydrawingguides.com/wp-content/uploads/2024/06/Plant_plant-drawing-tutorial.png"
                    alt="AgroSense Logo"
                    fill
                    className="object-cover"
                />
            </div>
            <span className="text-lg font-semibold">AgroSense</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={t(item.label)}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{t(item.label)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <UserNav />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background p-4 md:h-auto md:p-2">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1"></div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

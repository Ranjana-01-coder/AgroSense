
'use client';
import { PageHeader } from "@/components/page-header";
import { ThemeSelector } from "@/components/theme-selector";
import { LanguageSelector } from "@/components/language-selector";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { useTranslation } from "@/lib/translation";
import { FeedbackForm } from "@/components/feedback-form";

export default function SettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="container space-y-8 max-w-2xl mx-auto py-8">
      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />
      
      <Card>
        <CardHeader>
            <CardTitle>{t('settings.appearance')}</CardTitle>
            <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <ThemeSelector />
            <LanguageSelector />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>{t('settings.feedbackTitle')}</CardTitle>
            <CardDescription>{t('settings.feedbackDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
            <FeedbackForm />
        </CardContent>
      </Card>

    </div>
  );
}

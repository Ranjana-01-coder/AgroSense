
'use client';
import { PageHeader } from "@/components/page-header";
import YieldPredictionForm from "./yield-prediction-form";
import { useTranslation } from "@/lib/translation";

export default function YieldPredictionPage() {
  const { t } = useTranslation();
  return (
    <div className="container space-y-8 py-8">
      <PageHeader
        title={t('yieldPrediction.title')}
        description={t('yieldPrediction.description')}
      />
      <YieldPredictionForm />
    </div>
  );
}

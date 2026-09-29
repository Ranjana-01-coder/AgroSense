
'use client';
import { PageHeader } from "@/components/page-header";
import CropRecommendationForm from "./crop-recommendation-form";
import { useTranslation } from "@/lib/translation";

export default function CropRecommendationPage() {
  const { t } = useTranslation();
  return (
    <div className="container space-y-8 py-8">
      <PageHeader
        title={t('cropRecommendation.title')}
        description={t('cropRecommendation.description')}
      />
      <CropRecommendationForm />
    </div>
  );
}

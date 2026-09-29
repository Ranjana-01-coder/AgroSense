
'use client';
import { PageHeader } from "@/components/page-header";
import DiseaseDetectionForm from "./disease-detection-form";
import { useTranslation } from "@/lib/translation";

export default function DiseaseDetectionPage() {
  const { t } = useTranslation();
  return (
    <div className="container space-y-8 py-8">
      <PageHeader
        title={t('diseaseDetection.title')}
        description={t('diseaseDetection.description')}
      />
      <DiseaseDetectionForm />
    </div>
  );
}

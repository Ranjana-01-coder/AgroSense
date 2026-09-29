
'use client';
import { PageHeader } from "@/components/page-header";
import SoilAnalysisForm from "./soil-analysis-form";
import { useTranslation } from "@/lib/translation";

export default function SoilAnalysisPage() {
  const { t } = useTranslation();
  return (
    <div className="container space-y-8 py-8">
      <PageHeader
        title={t('soilAnalysis.title')}
        description={t('soilAnalysis.description')}
      />
      <SoilAnalysisForm />
    </div>
  );
}

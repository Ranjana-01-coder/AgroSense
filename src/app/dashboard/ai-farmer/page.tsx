
'use client';
import { PageHeader } from "@/components/page-header";
import { AIFarmerChat } from "./ai-farmer-chat";
import { useTranslation } from "@/lib/translation";

export default function AIFarmerPage() {
  const { t } = useTranslation();
  return (
    <div className="container py-8 h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader
        title={t('aiFarmer.title')}
        description={t('aiFarmer.description')}
      />
      <div className="flex-1 mt-6">
        <AIFarmerChat />
      </div>
    </div>
  );
}

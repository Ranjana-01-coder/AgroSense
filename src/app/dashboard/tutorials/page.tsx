
'use client';
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "@/lib/translation";

export default function TutorialsPage() {
  const { t } = useTranslation();
  return (
    <div className="container space-y-8 py-8">
      <PageHeader
        title={t('tutorials.title')}
        description={t('tutorials.description')}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('tutorials.gettingStarted')}</CardTitle>
          <CardDescription>
            {t('tutorials.videoWalkthrough')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            {/* Using a placeholder YouTube video */}
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            ></iframe>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('tutorials.howToGuides')}</CardTitle>
          <CardDescription>
            {t('tutorials.howToGuidesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                {t('tutorials.diseaseDetectionGuide.title')}
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <p className="flex items-start">
                  <CheckCircle className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>
                    {t('tutorials.diseaseDetectionGuide.step1')}
                  </span>
                </p>
                <p className="flex items-start">
                  <CheckCircle className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>
                    {t('tutorials.diseaseDetectionGuide.step2')}
                  </span>
                </p>
                <p className="flex items-start">
                  <CheckCircle className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>
                    {t('tutorials.diseaseDetectionGuide.step3')}
                  </span>
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                {t('tutorials.cropRecommendationGuide.title')}
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                 <p className="flex items-start">
                  <CheckCircle className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>
                    {t('tutorials.cropRecommendationGuide.step1')}
                  </span>
                </p>
                <p className="flex items-start">
                  <CheckCircle className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>
                   {t('tutorials.cropRecommendationGuide.step2')}
                  </span>
                </p>
                <p className="flex items-start">
                  <CheckCircle className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>
                    {t('tutorials.cropRecommendationGuide.step3')}
                  </span>
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>{t('tutorials.profileGuide.title')}</AccordionTrigger>
              <AccordionContent className="space-y-2">
                 <p className="flex items-start">
                  <CheckCircle className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>
                   {t('tutorials.profileGuide.step1')}
                  </span>
                </p>
                <p className="flex items-start">
                  <CheckCircle className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>
                   {t('tutorials.profileGuide.step2')}
                  </span>
                </p>
                <p className="flex items-start">
                  <CheckCircle className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>
                   {t('tutorials.profileGuide.step3')}
                  </span>
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

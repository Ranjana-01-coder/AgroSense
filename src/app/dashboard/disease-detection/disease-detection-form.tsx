

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { detectCropDisease, DetectCropDiseaseOutput } from "@/ai/flows/crop-disease-detection";
import { diseaseDetectionSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload, Download, Leaf, ShieldCheck, Percent, AlertTriangle, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAgroStore } from "@/lib/store";
import { useTranslation } from "@/lib/translation";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, serverTimestamp } from "firebase/firestore";

type FormData = z.infer<typeof diseaseDetectionSchema>;

export default function DiseaseDetectionForm() {
  const [result, setResult] = useState<DetectCropDiseaseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useAgroStore();
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<FormData>({
    resolver: zodResolver(diseaseDetectionSchema),
  });

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setResult(null);

    try {
      const photoDataUri = await toBase64(data.image[0]);
      const response = await detectCropDisease({ photoDataUri, language });
      setResult(response);

      if (user) {
        const reportData = {
          userId: user.uid,
          imageUrl: "user_upload", 
          detectedDisease: response.diseaseName,
          confidenceLevel: response.confidence,
          reportDate: serverTimestamp(),
        };
        const reportsRef = collection(firestore, 'users', user.uid, 'reports');
        addDocumentNonBlocking(reportsRef, reportData);
      }

    } catch (error) {
      console.error("Error detecting disease:", error);
      toast({
        variant: "destructive",
        title: t('diseaseDetection.errorTitle'),
        description: t('diseaseDetection.errorDescription'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFileName(file.name);
      form.setValue("image", event.target.files!);
    }
  };
  
  const handleDownload = () => {
    if (!result) return;
    const reportContent = `
=================================
    ${t('diseaseDetection.report.title')}
=================================

${t('diseaseDetection.report.status').toUpperCase()}: ${result.healthStatus}
${t('diseaseDetection.report.disease').toUpperCase()}: ${result.diseaseName}
${t('diseaseDetection.report.certainty').toUpperCase()}: ${Math.round(result.confidence * 100)}%

${t('diseaseDetection.report.advice').toUpperCase()}
---------------------------------
${result.recommendations}
    `;

    const blob = new Blob([reportContent.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crop-health-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('diseaseDetection.uploadTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('diseaseDetection.uploadTitle')}</FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                         <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            <Upload className="h-4 w-4" />
                            {t('diseaseDetection.chooseFile')}
                        </label>
                      </div>
                    </FormControl>
                    {fileName && <p className="text-sm text-muted-foreground mt-2">{t('diseaseDetection.selectedFile', { fileName })}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {preview && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">{t('diseaseDetection.imagePreview')}</p>
                  <Image
                    src={preview}
                    alt="Crop preview"
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="cursor-pointer">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('diseaseDetection.analyzeImage')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {isLoading ? (
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>{t('diseaseDetection.analysisResult')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">{t('diseaseDetection.analyzing')}</p>
              </div>
            </CardContent>
          </Card>
        ) : result ? (
          <>
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>{t('diseaseDetection.analysisResult')}</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="cursor-pointer">
                      <Download className="mr-2 h-4 w-4" />
                      {t('common.downloadReport')}
                  </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                      {result.healthStatus === 'Healthy' ? <ShieldCheck className="h-10 w-10 text-green-600" /> : result.healthStatus === 'Moderate' ? <Leaf className="h-10 w-10 text-yellow-500" /> : <AlertTriangle className="h-10 w-10 text-destructive" />}
                      <div>
                          <CardDescription>{t('diseaseDetection.healthStatus')}</CardDescription>
                          <p className="text-2xl font-bold">{result.healthStatus}</p>
                      </div>
                  </div>

                  {result.healthStatus !== 'Healthy' && (
                    <div className="flex items-center gap-4">
                        <Leaf className="h-10 w-10 text-primary" />
                        <div>
                            <CardDescription>{t('diseaseDetection.report.disease')}</CardDescription>
                            <p className="text-xl font-bold">{result.diseaseName}</p>
                        </div>
                    </div>
                  )}

                  <div className="space-y-2">
                      <div className="flex justify-between items-center">
                          <CardDescription className="flex items-center gap-2"><Percent className="h-4 w-4"/> {t('diseaseDetection.confidence')}</CardDescription>
                          <span className="font-bold text-lg">{Math.round(result.confidence * 100)}%</span>
                      </div>
                      <Progress value={result.confidence * 100} className="w-full" />
                  </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-primary" />
                  {t('diseaseDetection.recommendations')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {result.recommendations}
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
           <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>{t('diseaseDetection.analysisResult')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <p>{t('diseaseDetection.uploadToSee')}</p>
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

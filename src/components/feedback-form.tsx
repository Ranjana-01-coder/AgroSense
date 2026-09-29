'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/translation';

const feedbackSchema = z.object({
  feedback: z.string().min(10, 'Feedback must be at least 10 characters long.'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export function FeedbackForm() {
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: '',
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    // In a real app, you would send this to a backend service
    console.log('Feedback submitted:', data.feedback);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: t('settings.feedbackSuccessTitle'),
      description: t('settings.feedbackSuccessDesc'),
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.yourFeedback')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('settings.feedbackPlaceholder')}
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('settings.submitFeedback')}
        </Button>
      </form>
    </Form>
  );
}

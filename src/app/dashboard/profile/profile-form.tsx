
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
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';
import { useEffect, useState } from 'react';
import {
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useTranslation } from '@/lib/translation';
import indianStates from '@/lib/india-states-districts.json';


const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce.number().int().positive().optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email.').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  cityVillage: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  landSize: z.coerce.number().positive().optional().or(z.literal('')),
  soilType: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  name: '',
  email: '',
  phoneNumber: '',
  age: '',
  address: '',
  cityVillage: '',
  district: '',
  state: '',
  landSize: '',
  soilType: '',
};

export function ProfileForm() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const userRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: profileData, isLoading: loading } = useDoc(userRef);
  
  const [districts, setDistricts] = useState<string[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultValues,
  });
  
  const selectedState = form.watch("state");

  useEffect(() => {
    if (selectedState) {
        const stateData = indianStates.states.find(s => s.state === selectedState);
        setDistricts(stateData ? stateData.districts : []);
    } else {
        setDistricts([]);
    }
  }, [selectedState]);


  useEffect(() => {
    if (!loading && (user || profileData)) {
      const initialData = {
        ...defaultValues,
        name: profileData?.name || user?.displayName || '',
        email: profileData?.email || user?.email || '',
        phoneNumber: profileData?.phoneNumber || user?.phoneNumber || '',
        ...profileData,
      };
      form.reset(initialData);

      if (initialData.state) {
        const stateData = indianStates.states.find(s => s.state === initialData.state);
        setDistricts(stateData ? stateData.districts : []);
      }
    }
  }, [user, profileData, loading, form.reset]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!userRef) return;

    try {
      const dataToSave = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== '' && value !== undefined)
      );

      await setDocumentNonBlocking(userRef, {
        ...dataToSave,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: t('profile.profileUpdatedTitle'),
        description: t('profile.profileUpdatedDesc'),
      });
      form.reset(data, { keepValues: true, keepDirty: false });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t('profile.profileUpdateError'),
      });
    }
  };
  
  const handleStateChange = (stateValue: string) => {
      form.setValue('state', stateValue);
      form.setValue('district', ''); // Reset district when state changes
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.personalInfo')}</CardTitle>
            <CardDescription>{t('profile.personalInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profile.fullName')}</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profile.age')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profile.phoneNumber')}</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t('profile.address')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('profile.state')}</FormLabel>
                    <Select onValueChange={handleStateChange} value={field.value || ""}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={t('yieldPrediction.selectState')} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {indianStates.states.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('profile.district')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""} disabled={!selectedState}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={t('yieldPrediction.selectDistrict')} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="cityVillage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profile.cityVillage')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('profile.landInfo')}</CardTitle>
            <CardDescription>{t('profile.landInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="landSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profile.landSize')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="soilType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profile.soilType')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Alluvial, Black" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('common.saveChanges')}
        </Button>
      </form>
    </Form>
  );
}

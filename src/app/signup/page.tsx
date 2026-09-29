
'use client';
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
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithEmail } from '@/firebase/auth/auth-service';
import { useTranslation } from '@/lib/translation';
import Image from 'next/image';
import { useAuth } from '@/firebase';

const signupSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();
  const auth = useAuth();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signUpWithEmail(auth, data.email, data.password);
      toast({
        title: t('signup.accountCreatedTitle'),
        description: t('signup.accountCreatedDescription'),
      });
      router.push('/dashboard/profile');
    } catch (error) {
      console.error('Signup failed:', error);
      toast({
        variant: 'destructive',
        title: t('signup.signupFailedTitle'),
        description: t('signup.signupFailedDescription'),
      });
    }
  };

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
       <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
            <div className="h-8 w-8 relative mr-2 rounded-full overflow-hidden">
                <Image 
                    src="https://easydrawingguides.com/wp-content/uploads/2024/06/Plant_plant-drawing-tutorial.png"
                    alt="AgroSense Logo"
                    fill
                    className="object-cover"
                />
            </div>
          AgroSense
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This tool has transformed how I manage my farm. The AI-powered insights are invaluable!&rdquo;
            </p>
            <footer className="text-sm">A Happy Farmer</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('signup.createAccount')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('signup.prompt')}
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('signup.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('signup.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {t('signup.createAccount')}
              </Button>
            </form>
          </Form>

          <p className="px-8 text-center text-sm text-muted-foreground">
            {t('signup.haveAccount')}{' '}
            <Link
              href="/"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t('login.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

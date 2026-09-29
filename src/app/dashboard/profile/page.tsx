'use client';
import { PageHeader } from '@/components/page-header';
import { ProfileForm } from './profile-form';
import { useTranslation } from '@/lib/translation';

export default function ProfilePage() {
  const { t } = useTranslation();
  return (
    <div className="container space-y-8 py-8">
      <PageHeader
        title={t('profile.title')}
        description={t('profile.description')}
      />
      <ProfileForm />
    </div>
  );
}

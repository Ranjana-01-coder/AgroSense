'use client';

import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/translation';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label htmlFor="theme-select">{t('settings.theme')}</Label>
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger className="w-full" id="theme-select">
          <SelectValue placeholder={t('settings.selectTheme')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">{t('settings.light')}</SelectItem>
          <SelectItem value="dark">{t('settings.dark')}</SelectItem>
          <SelectItem value="system">{t('settings.system')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

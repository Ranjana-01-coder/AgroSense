

"use client";

import { useAgroStore, languages, Language } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/translation";
import { Label } from "./ui/label";

export function LanguageSelector() {
  const { language, setLanguage } = useAgroStore();
  const { t } = useTranslation();

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
  };

  return (
    <div className="space-y-2">
        <Label htmlFor="language-select">{t('settings.language')}</Label>
        <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full" id="language-select">
                <SelectValue placeholder={t('languageSelector.selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
                {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                        {lang}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
  );
}

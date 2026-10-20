'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export const CopyLinkButton = ({ url }: { url: string }) => {
  const t = useTranslations('Dashboard');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (e.g. non-secure context); do nothing.
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="border border-border"
      onClick={handleCopy}
    >
      {copied ? t('copied') : t('copy_link')}
    </Button>
  );
};

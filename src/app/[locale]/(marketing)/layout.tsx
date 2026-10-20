import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/libs/I18nNavigation';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });

  return (
    <BaseTemplate
      leftNav={(
        <>
          <li>
            <Link
              href="/"
              className="border-none text-foreground/80 hover:text-foreground"
            >
              {t('home_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="border-none text-foreground/80 hover:text-foreground"
            >
              {t('about_link')}
            </Link>
          </li>
        </>
      )}
      rightNav={(
        <>
          <li>
            <Link
              href="/sign-in"
              className="border-none text-foreground/80 hover:text-foreground"
            >
              {t('sign_in_link')}
            </Link>
          </li>

          <li>
            <Link
              href="/sign-up"
              className="border-none text-foreground/80 hover:text-foreground"
            >
              {t('sign_up_link')}
            </Link>
          </li>

          <li>
            <LocaleSwitcher />
          </li>
        </>
      )}
    >
      {props.children}
    </BaseTemplate>
  );
}

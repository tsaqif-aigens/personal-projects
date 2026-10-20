import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground antialiased">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <a href="/" className="font-serif text-2xl font-semibold tracking-tight">
            {AppConfig.name}
          </a>

          <nav
            aria-label="Main navigation"
            className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm font-medium"
          >
            <ul className="flex flex-wrap items-center gap-x-6">
              {props.leftNav}
            </ul>
            {props.rightNav ? (
              <ul className="flex flex-wrap items-center gap-x-6">
                {props.rightNav}
              </ul>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="flex-1">{props.children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
          <p>
            © Copyright {year} {AppConfig.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

import type { PropsWithChildren, ReactNode } from 'react';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}>;

export function PageContainer({ title, subtitle, actions, children }: Props) {
  return (
    <section className="modern-page">
      <header className="modern-page__header">
        <div>
          <h3 className="modern-page__title">{title}</h3>
          {subtitle ? <p className="modern-page__subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="modern-page__actions">{actions}</div> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}


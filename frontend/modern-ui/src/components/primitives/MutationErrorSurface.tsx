type Props = {
  message: string;
  className?: string;
};

export function MutationErrorSurface({ message, className = '' }: Props) {
  const normalized = String(message || '').trim();
  if (normalized === '') {
    return null;
  }

  const nextClassName = `modern-state modern-state--error ${className}`.trim();
  return (
    <div className={nextClassName} role="alert">
      {normalized}
    </div>
  );
}

type Props = {
  message: string;
};

export function EmptyState({ message }: Props) {
  return (
    <div className="modern-state modern-state--empty">
      <div className="modern-empty-illustration" aria-hidden="true">
        <svg viewBox="0 0 120 80" role="presentation">
          <rect x="8" y="10" width="104" height="60" rx="12" className="modern-empty-illustration__frame" />
          <circle cx="36" cy="36" r="8" className="modern-empty-illustration__dot" />
          <rect x="50" y="31" width="40" height="6" rx="3" className="modern-empty-illustration__line" />
          <rect x="24" y="48" width="66" height="5" rx="2.5" className="modern-empty-illustration__line modern-empty-illustration__line--soft" />
        </svg>
      </div>
      <div>{message}</div>
    </div>
  );
}

type Props = {
  message: string;
  actionLabel?: string;
  actionURL?: string;
};

export function ErrorState({ message, actionLabel, actionURL }: Props) {
  return (
    <div className="modern-state modern-state--error">
      <p>{message}</p>
      {actionLabel && actionURL ? (
        <a className="modern-btn modern-btn--secondary" href={actionURL}>
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}


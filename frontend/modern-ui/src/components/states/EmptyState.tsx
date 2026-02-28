type Props = {
  message: string;
};

export function EmptyState({ message }: Props) {
  return <div className="modern-state">{message}</div>;
}


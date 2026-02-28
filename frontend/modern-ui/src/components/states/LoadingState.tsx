type Props = {
  message?: string;
};

export function LoadingState({ message = 'Loading...' }: Props) {
  return <div className="modern-state">{message}</div>;
}


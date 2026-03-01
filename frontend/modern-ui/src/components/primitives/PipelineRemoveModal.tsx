import { useEffect, useState } from 'react';
import { MutationErrorSurface } from './MutationErrorSurface';

type Props = {
  isOpen: boolean;
  title: string;
  description: string;
  pending: boolean;
  error: string;
  onCancel: () => void;
  onSubmit: (note: string) => void;
};

export function PipelineRemoveModal({
  isOpen,
  title,
  description,
  pending,
  error,
  onCancel,
  onSubmit
}: Props) {
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      setNote('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modern-inline-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modern-inline-modal__dialog modern-inline-modal__dialog--status modern-inline-modal__dialog--compact">
        <div className="modern-inline-modal__header">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className="modern-inline-modal__body modern-inline-modal__body--form">
          <label className="modern-command-field">
            <span className="modern-command-label">Removal Note (Optional)</span>
            <textarea
              className="avel-form-control"
              rows={4}
              value={note}
              placeholder="Add context for this removal."
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <MutationErrorSurface message={error} />
        </div>
        <div className="modern-inline-modal__actions">
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button
            type="button"
            className="modern-btn modern-btn--danger"
            onClick={() => onSubmit(note)}
            disabled={pending}
          >
            {pending ? 'Removing...' : 'Remove From Pipeline'}
          </button>
        </div>
      </div>
    </div>
  );
}

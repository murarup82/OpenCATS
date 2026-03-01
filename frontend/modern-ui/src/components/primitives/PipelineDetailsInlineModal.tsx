type Props = {
  isOpen: boolean;
  title: string;
  html: string;
  loading: boolean;
  error: string;
  onClose: () => void;
  onOpenFullDetails?: () => void;
};

export function PipelineDetailsInlineModal({
  isOpen,
  title,
  html,
  loading,
  error,
  onClose,
  onOpenFullDetails
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modern-inline-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modern-inline-modal__dialog modern-inline-modal__dialog--status">
        <div className="modern-inline-modal__header">
          <h3>{title}</h3>
          <p>Pipeline timeline and transition history</p>
        </div>
        <div className="modern-inline-modal__actions">
          {onOpenFullDetails ? (
            <button type="button" className="modern-btn modern-btn--secondary" onClick={onOpenFullDetails}>
              Open Full Details
            </button>
          ) : null}
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modern-inline-modal__body modern-inline-modal__body--html">
          {loading ? <div className="modern-state">Loading pipeline details...</div> : null}
          {!loading && error !== '' ? <div className="modern-state modern-state--error">{error}</div> : null}
          {!loading && error === '' ? (
            <div
              className="modern-inline-modal__html-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}


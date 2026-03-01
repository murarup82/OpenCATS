type Props = {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  url: string;
  onClose: (refreshOnClose: boolean) => void;
  onOpenPopup?: () => void;
  showRefreshClose?: boolean;
};

export function LegacyFrameModal({
  isOpen,
  title,
  subtitle,
  url,
  onClose,
  onOpenPopup: _onOpenPopup,
  showRefreshClose = true
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modern-inline-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modern-inline-modal__dialog modern-inline-modal__dialog--status">
        <div className="modern-inline-modal__header">
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <div className="modern-inline-modal__actions">
          <button type="button" className="modern-btn modern-btn--secondary" onClick={() => onClose(false)}>
            Close
          </button>
          {showRefreshClose ? (
            <button type="button" className="modern-btn modern-btn--emphasis" onClick={() => onClose(true)}>
              Close And Refresh
            </button>
          ) : null}
        </div>
        <div className="modern-inline-modal__body">
          <iframe title={title} src={url} className="modern-inline-modal__frame" />
        </div>
      </div>
    </div>
  );
}

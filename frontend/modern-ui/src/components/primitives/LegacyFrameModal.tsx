import { InlineModal } from '../../ui-core';

type Props = {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  url: string;
  onClose: (refreshOnClose: boolean) => void;
  showRefreshClose?: boolean;
};

export function LegacyFrameModal({
  isOpen,
  title,
  subtitle,
  url,
  onClose,
  showRefreshClose = true
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <InlineModal
      isOpen={isOpen}
      ariaLabel={title}
      dialogClassName="modern-inline-modal__dialog--status"
      onClose={() => onClose(false)}
    >
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
    </InlineModal>
  );
}

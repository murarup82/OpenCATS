import type { UIModeBootstrap } from '../../types';

type Props = {
  bootstrap: UIModeBootstrap;
};

type FeedbackWindow = Window & {
  CATSFeedback_openModal?: () => void;
};

export function GlobalFeedbackFooter({ bootstrap }: Props) {
  const openFeedback = () => {
    const feedbackWindow = window as FeedbackWindow;
    if (typeof feedbackWindow.CATSFeedback_openModal === 'function') {
      feedbackWindow.CATSFeedback_openModal();
      return;
    }

    window.location.href = `${bootstrap.indexName}?m=home&a=submitfeedback&ui=modern`;
  };

  return (
    <footer className="modern-global-feedback" role="contentinfo" aria-label="Feedback and release footer">
      <div className="modern-global-feedback__copy">
        <strong>Improve AVEL Technologies ATS System</strong>
        <span>Please use the "Submit Feedback" button to report bugs or request new features.</span>
      </div>
      <button
        type="button"
        className="modern-btn modern-btn--secondary modern-global-feedback__cta"
        onClick={openFeedback}
      >
        Submit Feedback
      </button>
    </footer>
  );
}


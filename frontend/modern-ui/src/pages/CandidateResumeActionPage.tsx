import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchCandidateResumeModernData } from '../lib/api';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { useServerQueryState } from '../lib/useServerQueryState';
import type { CandidateResumeModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text: string, query: string): ReactNode {
  const normalizedQuery = query.trim();
  if (normalizedQuery === '') {
    return text;
  }

  const pattern = new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'ig');
  const parts = text.split(pattern);
  if (parts.length <= 1) {
    return text;
  }

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <mark key={`resume-mark-${index}`} style={{ background: '#fff2a6', color: '#2c2c2c' }}>
          {part}
        </mark>
      );
    }
    return <span key={`resume-part-${index}`}>{part}</span>;
  });
}

export function CandidateResumeActionPage({ bootstrap }: Props) {
  const [data, setData] = useState<CandidateResumeModernDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchCandidateResumeModernData(bootstrap, query)
      .then((payload) => {
        if (!isMounted) {
          return;
        }
        setData(payload);
      })
      .catch((err: unknown) => {
        if (!isMounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load resume preview.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, serverQueryString]);

  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);

  if (loading && !data) {
    return <div className="modern-state">Loading resume preview...</div>;
  }

  if (error !== '') {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Resume preview is unavailable." />;
  }

  const listURL = ensureModernUIURL(data.actions.listURL);
  const candidateURL = data.actions.candidateURL.trim() === '' ? '' : ensureModernUIURL(data.actions.candidateURL);
  const queryLabel = data.state.query.trim() === '' ? 'No search term' : `Highlight: "${data.state.query}"`;
  const resumeTitle = data.resume.title.trim() === '' ? `Attachment #${data.resume.attachmentID}` : data.resume.title;
  const resumeText = data.resume.text || '';

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Resume Preview"
        subtitle={data.resume.fullName !== '--' ? `${data.resume.fullName} | ${resumeTitle}` : resumeTitle}
        actions={
          <>
            {candidateURL !== '' ? (
              <a className="modern-btn modern-btn--secondary" href={candidateURL}>
                Open Candidate
              </a>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={listURL}>
              Back To Candidates
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Attachment #{data.resume.attachmentID}</h2>
              <span className="modern-chip modern-chip--info">{queryLabel}</span>
            </div>

            {!data.state.hasData ? (
              <EmptyState message="No text exists for this attachment." />
            ) : (
              <pre
                style={{
                  margin: 0,
                  padding: '12px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  borderRadius: '10px',
                  background: '#f7fbfe',
                  border: '1px solid #dbe7ef',
                  maxHeight: '70vh',
                  overflow: 'auto'
                }}
              >
                {highlightText(resumeText, data.state.query)}
              </pre>
            )}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

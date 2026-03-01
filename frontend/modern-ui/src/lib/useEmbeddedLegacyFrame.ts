import { useCallback, useState } from 'react';

export function useEmbeddedLegacyFrame() {
  const [frameReloadToken, setFrameReloadToken] = useState(0);
  const [frameLoading, setFrameLoading] = useState(true);

  const reloadFrame = useCallback(() => {
    setFrameLoading(true);
    setFrameReloadToken((current) => current + 1);
  }, []);

  const handleFrameLoad = useCallback(() => {
    setFrameLoading(false);
  }, []);

  return {
    frameReloadToken,
    frameLoading,
    reloadFrame,
    handleFrameLoad
  };
}


/**
 * VaultAudit AI — useOnWindowResize Hook
 *
 * Tremor Raw useOnWindowResize [v0.0.2] ported to JS.
 * Fires the handler on mount and on every window resize event.
 */

import { useEffect } from 'react';

export const useOnWindowResize = (handler) => {
  useEffect(() => {
    const handleResize = () => {
      handler();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handler]);
};

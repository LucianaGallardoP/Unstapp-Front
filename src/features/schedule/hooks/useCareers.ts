import { useState, useEffect } from 'react';
import i18n from '../../../i18n';
import { scheduleService } from '../services/scheduleService';
import type { CareerDto } from '../types/schedule.dtos';

export const useCareers = (enabled = true) => {
  const [careers, setCareers] = useState<CareerDto[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refresh = () => setTrigger((prev) => prev + 1);

  useEffect(() => {
    if (!enabled) {
      setCareers([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchCareers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await scheduleService.getCareers();
        if (isMounted) {
          setCareers(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(i18n.t('schedule.careersLoadError'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCareers();

    return () => {
      isMounted = false;
    };
  }, [enabled, trigger]);

  return { careers, loading, error, refresh };
};

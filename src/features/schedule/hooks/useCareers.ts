import { useState, useEffect } from 'react';
import { scheduleService } from '../services/scheduleService';
import type { CareerDto } from '../types/schedule.dtos';

export const useCareers = () => {
  const [careers, setCareers] = useState<CareerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          setError('No se pudieron cargar las carreras.');
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
  }, []);

  return { careers, loading, error };
};

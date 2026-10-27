import { useState, useEffect } from 'react';
import { liveDataService } from '../services/liveDataService';
import type { IDataService } from '../services/dataService';

export function useDataService(dataService: IDataService = liveDataService) {
  const [, setUpdateCounter] = useState(0);

  useEffect(() => {
    const unsubscribe = dataService.subscribeToUpdates(() => {
      setUpdateCounter(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [dataService]);

  return dataService;
}
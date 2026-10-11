import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCachedApi = (key, url, initialData = null) => {
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Error reading localStorage", e);
    }
    return initialData;
  });
  
  // If we already have data from localStorage, we don't need to show a loading spinner
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem(key);
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const res = await axios.get(url);
        if (isMounted) {
          setData(res.data);
          try {
            localStorage.setItem(key, JSON.stringify(res.data));
          } catch (e) {
            console.warn("Error setting localStorage", e);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [url, key]);

  return { data, loading, error };
};

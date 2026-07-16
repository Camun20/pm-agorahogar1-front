let timeOffset = 0; // offset in milliseconds
let isSynced = false; // sync status indicator
let syncPromise: Promise<void> | null = null;

export const syncInternetTime = async () => {
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    const start = Date.now();
    
    // Method 1: Same-origin HEAD request (CORS-free, extremely fast, CloudFront/Amplify edge clock, 100% uncached in production)
    try {
      const response = await fetch(window.location.origin + '/?t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const serverDateStr = response.headers.get('Date');
      if (serverDateStr) {
        const networkTime = new Date(serverDateStr).getTime();
        const localTimeNow = Date.now();
        const latency = (localTimeNow - start) / 2;
        timeOffset = networkTime - localTimeNow + latency;
        isSynced = true;
        console.log('Internet time synced (HEAD same-origin). Offset (ms):', timeOffset);
        return;
      }
    } catch (e) {
      console.warn('Same-origin HEAD sync failed, trying external APIs...', e);
    }

    // Method 2: httpbin.org (CORS enabled, debug service, completely uncached)
    try {
      const response = await fetch('https://httpbin.org/date?t=' + Date.now(), {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.date) {
          const networkTime = new Date(data.date).getTime();
          const localTimeNow = Date.now();
          const latency = (localTimeNow - start) / 2;
          timeOffset = networkTime - localTimeNow + latency;
          isSynced = true;
          console.log('Internet time synced (httpbin.org). Offset (ms):', timeOffset);
          return;
        }
      }
    } catch (e) {
      console.warn('httpbin.org failed, trying WorldTimeAPI...', e);
    }

    // Method 3: WorldTimeAPI Bogota timezone (using numeric unixtime for local parsing safety)
    try {
      const response = await fetch('https://worldtimeapi.org/api/timezone/America/Bogota?t=' + Date.now(), {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.unixtime) {
          const networkTime = data.unixtime * 1000;
          const localTimeNow = Date.now();
          const latency = (localTimeNow - start) / 2;
          timeOffset = networkTime - localTimeNow + latency;
          isSynced = true;
          console.log('Internet time synced (WorldTimeAPI Bogota). Offset (ms):', timeOffset);
          return;
        }
      }
    } catch (e) {
      console.warn('WorldTimeAPI Bogota failed, trying jsontest.com...', e);
    }

    // Method 4: jsontest.com (parsing UTC string format)
    try {
      const response = await fetch('https://date.jsontest.com/?t=' + Date.now(), {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.date && data.time) {
          const networkTime = new Date(`${data.date} ${data.time} GMT`).getTime();
          const localTimeNow = Date.now();
          const latency = (localTimeNow - start) / 2;
          timeOffset = networkTime - localTimeNow + latency;
          isSynced = true;
          console.log('Internet time synced (jsontest.com). Offset (ms):', timeOffset);
          return;
        }
      }
    } catch (e) {
      console.warn('jsontest.com failed, trying TimeAPI.io...', e);
    }

    // Method 5: TimeAPI.io Bogota timezone
    try {
      const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=America/Bogota&t=' + Date.now(), {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.dateTime) {
          const networkTime = new Date(data.dateTime + "-05:00").getTime();
          const localTimeNow = Date.now();
          const latency = (localTimeNow - start) / 2;
          timeOffset = networkTime - localTimeNow + latency;
          isSynced = true;
          console.log('Internet time synced (TimeAPI.io Bogota). Offset (ms):', timeOffset);
          return;
        }
      }
    } catch (e) {
      console.warn('TimeAPI.io Bogota failed. Fallback to local clock.', e);
    }
  })();

  return syncPromise;
};

export const ensureTimeSynced = async () => {
  if (syncPromise) {
    await syncPromise;
  } else {
    await syncInternetTime();
  }
};

export const getNetworkDate = (): Date => {
  return new Date(Date.now() + timeOffset);
};

export const getFormattedNetworkTime = (): string => {
  const date = getNetworkDate();
  
  if (isSynced) {
    // Force America/Bogota (GMT-5) timezone formatting when synced with network
    return date.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } else {
    // Fallback: format using local browser timezone to respect manual system clock changes
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
};

export const getFormattedNetworkDateOnly = (): string => {
  const date = getNetworkDate();
  
  if (isSynced) {
    const formatter = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date); // YYYY-MM-DD in Colombia timezone
  } else {
    const formatter = new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date); // YYYY-MM-DD in local timezone
  }
};

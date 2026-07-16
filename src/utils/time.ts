let timeOffset = 0; // offset in milliseconds

export const syncInternetTime = async () => {
  const start = Date.now();
  
  // Method 1: Same-origin HEAD request (CORS-safe, fast, reliable, bypasses external network blocks)
  try {
    const response = await fetch(window.location.origin + '/?t=' + Date.now(), {
      method: 'HEAD',
      cache: 'no-cache'
    });
    const serverDateStr = response.headers.get('Date');
    if (serverDateStr) {
      const networkTime = new Date(serverDateStr).getTime();
      const localTimeNow = Date.now();
      const latency = (localTimeNow - start) / 2;
      timeOffset = networkTime - localTimeNow + latency;
      console.log('Internet time synced (HEAD same-origin). Offset (ms):', timeOffset);
      return;
    }
  } catch (e) {
    console.warn('Same-origin HEAD sync failed:', e);
  }

  // Method 2: WorldTimeAPI Bogota timezone (with cache-buster)
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/America/Bogota?t=' + Date.now(), {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    if (response.ok) {
      const data = await response.json();
      const networkTime = data.unixtime * 1000;
      const localTimeNow = Date.now();
      const latency = (localTimeNow - start) / 2;
      timeOffset = networkTime - localTimeNow + latency;
      console.log('Internet time synced (WorldTimeAPI Bogota). Offset (ms):', timeOffset);
      return;
    }
  } catch (e) {
    console.warn('WorldTimeAPI Bogota failed:', e);
  }

  // Method 3: TimeAPI.io Bogota timezone (with cache-buster)
  try {
    const start2 = Date.now();
    const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=America/Bogota&t=' + Date.now(), {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    if (response.ok) {
      const data = await response.json();
      const networkTime = new Date(data.dateTime).getTime();
      const localTimeNow = Date.now();
      const latency = (localTimeNow - start2) / 2;
      timeOffset = networkTime - localTimeNow + latency;
      console.log('Internet time synced (TimeAPI.io Bogota). Offset (ms):', timeOffset);
      return;
    }
  } catch (e) {
    console.warn('TimeAPI.io Bogota failed:', e);
  }
};

export const getNetworkDate = (): Date => {
  return new Date(Date.now() + timeOffset);
};

export const getFormattedNetworkTime = (): string => {
  const date = getNetworkDate();
  
  // Force America/Bogota (GMT-5) timezone formatting
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
};

export const getFormattedNetworkDateOnly = (): string => {
  const date = getNetworkDate();
  const formatter = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date); // YYYY-MM-DD in Colombia timezone
};

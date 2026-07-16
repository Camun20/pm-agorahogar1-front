let timeOffset = 0; // offset in milliseconds

export const syncInternetTime = async () => {
  const start = Date.now();
  
  // Try WorldTimeAPI
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
      method: 'GET',
      mode: 'cors'
    });
    if (response.ok) {
      const data = await response.json();
      const networkTime = new Date(data.utc_datetime).getTime();
      const localTimeNow = Date.now();
      const latency = (localTimeNow - start) / 2;
      timeOffset = networkTime - localTimeNow + latency;
      console.log('Internet time synced (WorldTimeAPI). Offset (ms):', timeOffset);
      return;
    }
  } catch (e) {
    console.warn('WorldTimeAPI failed, trying TimeAPI.io...', e);
  }

  // Fallback to TimeAPI.io
  try {
    const start2 = Date.now();
    const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC', {
      method: 'GET',
      mode: 'cors'
    });
    if (response.ok) {
      const data = await response.json();
      const networkTime = new Date(data.dateTime).getTime();
      const localTimeNow = Date.now();
      const latency = (localTimeNow - start2) / 2;
      timeOffset = networkTime - localTimeNow + latency;
      console.log('Internet time synced (TimeAPI.io). Offset (ms):', timeOffset);
      return;
    }
  } catch (e) {
    console.warn('All internet time APIs failed. Falling back to local system time:', e);
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

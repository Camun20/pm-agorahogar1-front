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
  
  const pad = (num: number) => String(num).padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  
  let hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  return `${year}-${month}-${day} ${pad(hours)}:${minutes} ${ampm}`;
};

export const getFormattedNetworkDateOnly = (): string => {
  const date = getNetworkDate();
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

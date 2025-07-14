import React, { useEffect, useState } from 'react';
import {
  Wifi,
  WifiOff,
  Activity,
  Gauge,
  BatteryCharging,
  Clock,
  MapPin,
  CalendarDays,
} from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const getNetworkInfo = () => {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  return connection
    ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      }
    : null;
};

const NetworkBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkInfo, setNetworkInfo] = useState(getNetworkInfo());
  const [battery, setBattery] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const { elementRef, hasIntersected } = useIntersectionObserver(0.1);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      setNetworkInfo(getNetworkInfo());
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateStatus);
    }

    if ('getBattery' in navigator) {
      navigator.getBattery().then((bat) => {
        const updateBattery = () => setBattery(Math.round(bat.level * 100));
        updateBattery();
        bat.addEventListener('levelchange', updateBattery);
      });
    }

    const geoWatch = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setSpeed(Math.round(position.coords.speed || 0));

        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=2ecabd1f140a4e0c9385d6de34cfaf42`
        );
        const data = await res.json();
        const place = data.features?.[0]?.properties?.city || data.features?.[0]?.properties?.state;
        setLocation(place || 'Unknown');
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
      },
      { enableHighAccuracy: true }
    );

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      if (connection) connection.removeEventListener('change', updateStatus);
      navigator.geolocation.clearWatch(geoWatch);
      clearInterval(interval);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      ref={elementRef}
      className={`mb-6 bg-gray-800 rounded-xl shadow-md p-5 transition-all duration-700 transform ${
        hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } text-white`}
    >
      <h3 className="text-lg font-semibold mb-3">Live Environment Insights</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Time: {formatTime(time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-sky-300" />
            <span>{time.toDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-yellow-400" />
            <span>Battery: {battery !== null ? `${battery}%` : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>Speed: {speed !== null ? `${speed} m/s` : 'N/A'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span>Network: {isOnline ? 'Online' : 'Offline'}</span>
          </div>
          {isOnline && networkInfo && (
            <div className="space-y-1 text-xs text-gray-300 pl-6">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3" />
                <span>Connection: {networkInfo.effectiveType}</span>
              </div>
              <span>Speed: {networkInfo.downlink} Mbps</span>
              <span>RTT: {networkInfo.rtt} ms</span>
              <span>Data Saver: {networkInfo.saveData ? 'On' : 'Off'}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-300" />
            <span>Location: {location || 'Fetching...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkBanner;

import React, { useEffect, useRef, useState } from 'react';
import { Gauge, BatteryCharging, Wifi, Coffee, Landmark } from 'lucide-react';

const MapView = () => {
  const canvasRef = useRef(null);
  const tipsRef = useRef([]);
  const [hasShownTip, setHasShownTip] = useState([]);
  const [speed, setSpeed] = useState(null);
  const [battery, setBattery] = useState(null);
  const [network, setNetwork] = useState(navigator.onLine);
  const [location, setLocation] = useState(null);

  const trail = [
    { x: 50, y: 100 },
    { x: 100, y: 120 },
    { x: 150, y: 80 },
    { x: 200, y: 130 },
    { x: 250, y: 90 },
  ];

  const pois = [
    { x: 90, y: 110, icon: '☕', label: 'Cafe' },
    { x: 210, y: 120, icon: '🏞️', label: 'Rest Area' },
  ];

  useEffect(() => {
    const geoWatchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(position.coords);
        setSpeed(position.coords.speed?.toFixed(2));
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    navigator.getBattery?.().then(b => {
      setBattery((b.level * 100).toFixed(0));
    });

    const handleNetworkChange = () => setNetwork(navigator.onLine);
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      navigator.geolocation.clearWatch(geoWatchId);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  useEffect(() => {
    if (!location) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw trail
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    trail.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw POIs
    pois.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
    });

    // Draw user location
    const userX = 100 + ((location.longitude % 1) * 200);
    const userY = 100 + ((location.latitude % 1) * 200);
    ctx.beginPath();
    ctx.arc(userX, userY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#facc15';
    ctx.fill();
  }, [location]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const newShown = [...hasShownTip];
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) newShown[index] = true;
        });
        setHasShownTip(newShown);
      },
      { threshold: 0.2 }
    );

    tipsRef.current.forEach((ref, idx) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      tipsRef.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const tips = [
    'Stay hydrated during your trail journey.',
    'Look out for waypoints to avoid losing track.',
    'Take breaks at rest areas to prevent fatigue.',
  ];

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-gray-900 rounded-xl p-4 shadow-md">
          <h2 className="text-white text-xl mb-2">Trail Map</h2>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="rounded-md border border-gray-700 bg-gray-800"
          />
        </div>

        <div className="w-full lg:w-64 bg-gray-900 rounded-xl p-4 shadow-md text-white space-y-4">
          <h3 className="text-lg font-semibold">Live Data</h3>
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="w-4 h-4 text-sky-400" />
            Speed: {speed ? `${speed} m/s` : 'N/A'}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BatteryCharging className="w-4 h-4 text-yellow-400" />
            Battery: {battery ? `${battery}%` : 'N/A'}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wifi className={`w-4 h-4 ${network ? 'text-green-400' : 'text-red-500'}`} />
            Network: {network ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-white text-xl mb-4">Trail Tips</h3>
        <div className="space-y-4">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              ref={el => (tipsRef.current[idx] = el)}
              className={`p-4 rounded-md shadow bg-gray-800 text-white transform transition duration-700 ${
                hasShownTip[idx] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;

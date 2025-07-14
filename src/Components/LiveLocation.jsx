import React, { useState } from 'react';
import {
  MapPin,
  Crosshair,
  AlertCircle,
  Wind,
  Thermometer,
  Cloud,
  LocateFixed,
} from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const LiveLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const { elementRef, hasIntersected } = useIntersectionObserver(0.1);

  const fetchWeatherData = async (lat, lon) => {
    try {
      const apiKey = '67102882752277794fa5aa4e20190dfd';
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError('Unable to fetch weather info.');
    }
  };

  const handleGetLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ latitude, longitude, accuracy });
        fetchWeatherData(latitude, longitude);
      },
      (err) => {
        setError('Failed to retrieve location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  const renderMap = () => {
    if (!location) return null;

    const { latitude, longitude } = location;
    const apiKey = '2ecabd1f140a4e0c9385d6de34cfaf42';

    const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=300&center=lonlat:${longitude},${latitude}&zoom=15&marker=lonlat:${longitude},${latitude};color:%23ff0000;size:large&apiKey=${apiKey}`;

    return (
      <img
        src={mapUrl}
        alt="Live location map"
        className="rounded-lg shadow-lg w-1/2 mx-auto bg-gray-900"
      />
    );
  };

  const InfoCard = ({ icon, label, value, unit }) => (
    <div className="bg-gray-800 p-4 rounded-lg text-center">
      {icon}
      <p className="text-xs uppercase text-gray-400 mt-2">{label}</p>
      <p className="text-lg font-semibold text-white">
        {value} {unit}
      </p>
    </div>
  );

  return (
    <div
      ref={elementRef}
      className={`mb-8 bg-gray-900 rounded-xl shadow-md p-6 transition-all duration-700 transform ${
        hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Crosshair className="h-5 w-5 text-sky-500 mr-2" />
          <h2 className="text-xl font-bold text-white">Live Location</h2>
        </div>
        <button
          onClick={handleGetLocation}
          className="flex items-center bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded-lg text-sm"
        >
          <LocateFixed className="w-4 h-4 mr-1" />
          Get My Location
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-400 mb-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {location ? (
        <div className="text-sm text-gray-300 space-y-6">
          {renderMap()}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <InfoCard
              icon={<MapPin className="h-6 w-6 text-sky-400 mx-auto" />}
              label="Latitude"
              value={location.latitude.toFixed(6)}
            />
            <InfoCard
              icon={<MapPin className="h-6 w-6 text-sky-400 mx-auto" />}
              label="Longitude"
              value={location.longitude.toFixed(6)}
            />
            <InfoCard
              icon={<Crosshair className="h-6 w-6 text-sky-400 mx-auto" />}
              label="Accuracy"
              value={`±${Math.round(location.accuracy)}`}
              unit="m"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoCard
              icon={<Wind className="h-6 w-6 text-sky-400 mx-auto" />}
              label="Wind Speed"
              value={weatherData?.wind?.speed ?? 'N/A'}
              unit="m/s"
            />
            <InfoCard
              icon={<Thermometer className="h-6 w-6 text-sky-400 mx-auto" />}
              label="Temperature"
              value={weatherData?.main?.temp ?? 'N/A'}
              unit="°C"
            />
            <InfoCard
              icon={<Cloud className="h-6 w-6 text-sky-400 mx-auto" />}
              label="Condition"
              value={weatherData?.weather?.[0]?.main ?? 'N/A'}
            />
          </div>
        </div>
      ) : (
        !error && <p className="text-gray-400 mt-4">Click the button to get your location.</p>
      )}
    </div>
  );
};

export default LiveLocation;

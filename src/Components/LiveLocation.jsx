import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Crosshair,
  Wind,
  Thermometer,
  CloudRain,
} from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const LiveLocation = ({ location, weatherData, searchQuery }) => {
  const { elementRef, hasIntersected } = useIntersectionObserver(0.1);
  const [destinationWeather, setDestinationWeather] = useState(null);

  const apiKey = '2ecabd1f140a4e0c9385d6de34cfaf42'; // Geoapify
  const weatherApiKey = '67102882752277794fa5aa4e20190dfd'; // OpenWeatherMap

  // Fetch destination weather only if a place is searched
  useEffect(() => {
    const fetchDestinationWeather = async () => {
      if (!searchQuery) {
        setDestinationWeather(null);
        return;
      }

      try {
        const geoRes = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
            searchQuery
          )}&apiKey=${apiKey}`
        );
        const geoData = await geoRes.json();
        const feature = geoData.features?.[0];
        const lat = feature?.geometry?.coordinates[1];
        const lon = feature?.geometry?.coordinates[0];

        if (!lat || !lon) return;

        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`
        );
        const weatherJson = await weatherRes.json();
        setDestinationWeather(weatherJson);
      } catch (err) {
        console.error('Destination weather fetch failed:', err);
      }
    };

    fetchDestinationWeather();
  }, [searchQuery]);

  const renderMap = () => {
    if (!location) return null;
    const { latitude, longitude } = location;

    const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=300&center=lonlat:${longitude},${latitude}&zoom=14&marker=lonlat:${longitude},${latitude};color:%23ff0000;size:large&apiKey=${apiKey}`;

    return (
      <img
        src={mapUrl}
        alt="Map"
        className="rounded-lg shadow-lg w-full max-w-xl mx-auto bg-gray-900"
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
      <div className="flex items-center mb-4">
        <Crosshair className="h-5 w-5 text-sky-500 mr-2" />
        <h2 className="text-xl font-bold text-white">Live Location & Weather</h2>
      </div>

      {/* Always show current user location map */}
      {renderMap()}

      {/* User's Location Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <InfoCard
          icon={<MapPin className="h-6 w-6 text-sky-400 mx-auto" />}
          label="Latitude"
          value={location?.latitude?.toFixed(6) ?? 'N/A'}
        />
        <InfoCard
          icon={<MapPin className="h-6 w-6 text-sky-400 mx-auto" />}
          label="Longitude"
          value={location?.longitude?.toFixed(6) ?? 'N/A'}
        />
        <InfoCard
          icon={<Crosshair className="h-6 w-6 text-sky-400 mx-auto" />}
          label="Accuracy"
          value={`±${Math.round(location?.accuracy || 0)}`}
          unit="m"
        />
      </div>

      {/* User's Weather Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <InfoCard
          icon={<Thermometer className="h-6 w-6 text-sky-400 mx-auto" />}
          label="Temperature"
          value={weatherData?.main?.temp ?? 'N/A'}
          unit="°C"
        />
        <InfoCard
          icon={<Wind className="h-6 w-6 text-sky-400 mx-auto" />}
          label="Wind Speed"
          value={weatherData?.wind?.speed ?? 'N/A'}
          unit="m/s"
        />
        <InfoCard
          icon={<CloudRain className="h-6 w-6 text-sky-400 mx-auto" />}
          label="Rain Chance"
          value={
            weatherData?.rain?.['1h']
              ? `${weatherData.rain['1h']} mm`
              : '0 mm'
          }
        />
      </div>

      {/* Destination Weather Info (only if searched) */}
      {destinationWeather && (
        <>
          <h3 className="text-lg font-semibold text-white mt-8">
            Destination Weather ({searchQuery})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <InfoCard
              icon={<Thermometer className="h-6 w-6 text-yellow-400 mx-auto" />}
              label="Temperature"
              value={destinationWeather?.main?.temp ?? 'N/A'}
              unit="°C"
            />
            <InfoCard
              icon={<Wind className="h-6 w-6 text-yellow-400 mx-auto" />}
              label="Wind Speed"
              value={destinationWeather?.wind?.speed ?? 'N/A'}
              unit="m/s"
            />
            <InfoCard
              icon={<CloudRain className="h-6 w-6 text-yellow-400 mx-auto" />}
              label="Rain Chance"
              value={
                destinationWeather?.rain?.['1h']
                  ? `${destinationWeather.rain['1h']} mm`
                  : '0 mm'
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LiveLocation;

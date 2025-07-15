import React, { useState, useEffect } from 'react';
import Header from './Components/Header';
import SearchBar from './Components/SearchBar';
import NetworkBanner from './Components/NetworkBanner';
import LiveLocation from './Components/LiveLocation';
import AttractionsSection from './Components/AttractionsSection';
import RemindersSection from './Components/RemindersSection';
import CTASection from './Components/CTASection';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [battery, setBattery] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log('[🔍 Search Triggered] Query:', query);
  };

  const handleLocationRequest = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude},${longitude}`;
        setSearchQuery(locationString);
        console.log('[📍 Use My Location] Coordinates:', locationString);
      },
      (error) => {
        console.error('[❌ Geolocation Error]', error.message);
        alert('Failed to retrieve location. Please enable location services.');
      }
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const loc = { latitude, longitude, accuracy };
        setUserLocation(loc);

        // Fetch weather for user's location
        try {
          const apiKey = '67102882752277794fa5aa4e20190dfd';
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
          );
          const data = await res.json();
          setWeatherData(data);
        } catch (err) {
          console.error('[🌦️ Weather Fetch Failed]', err);
        }
      },
      (err) => console.error('[❌ Location Error]', err),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Battery API
    if ('getBattery' in navigator) {
      navigator.getBattery().then((bat) => {
        setBattery(Math.round(bat.level * 100));
      });
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />

      <SearchBar onSearch={handleSearch} onLocate={handleLocationRequest} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <NetworkBanner />
        <LiveLocation location={userLocation} weatherData={weatherData} searchQuery={searchQuery} />
        <AttractionsSection searchQuery={searchQuery} userLocation={userLocation} />
        <RemindersSection />
        <CTASection
          scrollToMap={() =>
            document.getElementById('map-view')?.scrollIntoView({ behavior: 'smooth' })
          }
          openTipsModal={() => {}}
          userLocation={userLocation}
          battery={battery}
          isOnline={isOnline}
        />
      </main>
    </div>
  );
}

export default App;

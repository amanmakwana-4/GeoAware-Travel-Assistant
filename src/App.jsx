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
  const [battery, setBattery] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [tipsModalOpen, setTipsModalOpen] = useState(false); // optional

  const handleSearch = (query) => {
    console.log('Searching for:', query);
    setSearchQuery(query);
  };

  const handleLocationRequest = () => {
    console.log('Requesting user location...');

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude},${longitude}`;
        setUserLocation({ latitude, longitude }); // set location state
        setSearchQuery(locationString); // trigger attractions fetch
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to retrieve location. Please enable location services.');
      }
    );
  };

  useEffect(() => {
    // Handle battery status
    if ('getBattery' in navigator) {
      navigator.getBattery().then((bat) => {
        setBattery(Math.round(bat.level * 100));
        bat.addEventListener('levelchange', () => {
          setBattery(Math.round(bat.level * 100));
        });
      });
    }

    // Handle online/offline
    const handleNetworkChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <SearchBar onSearch={handleSearch} onLocate={handleLocationRequest} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <NetworkBanner />
        <LiveLocation />
        <AttractionsSection searchQuery={searchQuery} />
        <RemindersSection />
        <CTASection
          scrollToMap={() =>
            document.getElementById("map-view")?.scrollIntoView({ behavior: "smooth" })
          }
          openTipsModal={() => setTipsModalOpen(true)}
          userLocation={userLocation}
          battery={battery}
          isOnline={isOnline}
        />
      </main>
    </div>
  );
}

export default App;

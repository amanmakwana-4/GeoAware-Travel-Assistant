import React, { useEffect, useState } from 'react';
import { Compass, ArrowRight, Info } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const CTASection = ({ scrollToMap, openTipsModal, userLocation, battery, isOnline }) => {
  const { elementRef, hasIntersected } = useIntersectionObserver(0.1);
  const [city, setCity] = useState('');

  useEffect(() => {
    if (userLocation) {
      fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${userLocation.latitude}&lon=${userLocation.longitude}&apiKey=2ecabd1f140a4e0c9385d6de34cfaf42`
      )
        .then(res => res.json())
        .then(data => {
          const place = data.features?.[0]?.properties?.city || data.features?.[0]?.properties?.formatted;
          if (place) setCity(place);
        })
        .catch(() => setCity('your area'));
    }
  }, [userLocation]);

  const disabled = !isOnline || (battery !== null && battery <= 15);

  return (
    <div
      ref={elementRef}
      className={`bg-gradient-to-r from-sky-600 to-blue-700 dark:from-sky-800 dark:to-blue-900 
                  rounded-xl shadow-lg p-8 text-center transition-all duration-700 transform ${
        hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <Compass className="h-8 w-8 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Explore {city ? `in ${city}` : ''}?
        </h2>

        <p className="text-sky-100 text-lg mb-6">
          Discover amazing attractions, stay connected with real-time insights,
          and never miss key moments — all tailored for your journey.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={scrollToMap}
            disabled={disabled}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition duration-200 ${
              disabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-sky-600 hover:bg-gray-100'
            }`}
          >
            <span>Start Exploring</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={openTipsModal}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-sky-600 transition duration-200"
          >
            <Info className="h-4 w-4" />
            <span>Live Environment</span>
          </button>
        </div>

        {disabled && (
          <p className="mt-4 text-sm text-yellow-200">
            {isOnline ? 'Low battery detected.' : 'You appear to be offline.'} Some features are disabled for now.
          </p>
        )}
      </div>
    </div>
  );
};

export default CTASection;

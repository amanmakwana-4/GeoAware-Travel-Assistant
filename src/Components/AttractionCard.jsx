import React, { useState } from 'react';
import {
  MapPin,
  Star,
  Clock,
  Camera,
  CloudSun,
  Thermometer,
  X,
} from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const AttractionCard = ({ attraction, index }) => {
  const { elementRef, hasIntersected } = useIntersectionObserver(0.1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        ref={elementRef}
        className={`bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-700 transform ${
          hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <div className="relative">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-sm text-white z-10">
              Loading image...
            </div>
          )}
          {imageError ? (
            <div className="h-48 w-full bg-gray-700 flex items-center justify-center text-white">
              Image not available
            </div>
          ) : (
            <img
              src={attraction.imageUrl}
              alt={attraction.name}
              className={`w-full h-48 object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}

          <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-medium">
            {attraction.distance ? `${attraction.distance.toFixed(1)} km` : 'N/A'}
          </div>

          {/* <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
            {attraction.category}
          </div> */}
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-white">{attraction.name}</h3>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-300">{attraction.rating}</span>
            </div>
          </div>

          <p className="text-gray-400 text-sm">{attraction.description}</p>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{attraction.distance.toFixed(1)} km away</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{Math.round(attraction.distance * 12)} min walk</span>
              </div>
            </div>

            {attraction.weather && (
              <div className="text-right space-y-1">
                <div className="flex items-center justify-end gap-1">
                  <Thermometer className="h-4 w-4 text-sky-400" />
                  <span>{attraction.weather.temp ?? '--'}°C</span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <CloudSun className="h-4 w-4 text-yellow-400" />
                  <span>{attraction.weather.condition || '—'}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="mt-3 flex items-center gap-1 text-sky-500 hover:text-sky-300 transition-colors text-sm"
          >
            <Camera className="h-4 w-4" />
            <span>View</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="relative bg-gray-900 rounded-xl overflow-hidden max-w-md w-full shadow-lg">
            <button
              className="absolute top-2 right-2 text-white hover:text-red-400"
              onClick={() => setShowModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={attraction.imageUrl}
              alt="Attraction Preview"
              className="w-full h-auto max-h-[400px] object-cover"
            />
            <div className="p-4 text-white text-center">
              <h4 className="font-bold text-lg">{attraction.name}</h4>
              <p className="text-sm mt-1">{attraction.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttractionCard;

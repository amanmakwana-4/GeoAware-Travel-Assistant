import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import AttractionCard from './AttractionCard';

const AttractionsSection = ({ searchQuery }) => {
  const [attractions, setAttractions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchCoords, setSearchCoords] = useState(null);

  const apiKey = '2ecabd1f140a4e0c9385d6de34cfaf42';

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchAttractions = async (locationName = null, lat = null, lon = null) => {
    try {
      if (locationName) {
        const geoRes = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(locationName)}&apiKey=${apiKey}`
        );
        const geoData = await geoRes.json();

        if (!geoData.features?.length) throw new Error('Location not found');

        lat = geoData.features[0].properties.lat;
        lon = geoData.features[0].properties.lon;
        setSearchCoords({ lat, lon });
      }

      if (!lat || !lon) {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej)
        );
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        setSearchCoords({ lat, lon });
      }

      const placesURL = `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:${lon},${lat},5000&limit=10&apiKey=${apiKey}`;
      const res = await fetch(placesURL);
      const data = await res.json();

      if (!data.features || !Array.isArray(data.features)) throw new Error('Invalid data');

      const mapped = await Promise.all(
        data.features.map(async (f) => {
          const placeLat = f.properties.lat;
          const placeLon = f.properties.lon;
          const distanceKm = getDistance(lat, lon, placeLat, placeLon);
          const imageQuery = encodeURIComponent(f.properties.name || 'tourist');
          const imageUrl = `https://source.unsplash.com/400x300/?${imageQuery}`;

          return {
            id: f.properties.place_id,
            name: f.properties.name || 'Unknown Place',
            category: f.properties.categories?.[2] || f.properties.categories?.[0] || 'tourism',
            distance: distanceKm,
            description:
              f.properties.datasource?.raw?.tags?.description ||
              f.properties.formatted ||
              'Popular spot to visit',
            rating: (Math.random() * 2 + 3).toFixed(1),
            imageUrl,
            lat: placeLat,
            lon: placeLon,
          };
        })
      );

      setAttractions(mapped);
    } catch (err) {
      console.error('❌ Failed to fetch attractions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCategory('All');
    setLoading(true);
    fetchAttractions(searchQuery);
  }, [searchQuery]);

  // Get unique category values from attractions
  const dynamicCategories = [
    ...new Set(attractions.map((a) => a.category).filter(Boolean)),
  ];
  const categories = ['All', ...dynamicCategories];

  const filteredAttractions =
    selectedCategory === 'All'
      ? attractions
      : attractions.filter((a) =>
          a.category.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nearby Attractions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover amazing places around you
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                       rounded-lg px-3 py-2 text-sm text-gray-100 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading attractions...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((attraction, index) => (
            <AttractionCard
              key={attraction.id}
              attraction={attraction}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AttractionsSection;

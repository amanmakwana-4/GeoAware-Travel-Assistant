import React from 'react';
import logo from '../assets/logo.jpeg';

const Header = () => {
  return (
    <header className="bg-[#0e1624] text-white shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center space-x-4">
        <img
          src={logo}
          alt="GeoAware Logo"
          className="h-14 w-14 rounded-md object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">GeoAware Travel Assistant</h1>
          <p className="text-sm text-gray-300">Explore with confidence</p>
        </div>
      </div>
    </header>
  );
};

export default Header;

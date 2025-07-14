import React, { useState, useEffect } from 'react';
import { Bell, Clock, MapPin, Plus, X, CheckCircle } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const ReminderCard = ({ reminder, index, onToggle, onDelete }) => {
  const { elementRef, hasIntersected } = useIntersectionObserver(0.1);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const timeDiff = new Date(reminder.time) - now;
      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / 3600000);
        const minutes = Math.floor((timeDiff % 3600000) / 60000);
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft('Expired');
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [reminder.time]);

  useEffect(() => {
    if (reminder.isActive && 'Notification' in window && Notification.permission === 'granted') {
      const timeUntilReminder = new Date(reminder.time).getTime() - Date.now();
      if (timeUntilReminder > 0 && timeUntilReminder < 60000) {
        const timeout = setTimeout(() => {
          new Notification(reminder.title, {
            body: reminder.description,
            icon: '/vite.svg',
            tag: reminder.id,
          });
        }, timeUntilReminder);
        return () => clearTimeout(timeout);
      }
    }
  }, [reminder]);

  return (
    <div
      ref={elementRef}
      className={`bg-gray-800 rounded-xl shadow-md p-5 transition-all duration-700 transform ${
        hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${!reminder.isActive ? 'opacity-60' : ''}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            reminder.isActive ? 'bg-sky-100 dark:bg-sky-900' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Bell className={`h-4 w-4 ${reminder.isActive ? 'text-sky-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{reminder.title}</h3>
            <p className="text-sm text-gray-400">{reminder.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => onToggle(reminder.id)} className="text-green-500 hover:text-green-400 p-1 rounded-full">
            <CheckCircle className="h-5 w-5" />
          </button>
          <button onClick={() => onDelete(reminder.id)} className="text-red-400 hover:text-red-500 p-1 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{timeLeft}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{reminder.type}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          reminder.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-700 text-gray-400'
        }`}>
          {reminder.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>
    </div>
  );
};

const RemindersSection = () => {
  const [reminders, setReminders] = useState([]);
  const [battery, setBattery] = useState(null);
  const [network, setNetwork] = useState(null);

  const getTimeSegment = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  useEffect(() => {
    const stored = localStorage.getItem('reminders');
    if (stored) setReminders(JSON.parse(stored));

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=2ecabd1f140a4e0c9385d6de34cfaf42`
      );
      const data = await res.json();
      const place = data.features?.[0]?.properties?.formatted || 'your area';

      if ('getBattery' in navigator) {
        navigator.getBattery().then(bat => {
          setBattery(Math.round(bat.level * 100));
        });
      }

      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        setNetwork(conn.effectiveType);
      }

      const segment = getTimeSegment();
      const baseTime = Date.now();

      const suggestions = [
        segment === 'morning' && {
          title: 'Stretch & Hydrate',
          description: `Start your morning right in ${place}`,
          time: new Date(baseTime + 10 * 60000),
          type: 'Health'
        },
        segment === 'afternoon' && {
          title: 'Lunch Nearby',
          description: `Try local lunch spots in ${place}`,
          time: new Date(baseTime + 15 * 60000),
          type: 'Food'
        },
        segment === 'evening' && {
          title: 'Walk & Sunset',
          description: `Explore ${place} during golden hour`,
          time: new Date(baseTime + 20 * 60000),
          type: 'Leisure'
        },
        segment === 'night' && {
          title: 'Wind Down',
          description: `Relax and plan your tomorrow`,
          time: new Date(baseTime + 25 * 60000),
          type: 'Wellness'
        },
        battery < 30 && {
          title: 'Charge Your Device',
          description: 'Battery is running low!',
          time: new Date(baseTime + 5 * 60000),
          type: 'Battery'
        },
        network && ['2g', '3g'].includes(network) && {
          title: 'Low Internet Reminder',
          description: 'Network speed is low, download offline maps.',
          time: new Date(baseTime + 8 * 60000),
          type: 'Connectivity'
        }
      ].filter(Boolean);

      setReminders(prev => [...prev, ...suggestions.map(r => ({ ...r, id: Date.now() + Math.random(), isActive: true }))]);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  const handleAddReminder = () => {
    const now = new Date();
    const defaultReminder = {
      title: 'Custom Exploration Reminder',
      description: 'Discover something new nearby!',
      time: new Date(now.getTime() + 15 * 60000),
      type: 'Custom',
      id: Date.now() + Math.random(),
      isActive: true,
    };
    setReminders(prev => [...prev, defaultReminder]);
  };

  const handleToggleReminder = (id) =>
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));

  const handleDeleteReminder = (id) =>
    setReminders(prev => prev.filter(r => r.id !== id));

  return (
    <div className="mb-8 bg-gray-800 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Smart Travel Reminders</h2>
          <p className="text-gray-400 mt-1">Based on time, location, battery & network</p>
        </div>
        <button
          onClick={handleAddReminder}
          className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map((reminder, index) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            index={index}
            onToggle={handleToggleReminder}
            onDelete={handleDeleteReminder}
          />
        ))}
      </div>

      {reminders.length === 0 && (
        <div className="text-center py-12 text-white">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No reminders yet. Add one or let us suggest!</p>
        </div>
      )}
    </div>
  );
};

export default RemindersSection;

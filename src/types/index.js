// Attraction Type
export const Attraction = {
  id: '',
  name: '',
  description: '',
  imageUrl: '',
  distance: 0,
  rating: 0,
  category: '',
};

// Reminder Type
export const Reminder = {
  id: '',
  title: '',
  description: '',
  time: new Date(),
  isActive: true,
  type: '', // e.g., "Museum", "Outdoor", "Custom"
};

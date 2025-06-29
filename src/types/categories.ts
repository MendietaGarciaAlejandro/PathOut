export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 'restaurante', name: 'Restaurante', icon: '🍽️', color: '#FF6B6B' },
  { id: 'cafe', name: 'Café', icon: '☕', color: '#4ECDC4' },
  { id: 'bar', name: 'Bar', icon: '🍺', color: '#45B7D1' },
  { id: 'compras', name: 'Compras', icon: '🛍️', color: '#96CEB4' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎭', color: '#FFEAA7' },
  { id: 'cultura', name: 'Cultura', icon: '🏛️', color: '#DDA0DD' },
  { id: 'naturaleza', name: 'Naturaleza', icon: '🌳', color: '#98D8C8' },
  { id: 'transporte', name: 'Transporte', icon: '🚇', color: '#F7DC6F' },
  { id: 'salud', name: 'Salud', icon: '🏥', color: '#BB8FCE' },
  { id: 'educacion', name: 'Educación', icon: '🎓', color: '#85C1E9' },
  { id: 'otros', name: 'Otros', icon: '📍', color: '#BDC3C7' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryByName = (name: string): Category | undefined => {
  return CATEGORIES.find(cat => cat.name === name);
}; 
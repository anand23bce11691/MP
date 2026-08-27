import React from 'react';
import { ShopEasyProvider } from './context/ShopEasyContext';
import { ShopEasyStorefront } from './components/ShopEasyStorefront';

export function App() {
  return (
    <ShopEasyProvider>
      <ShopEasyStorefront />
    </ShopEasyProvider>
  );
}

export default App;

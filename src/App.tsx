import './App.scss';
import CMSRoute from './CMSRoute';

// (Only needed if your tsconfig has "jsx": "react" / React 16.
// With "react-jsx" (React 17+), this import is optional.)
// import React from 'react';

export default function App() {
  return (
    <div className="App">
      <CMSRoute />
    </div>
  );
}

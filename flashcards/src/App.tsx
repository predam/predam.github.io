import './App.css';

import React, { useState } from 'react';

import irregular_verbs from './static/irregular_verbs.json';
import { IrregularVerb } from './types';
import Card from './components/Card';

function App() {
  const irregularVerbs = irregular_verbs as IrregularVerb[];
  const [currentIndex, setCurrentIndex] = useState(0);

  const getCurrentVerb = () => {
    return irregularVerbs[currentIndex];
  };

  const next = () => {
    const nextIndex = Math.floor(Math.random() * irregularVerbs.length);
    setCurrentIndex(nextIndex);
  };

  return (
    <div className="grid h-screen place-items-center bg-gray-100 p-5">
      <div>
        <h2 className="mb-5 font-bold text-3xl text-center">Irregular Verbs Flashcards</h2>
        <Card verb={getCurrentVerb()} next={next} />
      </div>
    </div>
  );
}

export default App;

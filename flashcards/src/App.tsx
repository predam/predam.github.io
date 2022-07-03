import './App.css';

import React, { useState } from 'react';

import irregular_verbs from './static/irregular_verbs.json';
import { IrregularVerb } from './types';
import Card from './components/Card';

function App() {
  const irregularVerbs = irregular_verbs as IrregularVerb[];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRandom, setIsRandom] = useState(true);

  const getCurrentVerb = () => {
    return irregularVerbs[currentIndex];
  };

  const next = () => {
    if(isRandom) {
      const nextIndex = Math.floor(Math.random() * irregularVerbs.length);
      setCurrentIndex(nextIndex);
      console.log("random")
      return;
    }
    if(irregularVerbs.length - 1 > currentIndex + 1) {
      setCurrentIndex(value => value + 1);
      return;
    }
    setCurrentIndex(0);
  };

  return (
    <div className="grid h-screen place-items-center bg-gray-100 p-5">
      <div>
        <h2 className="mb-5 font-bold text-3xl text-center">Irregular Verbs Flashcards</h2>
        <Card verb={getCurrentVerb()} next={next} />
        <div className="form-control mt-5">
          <label className="label cursor-pointer">
            <span className="label-text font-semibold">Random</span>
            <input type="checkbox" className="toggle toggle-primary" checked={isRandom} onClick={() => setIsRandom(value => !value)} />
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { IrregularVerb } from '../types';

const Card: React.FC<{ verb: IrregularVerb; next: () => void }> = ({ verb, next }) => {
  const [isHidden, setIsHidden] = useState(true);
  const show = () => {
    setIsHidden(false);
  };
  useEffect(() => {
    setIsHidden(true);
  }, [verb]);
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body text-center">
        {isHidden && <h2 className="font-bold text-lg mt-5 mb-10">{verb.present}</h2>}
        {!isHidden && (
          <>
            <p className="text-xs">Past Simple</p>
            <h2 className="mt-[-10px] font-bold text-lg">{verb.past_simple}</h2>
            <p className="text-xs mb-0 pb-0">Past Participle</p>
            <h2 className="mt-[-10px] font-bold text-lg">{verb.past_participle}</h2>
          </>
        )}
        <div className="card-actions justify-center">
          {isHidden && (
            <button className="btn btn-primary w-full mt-5" onClick={show}>
              Show
            </button>
          )}
          {!isHidden && (
            <button className="btn btn-secondary w-full mt-5" onClick={next}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;

import React from 'react';
import './SplashScreen.css';
import splashImage from '../../assets/splash-image.png';

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="splash-screen">
      <img src={splashImage} alt="Splash" className="splash-image" />
      <button className="start-button" onClick={onStart}>
        Start Game
      </button>
    </div>
  );
};

export default SplashScreen;

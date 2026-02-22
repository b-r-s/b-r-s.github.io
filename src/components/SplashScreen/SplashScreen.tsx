import { GameButton } from '../GameButton/GameButton';
import { NeonColors } from '../../types/neon-hues';
import splashImage from '../../assets/splash-image.png';
import './SplashScreen.css'
import '../../styles/variables.css'

interface SplashScreenProps {
  onStart: () => void;
  onShowInstructions: () => void;
}

export function SplashScreen({ onStart, onShowInstructions }: SplashScreenProps) {
  return (
    <div className="splash-wrapper">
      <div className="splash-container">
        <div className="image-wrapper">
          <img src={splashImage} alt="Splash" className="splash-image" />
        </div>

        <div className="button-row">
          <GameButton
            label="Start Game"
            color='white'
            opacity={0.7}
            hue={NeonColors.Green}
            onClick={onStart}
            fontSize="1.2rem"
          />

          <GameButton
            label="Game Play"
            hue={NeonColors.Green}
            color='white'
            opacity={0.7}
            width={200}
            height={50}
            padding={5}
            onClick={onShowInstructions}
            fontSize="1.2rem"
          />
        </div>
      </div>
    </div>
  );
}
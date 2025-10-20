import { useEffect } from 'react';
import './Splash.css';
import logo from '../../assets/images/logo.png';

export default function Splash({ duration = 800, onFinish }) {
  useEffect(() => {
    const t = setTimeout(() => {
      if (onFinish) onFinish();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onFinish]);

  return (
    <div className="splash-root">
      <div className="splash-inner">
        <img src={logo} alt="logo" className="splash-logo" />
      </div>
    </div>
  );
}

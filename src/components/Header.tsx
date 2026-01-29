import type { GameState } from '../types';
import { getExpForLevel } from '../data/gameData';

interface HeaderProps {
  player: GameState['player'];
}

export function Header({ player }: HeaderProps) {
  const expForNextLevel = getExpForLevel(player.level);
  const expProgress = (player.exp / expForNextLevel) * 100;

  return (
    <header className="header">
      <div className="header-item">
        <span className="emoji">🏪</span>
        <span className="label">武器屋</span>
        <span className="value">Lv.{player.level}</span>
      </div>
      
      <div className="header-item exp-bar-container">
        <div className="exp-bar" style={{ width: `${expProgress}%` }} />
        <span className="exp-text">{player.exp}/{expForNextLevel} EXP</span>
      </div>
      
      <div className="header-item">
        <span className="emoji">💰</span>
        <span className="value gold">{player.gold.toLocaleString()} G</span>
      </div>
    </header>
  );
}

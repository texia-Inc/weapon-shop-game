import type { GameState, MaterialType, WeaponType } from '../types';
import { MATERIALS, WEAPONS } from '../data/gameData';

interface StatsTabProps {
  state: GameState;
  onReset: () => void;
}

export function StatsTab({ state, onReset }: StatsTabProps) {
  const totalMaterials = Object.values(state.inventory.materials).reduce((a, b) => a + (b || 0), 0);
  const totalWeapons = Object.values(state.inventory.weapons).reduce((a, b) => a + (b || 0), 0);
  const activeAdventurers = state.adventurers.filter(a => a.status === 'adventuring').length;

  const handleReset = () => {
    if (confirm('本当にゲームをリセットしますか？全てのデータが失われます。')) {
      onReset();
    }
  };

  return (
    <div className="tab-content stats-tab">
      <h2>📊 ステータス</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>🏪 武器屋</h3>
          <p>レベル: {state.player.level}</p>
          <p>所持金: {state.player.gold.toLocaleString()} G</p>
          <p>売却武器数: {state.totalWeaponsSold}</p>
          <p>買取素材数: {state.totalMaterialsBought}</p>
        </div>

        <div className="stat-card">
          <h3>📦 在庫</h3>
          <p>素材数: {totalMaterials}</p>
          <p>武器数: {totalWeapons}</p>
        </div>

        <div className="stat-card">
          <h3>👥 冒険者</h3>
          <p>合計: {state.adventurers.length}人</p>
          <p>冒険中: {activeAdventurers}人</p>
          <p>平均レベル: {(state.adventurers.reduce((a, b) => a + b.level, 0) / state.adventurers.length).toFixed(1)}</p>
        </div>
      </div>

      <div className="inventory-detail">
        <h3>🪵 素材詳細</h3>
        <div className="material-grid">
          {Object.entries(state.inventory.materials)
            .filter(([, amount]) => (amount || 0) > 0)
            .map(([materialId, amount]) => {
              const material = MATERIALS[materialId as MaterialType];
              return (
                <div key={materialId} className="material-detail">
                  <span>{material.emoji} {material.name}</span>
                  <span>×{amount}</span>
                </div>
              );
            })}
        </div>

        <h3>⚔️ 武器在庫</h3>
        <div className="weapon-grid-small">
          {Object.entries(state.inventory.weapons)
            .filter(([, amount]) => (amount || 0) > 0)
            .map(([weaponId, amount]) => {
              const weapon = WEAPONS[weaponId as WeaponType];
              return (
                <div key={weaponId} className="weapon-detail">
                  <span>{weapon.emoji} {weapon.name}</span>
                  <span>×{amount}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="reset-section">
        <button className="reset-button" onClick={handleReset}>
          🗑️ ゲームをリセット
        </button>
      </div>
    </div>
  );
}

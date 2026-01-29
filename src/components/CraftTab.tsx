import type { GameState, WeaponType, MaterialType } from '../types';
import { WEAPONS, MATERIALS, RANK_COLORS } from '../data/gameData';

interface CraftTabProps {
  state: GameState;
  onCraft: (weapon: WeaponType) => void;
}

export function CraftTab({ state, onCraft }: CraftTabProps) {
  const weapons = Object.values(WEAPONS).sort((a, b) => a.requiredLevel - b.requiredLevel);

  const canCraft = (weapon: typeof WEAPONS[WeaponType]) => {
    if (state.player.level < weapon.requiredLevel) return false;
    for (const [material, amount] of Object.entries(weapon.requiredMaterials)) {
      if ((state.inventory.materials[material as MaterialType] || 0) < (amount || 0)) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="tab-content craft-tab">
      <h2>🔨 武器製作</h2>
      <p className="tab-description">素材を使って武器を製作しましょう。製作した武器は冒険者に販売できます。</p>
      
      <div className="weapon-grid">
        {weapons.map((weapon) => {
          const isLocked = state.player.level < weapon.requiredLevel;
          const hasResources = canCraft(weapon);
          const stockCount = state.inventory.weapons[weapon.id] || 0;

          return (
            <div 
              key={weapon.id} 
              className={`weapon-card ${isLocked ? 'locked' : ''}`}
              style={{ borderColor: RANK_COLORS[weapon.rank] }}
            >
              <div className="weapon-header">
                <span className="weapon-emoji">{weapon.emoji}</span>
                <span className="weapon-name">{weapon.name}</span>
                <span 
                  className="weapon-rank"
                  style={{ color: RANK_COLORS[weapon.rank] }}
                >
                  {weapon.rank === 'bronze' && '🥉'}
                  {weapon.rank === 'silver' && '🥈'}
                  {weapon.rank === 'gold' && '🥇'}
                  {weapon.rank === 'diamond' && '💎'}
                </span>
              </div>

              {isLocked ? (
                <div className="weapon-locked">
                  <span>🔒 Lv.{weapon.requiredLevel}で解放</span>
                </div>
              ) : (
                <>
                  <div className="weapon-materials">
                    <span className="label">必要素材:</span>
                    <div className="material-list">
                      {Object.entries(weapon.requiredMaterials).map(([materialId, amount]) => {
                        const material = MATERIALS[materialId as MaterialType];
                        const owned = state.inventory.materials[materialId as MaterialType] || 0;
                        const enough = owned >= (amount || 0);
                        return (
                          <span 
                            key={materialId} 
                            className={`material-req ${enough ? 'enough' : 'not-enough'}`}
                          >
                            {material.emoji} {owned}/{amount}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="weapon-info">
                    <span>⚔️ +{weapon.attackBonus}</span>
                    <span>💰 {weapon.sellPrice}G</span>
                    {stockCount > 0 && <span className="stock">在庫: {stockCount}</span>}
                  </div>

                  <button
                    className="craft-button"
                    onClick={() => onCraft(weapon.id)}
                    disabled={!hasResources}
                  >
                    {hasResources ? '製作する' : '素材不足'}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

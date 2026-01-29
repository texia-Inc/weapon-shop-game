import { useState } from 'react';
import type { GameState, WeaponType, Adventurer } from '../types';
import { WEAPONS, RANK_COLORS } from '../data/gameData';

interface ShopTabProps {
  state: GameState;
  onSell: (weapon: WeaponType, adventurerId: string) => void;
}

export function ShopTab({ state, onSell }: ShopTabProps) {
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | null>(null);
  
  const availableWeapons = Object.entries(state.inventory.weapons)
    .filter(([, count]) => (count || 0) > 0)
    .map(([id]) => WEAPONS[id as WeaponType]);

  const idleAdventurers = state.adventurers.filter(a => a.status === 'idle');

  const canBuy = (adventurer: Adventurer, weapon: typeof WEAPONS[WeaponType]) => {
    return adventurer.gold >= weapon.sellPrice;
  };

  return (
    <div className="tab-content shop-tab">
      <h2>🛒 ショップ</h2>
      <p className="tab-description">製作した武器を冒険者に販売しましょう。</p>

      {availableWeapons.length === 0 ? (
        <div className="empty-state">
          <p>📦 販売できる武器がありません</p>
          <p>製作タブで武器を作りましょう！</p>
        </div>
      ) : (
        <>
          <h3>📦 在庫武器</h3>
          <div className="shop-weapons">
            {availableWeapons.map((weapon) => (
              <div
                key={weapon.id}
                className={`shop-weapon-card ${selectedWeapon === weapon.id ? 'selected' : ''}`}
                style={{ borderColor: RANK_COLORS[weapon.rank] }}
                onClick={() => setSelectedWeapon(weapon.id)}
              >
                <span className="weapon-emoji">{weapon.emoji}</span>
                <span className="weapon-name">{weapon.name}</span>
                <span className="weapon-price">💰 {weapon.sellPrice}G</span>
                <span className="weapon-count">×{state.inventory.weapons[weapon.id]}</span>
              </div>
            ))}
          </div>

          {selectedWeapon && (
            <>
              <h3>👥 購入できる冒険者</h3>
              {idleAdventurers.length === 0 ? (
                <div className="empty-state">
                  <p>待機中の冒険者がいません</p>
                </div>
              ) : (
                <div className="adventurer-buyers">
                  {idleAdventurers.map((adventurer) => {
                    const weapon = WEAPONS[selectedWeapon];
                    const canAfford = canBuy(adventurer, weapon);
                    const alreadyHas = adventurer.weapon === selectedWeapon;

                    return (
                      <div key={adventurer.id} className="adventurer-buyer-card">
                        <div className="buyer-info">
                          <span className="buyer-name">{adventurer.name}</span>
                          <span className="buyer-level">Lv.{adventurer.level}</span>
                          <span className="buyer-gold">💰 {adventurer.gold}G</span>
                          {adventurer.weapon && (
                            <span className="current-weapon">
                              装備: {WEAPONS[adventurer.weapon].emoji}
                            </span>
                          )}
                        </div>
                        <button
                          className="buy-button"
                          onClick={() => onSell(selectedWeapon, adventurer.id)}
                          disabled={!canAfford || alreadyHas}
                        >
                          {alreadyHas ? '装備中' : canAfford ? '販売する' : 'ゴールド不足'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import type { GameState, MaterialType } from '../types';
import { WEAPONS, DUNGEONS, MATERIALS, getHireCost, getHealCost, getAdventurerExpForLevel } from '../data/gameData';

interface AdventurersTabProps {
  state: GameState;
  onBuyMaterials: (adventurerId: string) => void;
  onHireAdventurer: () => void;
  onHealAdventurer: (adventurerId: string) => void;
}

export function AdventurersTab({ state, onBuyMaterials, onHireAdventurer, onHealAdventurer }: AdventurersTabProps) {
  const [, setTick] = useState(0);
  const hireCost = getHireCost(state.adventurers.length);
  const canHire = state.player.gold >= hireCost && state.adventurers.length < 10;

  // 残り時間を更新するためのタイマー
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeRemaining = (departedAt: number, durationSeconds: number): string => {
    const elapsed = (Date.now() - departedAt) / 1000;
    const remaining = Math.max(0, durationSeconds - elapsed);
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateLootValue = (loot: Partial<Record<MaterialType, number>>): number => {
    let total = 0;
    for (const [material, amount] of Object.entries(loot)) {
      const mat = MATERIALS[material as MaterialType];
      if (mat) {
        total += mat.buyPrice * (amount || 0);
      }
    }
    return total;
  };

  return (
    <div className="tab-content adventurers-tab">
      <h2>👥 冒険者</h2>
      <p className="tab-description">冒険者を管理し、素材を買い取りましょう。</p>

      <div className="hire-section">
        <button
          className="hire-button"
          onClick={onHireAdventurer}
          disabled={!canHire}
        >
          ➕ 新しい冒険者を雇う ({hireCost}G)
        </button>
        <span className="adventurer-count">{state.adventurers.length}/10人</span>
      </div>

      <div className="adventurer-list">
        {state.adventurers.map((adventurer) => {
          const weapon = adventurer.weapon ? WEAPONS[adventurer.weapon] : null;
          const dungeon = adventurer.dungeon ? DUNGEONS[adventurer.dungeon] : null;
          const hpPercent = (adventurer.hp / adventurer.maxHp) * 100;
          const expPercent = (adventurer.exp / getAdventurerExpForLevel(adventurer.level)) * 100;
          const healCost = getHealCost(adventurer);
          const canHeal = adventurer.hp < adventurer.maxHp && state.player.gold >= healCost;
          const lootValue = calculateLootValue(adventurer.loot);
          const canAffordLoot = state.player.gold >= lootValue;

          return (
            <div key={adventurer.id} className={`adventurer-card status-${adventurer.status}`}>
              <div className="adventurer-header">
                <span className="adventurer-name">🧑‍🦱 {adventurer.name}</span>
                <span className="adventurer-level">Lv.{adventurer.level}</span>
                <span className="adventurer-gold">💰 {adventurer.gold}G</span>
              </div>

              <div className="adventurer-bars">
                <div className="bar hp-bar">
                  <div className="bar-fill" style={{ width: `${hpPercent}%` }} />
                  <span className="bar-text">HP: {adventurer.hp}/{adventurer.maxHp}</span>
                </div>
                <div className="bar exp-bar">
                  <div className="bar-fill" style={{ width: `${expPercent}%` }} />
                  <span className="bar-text">EXP: {Math.floor(expPercent)}%</span>
                </div>
              </div>

              <div className="adventurer-stats">
                <span>⚔️ 攻撃: {adventurer.baseAttack + (weapon?.attackBonus || 0)}</span>
                {weapon && (
                  <span className="equipped-weapon">
                    {weapon.emoji} {weapon.name}
                  </span>
                )}
                {!weapon && <span className="no-weapon">素手</span>}
              </div>

              <div className="adventurer-status">
                {adventurer.status === 'idle' && (
                  <div className="status-idle">
                    <span className="status-text">⏸️ 待機中</span>
                    {adventurer.hp < adventurer.maxHp && (
                      <button 
                        className="heal-button"
                        onClick={() => onHealAdventurer(adventurer.id)}
                        disabled={!canHeal}
                      >
                        💊 回復 ({healCost}G)
                      </button>
                    )}
                  </div>
                )}

                {adventurer.status === 'adventuring' && dungeon && adventurer.departedAt && (
                  <div className="status-adventuring">
                    <span className="status-text">
                      🏃 {dungeon.emoji} {dungeon.name}で冒険中
                    </span>
                    <span className="time-remaining">
                      残り {formatTimeRemaining(adventurer.departedAt, dungeon.durationSeconds)}
                    </span>
                  </div>
                )}

                {adventurer.status === 'returned' && (
                  <div className="status-returned">
                    <span className="status-text">✅ 帰還</span>
                    {Object.keys(adventurer.loot).length > 0 ? (
                      <>
                        <div className="loot-display">
                          {Object.entries(adventurer.loot).map(([materialId, amount]) => {
                            const material = MATERIALS[materialId as MaterialType];
                            return (
                              <span key={materialId} className="loot-item">
                                {material.emoji} {amount}
                              </span>
                            );
                          })}
                        </div>
                        <button
                          className="buy-loot-button"
                          onClick={() => onBuyMaterials(adventurer.id)}
                          disabled={!canAffordLoot}
                        >
                          💰 {lootValue}Gで買取
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="no-loot">戦利品なし</span>
                        <button
                          className="dismiss-button"
                          onClick={() => onBuyMaterials(adventurer.id)}
                        >
                          確認
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

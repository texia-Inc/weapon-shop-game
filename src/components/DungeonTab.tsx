import { useState } from 'react';
import type { GameState, DungeonType, Adventurer } from '../types';
import { DUNGEONS, MATERIALS, WEAPONS } from '../data/gameData';

interface DungeonTabProps {
  state: GameState;
  onSendToDungeon: (adventurerId: string, dungeon: DungeonType, runs?: number) => void;
}

const RUN_OPTIONS = [1, 5, 10, 20, 50];

export function DungeonTab({ state, onSendToDungeon }: DungeonTabProps) {
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonType | null>(null);
  const [selectedRuns, setSelectedRuns] = useState<number>(1);
  const dungeons = Object.values(DUNGEONS);
  const idleAdventurers = state.adventurers.filter(a => a.status === 'idle' && a.hp > 0);

  const canEnter = (adventurer: Adventurer, dungeon: typeof DUNGEONS[DungeonType]) => {
    return adventurer.level >= dungeon.requiredLevel;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分`;
  };

  return (
    <div className="tab-content dungeon-tab">
      <h2>🗺️ ダンジョン</h2>
      <p className="tab-description">冒険者をダンジョンに送り出して素材を集めましょう。</p>

      <div className="dungeon-grid">
        {dungeons.map((dungeon) => (
          <div
            key={dungeon.id}
            className={`dungeon-card ${selectedDungeon === dungeon.id ? 'selected' : ''}`}
            onClick={() => setSelectedDungeon(dungeon.id)}
          >
            <div className="dungeon-header">
              <span className="dungeon-emoji">{dungeon.emoji}</span>
              <span className="dungeon-name">{dungeon.name}</span>
            </div>
            
            <div className="dungeon-info">
              <span className="dungeon-level">🎯 必要Lv.{dungeon.requiredLevel}</span>
              <span className="dungeon-time">⏱️ {formatDuration(dungeon.durationSeconds)}</span>
              <span className="dungeon-difficulty">💀 難易度: {dungeon.difficulty}</span>
            </div>
            
            <div className="dungeon-drops">
              <span className="drops-label">ドロップ:</span>
              <div className="drops-list">
                {dungeon.possibleDrops.map((drop) => {
                  const material = MATERIALS[drop.material];
                  return (
                    <span key={drop.material} className="drop-item" title={`${material.name}: ${Math.floor(drop.chance * 100)}%`}>
                      {material.emoji}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDungeon && (
        <>
          <div className="run-selector">
            <h3>🔄 周回数</h3>
            <div className="run-options">
              {RUN_OPTIONS.map((runs) => (
                <button
                  key={runs}
                  className={`run-option ${selectedRuns === runs ? 'selected' : ''}`}
                  onClick={() => setSelectedRuns(runs)}
                >
                  {runs}回
                </button>
              ))}
            </div>
            <p className="run-info">
              ⏱️ 予想時間: {formatDuration(DUNGEONS[selectedDungeon].durationSeconds * selectedRuns)}
              　💡 HPが無くなると自動終了
            </p>
          </div>

          <h3>🏃 派遣可能な冒険者</h3>
          {idleAdventurers.length === 0 ? (
            <div className="empty-state">
              <p>派遣できる冒険者がいません</p>
              <p>（待機中でHP &gt; 0の冒険者が必要です）</p>
            </div>
          ) : (
            <div className="adventurer-dispatch">
              {idleAdventurers.map((adventurer) => {
                const dungeon = DUNGEONS[selectedDungeon];
                const canGo = canEnter(adventurer, dungeon);
                const weapon = adventurer.weapon ? WEAPONS[adventurer.weapon] : null;
                const totalAttack = adventurer.baseAttack + (weapon?.attackBonus || 0);
                const successRate = Math.min(95, Math.floor(50 + (totalAttack - dungeon.difficulty) * 2));

                return (
                  <div key={adventurer.id} className="dispatch-card">
                    <div className="dispatch-info">
                      <span className="dispatch-name">🧑‍🦱 {adventurer.name}</span>
                      <span className="dispatch-level">Lv.{adventurer.level}</span>
                      <span className="dispatch-hp">❤️ {adventurer.hp}/{adventurer.maxHp}</span>
                      <span className="dispatch-attack">⚔️ {totalAttack}</span>
                      {weapon && <span className="dispatch-weapon">{weapon.emoji}</span>}
                    </div>
                    <div className="dispatch-rate">
                      成功率: <span className={successRate >= 70 ? 'high' : successRate >= 40 ? 'mid' : 'low'}>
                        {successRate}%
                      </span>
                    </div>
                    <button
                      className="dispatch-button"
                      onClick={() => onSendToDungeon(adventurer.id, selectedDungeon, selectedRuns)}
                      disabled={!canGo}
                    >
                      {canGo ? `${selectedRuns}回派遣` : `Lv.${dungeon.requiredLevel}必要`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useReducer, useEffect, useCallback } from 'react';
import type { GameState, GameAction, Adventurer, MaterialType, WeaponType, DungeonType } from '../types';
import {
  WEAPONS,
  DUNGEONS,
  MATERIALS,
  ADVENTURER_NAMES,
  getExpForLevel,
  getAdventurerExpForLevel,
  calculateMaxHp,
  calculateBaseAttack,
  getHireCost,
  getHealCost,
} from '../data/gameData';

const STORAGE_KEY = 'weaponshop_save';
const MAX_OFFLINE_HOURS = 24;

// 初期冒険者を生成
const createAdventurer = (existingNames: string[]): Adventurer => {
  const availableNames = ADVENTURER_NAMES.filter(n => !existingNames.includes(n));
  const name = availableNames[Math.floor(Math.random() * availableNames.length)] || `冒険者${Date.now()}`;
  const maxHp = calculateMaxHp(1);
  return {
    id: `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    level: 1,
    exp: 0,
    hp: maxHp,
    maxHp,
    baseAttack: calculateBaseAttack(1),
    weapon: null,
    status: 'idle',
    dungeon: null,
    departedAt: null,
    loot: {},
    gold: 30,
    targetRuns: 0,
    completedRuns: 0,
  };
};

// 初期状態
const createInitialState = (): GameState => {
  const adv1 = createAdventurer([]);
  const adv2 = createAdventurer([adv1.name]);
  return {
    player: {
      level: 1,
      exp: 0,
      gold: 100,
    },
    inventory: {
      materials: { wood: 10 },
      weapons: {},
    },
    adventurers: [adv1, adv2],
    lastUpdated: Date.now(),
    totalWeaponsSold: 0,
    totalMaterialsBought: 0,
  };
};

// 素材が足りているかチェック
const hasMaterials = (
  inventory: Partial<Record<MaterialType, number>>,
  required: Partial<Record<MaterialType, number>>
): boolean => {
  for (const [material, amount] of Object.entries(required)) {
    if ((inventory[material as MaterialType] || 0) < (amount || 0)) {
      return false;
    }
  }
  return true;
};

// 素材を消費
const consumeMaterials = (
  inventory: Partial<Record<MaterialType, number>>,
  required: Partial<Record<MaterialType, number>>
): Partial<Record<MaterialType, number>> => {
  const newInventory = { ...inventory };
  for (const [material, amount] of Object.entries(required)) {
    newInventory[material as MaterialType] = (newInventory[material as MaterialType] || 0) - (amount || 0);
  }
  return newInventory;
};

// ダンジョンの戦利品を計算
const calculateLoot = (dungeon: DungeonType, adventurerLevel: number): Partial<Record<MaterialType, number>> => {
  const dungeonData = DUNGEONS[dungeon];
  const loot: Partial<Record<MaterialType, number>> = {};
  
  for (const drop of dungeonData.possibleDrops) {
    // レベルが高いほどドロップ率上昇
    const adjustedChance = Math.min(drop.chance * (1 + adventurerLevel * 0.05), 0.95);
    if (Math.random() < adjustedChance) {
      const amount = Math.floor(Math.random() * (drop.maxAmount - drop.minAmount + 1)) + drop.minAmount;
      loot[drop.material] = (loot[drop.material] || 0) + amount;
    }
  }
  
  return loot;
};

// ダンジョン成功判定
const isDungeonSuccess = (adventurer: Adventurer, dungeon: DungeonType): { success: boolean; damage: number } => {
  const dungeonData = DUNGEONS[dungeon];
  const weapon = adventurer.weapon ? WEAPONS[adventurer.weapon] : null;
  const totalAttack = adventurer.baseAttack + (weapon?.attackBonus || 0);
  
  // 成功率計算: 攻撃力とダンジョン難易度の比較
  const successRate = Math.min(0.95, 0.5 + (totalAttack - dungeonData.difficulty) * 0.02);
  const success = Math.random() < successRate;
  
  // ダメージ計算
  const baseDamage = Math.floor(dungeonData.difficulty * 0.5);
  const damage = success 
    ? Math.floor(baseDamage * 0.3) 
    : Math.floor(baseDamage * 1.5);
  
  return { success, damage };
};

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CRAFT_WEAPON': {
      const weapon = WEAPONS[action.weapon];
      if (!weapon) return state;
      if (state.player.level < weapon.requiredLevel) return state;
      if (!hasMaterials(state.inventory.materials, weapon.requiredMaterials)) return state;
      
      return {
        ...state,
        inventory: {
          ...state.inventory,
          materials: consumeMaterials(state.inventory.materials, weapon.requiredMaterials),
          weapons: {
            ...state.inventory.weapons,
            [action.weapon]: (state.inventory.weapons[action.weapon] || 0) + 1,
          },
        },
        lastUpdated: Date.now(),
      };
    }

    case 'SELL_WEAPON': {
      const weapon = WEAPONS[action.weapon];
      const adventurer = state.adventurers.find(a => a.id === action.adventurerId);
      if (!weapon || !adventurer) return state;
      if ((state.inventory.weapons[action.weapon] || 0) < 1) return state;
      if (adventurer.gold < weapon.sellPrice) return state;
      if (adventurer.status !== 'idle') return state;
      
      // 経験値計算
      const expGain = Math.floor(weapon.sellPrice * 0.5);
      let newExp = state.player.exp + expGain;
      let newLevel = state.player.level;
      
      while (newExp >= getExpForLevel(newLevel)) {
        newExp -= getExpForLevel(newLevel);
        newLevel++;
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + weapon.sellPrice,
          exp: newExp,
          level: newLevel,
        },
        inventory: {
          ...state.inventory,
          weapons: {
            ...state.inventory.weapons,
            [action.weapon]: (state.inventory.weapons[action.weapon] || 0) - 1,
          },
        },
        adventurers: state.adventurers.map(a =>
          a.id === action.adventurerId
            ? { ...a, weapon: action.weapon, gold: a.gold - weapon.sellPrice }
            : a
        ),
        totalWeaponsSold: state.totalWeaponsSold + 1,
        lastUpdated: Date.now(),
      };
    }

    case 'SEND_TO_DUNGEON': {
      const adventurer = state.adventurers.find(a => a.id === action.adventurerId);
      const dungeon = DUNGEONS[action.dungeon];
      if (!adventurer || !dungeon) return state;
      if (adventurer.status !== 'idle' && adventurer.status !== 'returned') return state;
      if (adventurer.level < dungeon.requiredLevel) return state;
      if (adventurer.hp <= 0) return state;
      
      const runs = action.runs || 1;
      const isNewRun = adventurer.status === 'idle';
      
      return {
        ...state,
        adventurers: state.adventurers.map(a =>
          a.id === action.adventurerId
            ? {
                ...a,
                status: 'adventuring' as const,
                dungeon: action.dungeon,
                departedAt: Date.now(),
                // 新規開始時のみlootをリセット、周回継続時は維持
                loot: isNewRun ? {} : a.loot,
                targetRuns: isNewRun ? runs : a.targetRuns,
                completedRuns: isNewRun ? 0 : a.completedRuns,
              }
            : a
        ),
        lastUpdated: Date.now(),
      };
    }

    case 'RETURN_FROM_DUNGEON': {
      const adventurer = state.adventurers.find(a => a.id === action.adventurerId);
      if (!adventurer || adventurer.status !== 'adventuring' || !adventurer.dungeon) return state;
      
      const dungeon = DUNGEONS[adventurer.dungeon];
      const elapsedTime = (Date.now() - (adventurer.departedAt || 0)) / 1000;
      if (elapsedTime < dungeon.durationSeconds) return state;
      
      const { success, damage } = isDungeonSuccess(adventurer, adventurer.dungeon);
      const newLoot = success ? calculateLoot(adventurer.dungeon, adventurer.level) : {};
      const newHp = Math.max(0, adventurer.hp - damage);
      
      // 戦利品を累積
      const accumulatedLoot = { ...adventurer.loot };
      for (const [material, amount] of Object.entries(newLoot)) {
        accumulatedLoot[material as MaterialType] = (accumulatedLoot[material as MaterialType] || 0) + (amount || 0);
      }
      
      // 経験値
      const expGain = success ? Math.floor(dungeon.difficulty * 2) : Math.floor(dungeon.difficulty * 0.5);
      let newAdvExp = adventurer.exp + expGain;
      let newAdvLevel = adventurer.level;
      let newMaxHp = adventurer.maxHp;
      let newBaseAttack = adventurer.baseAttack;
      
      while (newAdvExp >= getAdventurerExpForLevel(newAdvLevel)) {
        newAdvExp -= getAdventurerExpForLevel(newAdvLevel);
        newAdvLevel++;
        newMaxHp = calculateMaxHp(newAdvLevel);
        newBaseAttack = calculateBaseAttack(newAdvLevel);
      }
      
      const newCompletedRuns = adventurer.completedRuns + 1;
      const hasMoreRuns = newCompletedRuns < adventurer.targetRuns && newHp > 0;
      
      return {
        ...state,
        adventurers: state.adventurers.map(a =>
          a.id === action.adventurerId
            ? {
                ...a,
                // 周回が残っていてHPがあれば自動で次へ
                status: hasMoreRuns ? 'adventuring' as const : 'returned' as const,
                departedAt: hasMoreRuns ? Date.now() : null,
                hp: newHp,
                exp: newAdvExp,
                level: newAdvLevel,
                maxHp: newMaxHp,
                baseAttack: newBaseAttack,
                loot: accumulatedLoot,
                gold: a.gold + (success ? Math.floor(dungeon.difficulty * 0.5) : 0),
                completedRuns: newCompletedRuns,
                // 周回完了またはHP切れで終了時はリセット
                targetRuns: hasMoreRuns ? a.targetRuns : 0,
              }
            : a
        ),
        lastUpdated: Date.now(),
      };
    }

    case 'BUY_MATERIALS': {
      const adventurer = state.adventurers.find(a => a.id === action.adventurerId);
      if (!adventurer || adventurer.status !== 'returned') return state;
      if (Object.keys(adventurer.loot).length === 0) {
        // 戦利品がない場合は状態をidleに戻すだけ
        return {
          ...state,
          adventurers: state.adventurers.map(a =>
            a.id === action.adventurerId
              ? { ...a, status: 'idle' as const, dungeon: null, departedAt: null, loot: {} }
              : a
          ),
          lastUpdated: Date.now(),
        };
      }
      
      // 買取金額計算
      let totalCost = 0;
      for (const [material, amount] of Object.entries(adventurer.loot)) {
        const mat = MATERIALS[material as MaterialType];
        if (mat) {
          totalCost += mat.buyPrice * (amount || 0);
        }
      }
      
      if (state.player.gold < totalCost) return state;
      
      // 素材を在庫に追加
      const newMaterials = { ...state.inventory.materials };
      for (const [material, amount] of Object.entries(adventurer.loot)) {
        newMaterials[material as MaterialType] = (newMaterials[material as MaterialType] || 0) + (amount || 0);
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - totalCost,
        },
        inventory: {
          ...state.inventory,
          materials: newMaterials,
        },
        adventurers: state.adventurers.map(a =>
          a.id === action.adventurerId
            ? {
                ...a,
                status: 'idle' as const,
                dungeon: null,
                departedAt: null,
                loot: {},
                gold: a.gold + totalCost,
              }
            : a
        ),
        totalMaterialsBought: state.totalMaterialsBought + Object.values(adventurer.loot).reduce((a, b) => a + (b || 0), 0),
        lastUpdated: Date.now(),
      };
    }

    case 'SKIP_MATERIALS': {
      const adventurer = state.adventurers.find(a => a.id === action.adventurerId);
      if (!adventurer || adventurer.status !== 'returned') return state;
      
      // 素材を買い取らずに冒険者をidleに戻す（素材は消失）
      return {
        ...state,
        adventurers: state.adventurers.map(a =>
          a.id === action.adventurerId
            ? { ...a, status: 'idle' as const, dungeon: null, departedAt: null, loot: {} }
            : a
        ),
        lastUpdated: Date.now(),
      };
    }

    case 'SELL_WEAPON_DIRECT': {
      const weapon = WEAPONS[action.weapon];
      if (!weapon) return state;
      if ((state.inventory.weapons[action.weapon] || 0) < 1) return state;
      
      // 在庫から武器を直接売却（半額）
      const sellPrice = Math.floor(weapon.sellPrice * 0.5);
      
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + sellPrice,
        },
        inventory: {
          ...state.inventory,
          weapons: {
            ...state.inventory.weapons,
            [action.weapon]: (state.inventory.weapons[action.weapon] || 0) - 1,
          },
        },
        lastUpdated: Date.now(),
      };
    }

    case 'HIRE_ADVENTURER': {
      const cost = getHireCost(state.adventurers.length);
      if (state.player.gold < cost) return state;
      if (state.adventurers.length >= 10) return state;
      
      const existingNames = state.adventurers.map(a => a.name);
      const newAdventurer = createAdventurer(existingNames);
      
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - cost,
        },
        adventurers: [...state.adventurers, newAdventurer],
        lastUpdated: Date.now(),
      };
    }

    case 'HEAL_ADVENTURER': {
      const adventurer = state.adventurers.find(a => a.id === action.adventurerId);
      if (!adventurer) return state;
      if (adventurer.hp >= adventurer.maxHp) return state;
      
      const cost = getHealCost(adventurer);
      if (state.player.gold < cost) return state;
      
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - cost,
        },
        adventurers: state.adventurers.map(a =>
          a.id === action.adventurerId
            ? { ...a, hp: a.maxHp }
            : a
        ),
        lastUpdated: Date.now(),
      };
    }

    case 'PROCESS_OFFLINE_TIME': {
      const now = Date.now();
      const offlineSeconds = Math.min(
        (now - state.lastUpdated) / 1000,
        MAX_OFFLINE_HOURS * 60 * 60
      );
      
      if (offlineSeconds < 1) return state;
      
      // 冒険中の冒険者を処理（オフライン周回対応）
      let newState = { ...state };
      
      for (const adventurer of state.adventurers) {
        if (adventurer.status === 'adventuring' && adventurer.dungeon && adventurer.departedAt) {
          const dungeon = DUNGEONS[adventurer.dungeon];
          let remainingTime = offlineSeconds + ((now - adventurer.departedAt) / 1000) - dungeon.durationSeconds;
          let currentAdventurer = newState.adventurers.find(a => a.id === adventurer.id)!;
          
          // 最初の1周が完了しているか
          const firstRunElapsed = (now - adventurer.departedAt) / 1000;
          if (firstRunElapsed < dungeon.durationSeconds) {
            continue; // まだ1周目が終わってない
          }
          
          // 1周目を処理
          newState = gameReducer(newState, { type: 'RETURN_FROM_DUNGEON', adventurerId: adventurer.id });
          currentAdventurer = newState.adventurers.find(a => a.id === adventurer.id)!;
          
          // 残りの周回をオフラインで処理
          while (
            remainingTime >= dungeon.durationSeconds &&
            currentAdventurer.status === 'adventuring' &&
            currentAdventurer.hp > 0 &&
            currentAdventurer.completedRuns < currentAdventurer.targetRuns
          ) {
            // この周の結果を計算
            const { success, damage } = isDungeonSuccess(currentAdventurer, adventurer.dungeon);
            const newLoot = success ? calculateLoot(adventurer.dungeon, currentAdventurer.level) : {};
            const newHp = Math.max(0, currentAdventurer.hp - damage);
            
            // 戦利品を累積
            const accumulatedLoot = { ...currentAdventurer.loot };
            for (const [material, amount] of Object.entries(newLoot)) {
              accumulatedLoot[material as MaterialType] = (accumulatedLoot[material as MaterialType] || 0) + (amount || 0);
            }
            
            // 経験値
            const expGain = success ? Math.floor(dungeon.difficulty * 2) : Math.floor(dungeon.difficulty * 0.5);
            let newAdvExp = currentAdventurer.exp + expGain;
            let newAdvLevel = currentAdventurer.level;
            let newMaxHp = currentAdventurer.maxHp;
            let newBaseAttack = currentAdventurer.baseAttack;
            
            while (newAdvExp >= getAdventurerExpForLevel(newAdvLevel)) {
              newAdvExp -= getAdventurerExpForLevel(newAdvLevel);
              newAdvLevel++;
              newMaxHp = calculateMaxHp(newAdvLevel);
              newBaseAttack = calculateBaseAttack(newAdvLevel);
            }
            
            const newCompletedRuns = currentAdventurer.completedRuns + 1;
            const hasMoreRuns = newCompletedRuns < currentAdventurer.targetRuns && newHp > 0;
            
            // 状態を更新
            newState = {
              ...newState,
              adventurers: newState.adventurers.map(a =>
                a.id === adventurer.id
                  ? {
                      ...a,
                      status: hasMoreRuns ? 'adventuring' as const : 'returned' as const,
                      departedAt: hasMoreRuns ? now : null,
                      hp: newHp,
                      exp: newAdvExp,
                      level: newAdvLevel,
                      maxHp: newMaxHp,
                      baseAttack: newBaseAttack,
                      loot: accumulatedLoot,
                      gold: a.gold + (success ? Math.floor(dungeon.difficulty * 0.5) : 0),
                      completedRuns: newCompletedRuns,
                      targetRuns: hasMoreRuns ? a.targetRuns : 0,
                    }
                  : a
              ),
            };
            
            currentAdventurer = newState.adventurers.find(a => a.id === adventurer.id)!;
            remainingTime -= dungeon.durationSeconds;
          }
        }
      }
      
      return {
        ...newState,
        lastUpdated: now,
      };
    }

    case 'TICK': {
      // 冒険完了チェック
      let hasChanges = false;
      let newState = state;
      
      for (const adventurer of state.adventurers) {
        if (adventurer.status === 'adventuring' && adventurer.dungeon && adventurer.departedAt) {
          const dungeon = DUNGEONS[adventurer.dungeon];
          const elapsed = (Date.now() - adventurer.departedAt) / 1000;
          
          if (elapsed >= dungeon.durationSeconds) {
            newState = gameReducer(newState, { type: 'RETURN_FROM_DUNGEON', adventurerId: adventurer.id });
            hasChanges = true;
          }
        }
      }
      
      if (hasChanges) {
        return { ...newState, lastUpdated: Date.now() };
      }
      return state;
    }

    case 'LOAD_GAME': {
      return action.state;
    }

    case 'RESET_GAME': {
      localStorage.removeItem(STORAGE_KEY);
      return createInitialState();
    }

    default:
      return state;
  }
}

// カスタムフック
export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch {
        return createInitialState();
      }
    }
    return createInitialState();
  });

  // ゲーム起動時にオフライン時間を処理
  useEffect(() => {
    dispatch({ type: 'PROCESS_OFFLINE_TIME' });
  }, []);

  // 自動保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // 定期的なTick
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const craftWeapon = useCallback((weapon: WeaponType) => {
    dispatch({ type: 'CRAFT_WEAPON', weapon });
  }, []);

  const sellWeapon = useCallback((weapon: WeaponType, adventurerId: string) => {
    dispatch({ type: 'SELL_WEAPON', weapon, adventurerId });
  }, []);

  const sendToDungeon = useCallback((adventurerId: string, dungeon: DungeonType, runs?: number) => {
    dispatch({ type: 'SEND_TO_DUNGEON', adventurerId, dungeon, runs });
  }, []);

  const buyMaterials = useCallback((adventurerId: string) => {
    dispatch({ type: 'BUY_MATERIALS', adventurerId });
  }, []);

  const skipMaterials = useCallback((adventurerId: string) => {
    dispatch({ type: 'SKIP_MATERIALS', adventurerId });
  }, []);

  const sellWeaponDirect = useCallback((weapon: WeaponType) => {
    dispatch({ type: 'SELL_WEAPON_DIRECT', weapon });
  }, []);

  const hireAdventurer = useCallback(() => {
    dispatch({ type: 'HIRE_ADVENTURER' });
  }, []);

  const healAdventurer = useCallback((adventurerId: string) => {
    dispatch({ type: 'HEAL_ADVENTURER', adventurerId });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    state,
    craftWeapon,
    sellWeapon,
    sellWeaponDirect,
    sendToDungeon,
    buyMaterials,
    skipMaterials,
    hireAdventurer,
    healAdventurer,
    resetGame,
  };
}

// 素材タイプ
export type MaterialType = 
  | 'wood' | 'herb' | 'iron_ore' | 'stone' 
  | 'steel' | 'leather' | 'gem' | 'mithril' | 'ancient_fragment';

// 武器ランク
export type WeaponRank = 'bronze' | 'silver' | 'gold' | 'diamond';

// 武器タイプ
export type WeaponType = 
  | 'wooden_sword' | 'wooden_staff' | 'wooden_bow'
  | 'iron_sword' | 'iron_axe' | 'iron_spear'
  | 'steel_sword' | 'steel_hammer'
  | 'mithril_sword' | 'mithril_bow';

// ダンジョンタイプ
export type DungeonType = 'forest' | 'cave' | 'abandoned_mine' | 'ancient_ruins';

// 冒険者の状態
export type AdventurerStatus = 'idle' | 'adventuring' | 'returned';

// 素材定義
export interface Material {
  id: MaterialType;
  name: string;
  emoji: string;
  buyPrice: number;
}

// 武器定義
export interface Weapon {
  id: WeaponType;
  name: string;
  emoji: string;
  rank: WeaponRank;
  requiredMaterials: Partial<Record<MaterialType, number>>;
  sellPrice: number;
  requiredLevel: number;
  attackBonus: number;
}

// ダンジョン定義
export interface Dungeon {
  id: DungeonType;
  name: string;
  emoji: string;
  requiredLevel: number;
  durationSeconds: number;
  possibleDrops: { material: MaterialType; chance: number; minAmount: number; maxAmount: number }[];
  difficulty: number;
}

// 冒険者
export interface Adventurer {
  id: string;
  name: string;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  baseAttack: number;
  weapon: WeaponType | null;
  status: AdventurerStatus;
  dungeon: DungeonType | null;
  departedAt: number | null;
  loot: Partial<Record<MaterialType, number>>;
  gold: number;
  // 周回機能
  targetRuns: number;      // 目標周回数
  completedRuns: number;   // 完了した周回数
}

// ゲーム状態
export interface GameState {
  player: {
    level: number;
    exp: number;
    gold: number;
  };
  inventory: {
    materials: Partial<Record<MaterialType, number>>;
    weapons: Partial<Record<WeaponType, number>>;
  };
  adventurers: Adventurer[];
  lastUpdated: number;
  totalWeaponsSold: number;
  totalMaterialsBought: number;
  lastBailout: number | null;  // 最後に緊急資金を使った時刻
}

// アクション
export type GameAction =
  | { type: 'CRAFT_WEAPON'; weapon: WeaponType }
  | { type: 'SELL_WEAPON'; weapon: WeaponType; adventurerId: string }
  | { type: 'SELL_WEAPON_DIRECT'; weapon: WeaponType }
  | { type: 'SEND_TO_DUNGEON'; adventurerId: string; dungeon: DungeonType; runs?: number }
  | { type: 'RETURN_FROM_DUNGEON'; adventurerId: string }
  | { type: 'BUY_MATERIALS'; adventurerId: string }
  | { type: 'SKIP_MATERIALS'; adventurerId: string }
  | { type: 'PROCESS_OFFLINE_TIME' }
  | { type: 'TICK' }
  | { type: 'HIRE_ADVENTURER' }
  | { type: 'HEAL_ADVENTURER'; adventurerId: string }
  | { type: 'BAILOUT' }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' };

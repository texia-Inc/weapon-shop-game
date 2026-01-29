import type { Material, Weapon, Dungeon, MaterialType, WeaponType, DungeonType } from '../types';

// 素材データ
export const MATERIALS: Record<MaterialType, Material> = {
  wood: { id: 'wood', name: '木材', emoji: '🪵', buyPrice: 2 },
  herb: { id: 'herb', name: '薬草', emoji: '🌿', buyPrice: 3 },
  iron_ore: { id: 'iron_ore', name: '鉄鉱石', emoji: '🪨', buyPrice: 5 },
  stone: { id: 'stone', name: '石材', emoji: '🧱', buyPrice: 4 },
  steel: { id: 'steel', name: '鋼', emoji: '⚙️', buyPrice: 15 },
  leather: { id: 'leather', name: '革', emoji: '🟤', buyPrice: 8 },
  gem: { id: 'gem', name: '宝石', emoji: '💎', buyPrice: 50 },
  mithril: { id: 'mithril', name: 'ミスリル', emoji: '✨', buyPrice: 100 },
  ancient_fragment: { id: 'ancient_fragment', name: '古代の欠片', emoji: '🔮', buyPrice: 200 },
};

// 武器データ
export const WEAPONS: Record<WeaponType, Weapon> = {
  wooden_sword: {
    id: 'wooden_sword',
    name: '木の剣',
    emoji: '🗡️',
    rank: 'bronze',
    requiredMaterials: { wood: 3 },
    sellPrice: 10,
    requiredLevel: 1,
    attackBonus: 5,
  },
  wooden_staff: {
    id: 'wooden_staff',
    name: '木の杖',
    emoji: '🪄',
    rank: 'bronze',
    requiredMaterials: { wood: 4, herb: 2 },
    sellPrice: 15,
    requiredLevel: 1,
    attackBonus: 4,
  },
  wooden_bow: {
    id: 'wooden_bow',
    name: '木の弓',
    emoji: '🏹',
    rank: 'bronze',
    requiredMaterials: { wood: 5 },
    sellPrice: 12,
    requiredLevel: 2,
    attackBonus: 6,
  },
  iron_sword: {
    id: 'iron_sword',
    name: '鉄の剣',
    emoji: '⚔️',
    rank: 'silver',
    requiredMaterials: { iron_ore: 5 },
    sellPrice: 50,
    requiredLevel: 3,
    attackBonus: 15,
  },
  iron_axe: {
    id: 'iron_axe',
    name: '鉄の斧',
    emoji: '🪓',
    rank: 'silver',
    requiredMaterials: { iron_ore: 4, wood: 2 },
    sellPrice: 45,
    requiredLevel: 3,
    attackBonus: 18,
  },
  iron_spear: {
    id: 'iron_spear',
    name: '鉄の槍',
    emoji: '🔱',
    rank: 'silver',
    requiredMaterials: { iron_ore: 3, wood: 3 },
    sellPrice: 40,
    requiredLevel: 4,
    attackBonus: 14,
  },
  steel_sword: {
    id: 'steel_sword',
    name: '鋼の剣',
    emoji: '🗡️',
    rank: 'gold',
    requiredMaterials: { steel: 3, leather: 2 },
    sellPrice: 200,
    requiredLevel: 5,
    attackBonus: 35,
  },
  steel_hammer: {
    id: 'steel_hammer',
    name: '鋼のハンマー',
    emoji: '🔨',
    rank: 'gold',
    requiredMaterials: { steel: 5, stone: 3 },
    sellPrice: 250,
    requiredLevel: 6,
    attackBonus: 45,
  },
  mithril_sword: {
    id: 'mithril_sword',
    name: 'ミスリルソード',
    emoji: '✨',
    rank: 'diamond',
    requiredMaterials: { mithril: 5, gem: 1 },
    sellPrice: 1000,
    requiredLevel: 10,
    attackBonus: 80,
  },
  mithril_bow: {
    id: 'mithril_bow',
    name: 'ミスリルボウ',
    emoji: '🌟',
    rank: 'diamond',
    requiredMaterials: { mithril: 4, ancient_fragment: 2 },
    sellPrice: 1200,
    requiredLevel: 12,
    attackBonus: 90,
  },
};

// ダンジョンデータ
export const DUNGEONS: Record<DungeonType, Dungeon> = {
  forest: {
    id: 'forest',
    name: '森',
    emoji: '🌲',
    requiredLevel: 1,
    durationSeconds: 60,
    possibleDrops: [
      { material: 'wood', chance: 0.8, minAmount: 1, maxAmount: 3 },
      { material: 'herb', chance: 0.5, minAmount: 1, maxAmount: 2 },
      { material: 'leather', chance: 0.2, minAmount: 1, maxAmount: 1 },
    ],
    difficulty: 10,
  },
  cave: {
    id: 'cave',
    name: '洞窟',
    emoji: '🕳️',
    requiredLevel: 3,
    durationSeconds: 180,
    possibleDrops: [
      { material: 'iron_ore', chance: 0.7, minAmount: 1, maxAmount: 3 },
      { material: 'stone', chance: 0.6, minAmount: 1, maxAmount: 4 },
      { material: 'gem', chance: 0.1, minAmount: 1, maxAmount: 1 },
    ],
    difficulty: 25,
  },
  abandoned_mine: {
    id: 'abandoned_mine',
    name: '廃鉱山',
    emoji: '⛏️',
    requiredLevel: 5,
    durationSeconds: 300,
    possibleDrops: [
      { material: 'steel', chance: 0.6, minAmount: 1, maxAmount: 2 },
      { material: 'gem', chance: 0.3, minAmount: 1, maxAmount: 2 },
      { material: 'iron_ore', chance: 0.5, minAmount: 2, maxAmount: 4 },
    ],
    difficulty: 50,
  },
  ancient_ruins: {
    id: 'ancient_ruins',
    name: '古代遺跡',
    emoji: '🏛️',
    requiredLevel: 10,
    durationSeconds: 600,
    possibleDrops: [
      { material: 'mithril', chance: 0.5, minAmount: 1, maxAmount: 2 },
      { material: 'ancient_fragment', chance: 0.3, minAmount: 1, maxAmount: 1 },
      { material: 'gem', chance: 0.4, minAmount: 1, maxAmount: 3 },
    ],
    difficulty: 100,
  },
};

// 冒険者の名前リスト
export const ADVENTURER_NAMES = [
  'アレックス', 'ベン', 'カイル', 'ダナ', 'エマ',
  'フィン', 'グレン', 'ハナ', 'イリス', 'ジャック',
  'ケイト', 'リオ', 'ミア', 'ノア', 'オリビア',
  'ピート', 'クイン', 'レイ', 'サラ', 'トム',
];

// レベルアップに必要な経験値
export const getExpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// 冒険者のレベルアップに必要な経験値
export const getAdventurerExpForLevel = (level: number): number => {
  return Math.floor(50 * Math.pow(1.3, level - 1));
};

// 冒険者の最大HP計算
export const calculateMaxHp = (level: number): number => {
  return 50 + (level - 1) * 20;
};

// 冒険者の基本攻撃力計算
export const calculateBaseAttack = (level: number): number => {
  return 5 + (level - 1) * 3;
};

// 冒険者の雇用コスト
export const getHireCost = (currentCount: number): number => {
  return Math.floor(100 * Math.pow(2, currentCount));
};

// 回復コスト
export const getHealCost = (adventurer: { hp: number; maxHp: number }): number => {
  const missingHp = adventurer.maxHp - adventurer.hp;
  return Math.floor(missingHp * 0.5);
};

// ランクカラー
export const RANK_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#B9F2FF',
};

import type { MaterialType } from '../types';
import { MATERIALS } from '../data/gameData';

interface MaterialsDisplayProps {
  materials: Partial<Record<MaterialType, number>>;
}

export function MaterialsDisplay({ materials }: MaterialsDisplayProps) {
  const entries = Object.entries(materials).filter(([, amount]) => (amount || 0) > 0);
  
  if (entries.length === 0) {
    return <div className="materials-empty">素材なし</div>;
  }

  return (
    <div className="materials-display">
      {entries.map(([materialId, amount]) => {
        const material = MATERIALS[materialId as MaterialType];
        if (!material) return null;
        return (
          <div key={materialId} className="material-item" title={material.name}>
            <span className="material-emoji">{material.emoji}</span>
            <span className="material-amount">{amount}</span>
          </div>
        );
      })}
    </div>
  );
}

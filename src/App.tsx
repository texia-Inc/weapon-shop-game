import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { Header } from './components/Header';
import { MaterialsDisplay } from './components/MaterialsDisplay';
import { CraftTab } from './components/CraftTab';
import { ShopTab } from './components/ShopTab';
import { AdventurersTab } from './components/AdventurersTab';
import { DungeonTab } from './components/DungeonTab';
import { StatsTab } from './components/StatsTab';
import './App.css';

type TabType = 'craft' | 'shop' | 'adventurers' | 'dungeon' | 'stats';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('craft');
  const {
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
  } = useGameState();

  const tabs: { id: TabType; label: string; emoji: string }[] = [
    { id: 'craft', label: '製作', emoji: '🔨' },
    { id: 'shop', label: 'ショップ', emoji: '🛒' },
    { id: 'adventurers', label: '冒険者', emoji: '👥' },
    { id: 'dungeon', label: 'ダンジョン', emoji: '🗺️' },
    { id: 'stats', label: '統計', emoji: '📊' },
  ];

  // 冒険中や帰還の冒険者数
  const adventuringCount = state.adventurers.filter(a => a.status === 'adventuring').length;
  const returnedCount = state.adventurers.filter(a => a.status === 'returned').length;

  return (
    <div className="app">
      <Header player={state.player} />
      
      <div className="materials-bar">
        <span className="materials-label">📦 素材:</span>
        <MaterialsDisplay materials={state.inventory.materials} />
      </div>

      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-emoji">{tab.emoji}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.id === 'adventurers' && returnedCount > 0 && (
              <span className="notification-badge">{returnedCount}</span>
            )}
            {tab.id === 'dungeon' && adventuringCount > 0 && (
              <span className="adventuring-badge">{adventuringCount}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {activeTab === 'craft' && (
          <CraftTab state={state} onCraft={craftWeapon} onSellDirect={sellWeaponDirect} />
        )}
        {activeTab === 'shop' && (
          <ShopTab state={state} onSell={sellWeapon} />
        )}
        {activeTab === 'adventurers' && (
          <AdventurersTab
            state={state}
            onBuyMaterials={buyMaterials}
            onSkipMaterials={skipMaterials}
            onHireAdventurer={hireAdventurer}
            onHealAdventurer={healAdventurer}
          />
        )}
        {activeTab === 'dungeon' && (
          <DungeonTab state={state} onSendToDungeon={sendToDungeon} />
        )}
        {activeTab === 'stats' && (
          <StatsTab state={state} onReset={resetGame} />
        )}
      </main>

      <footer className="footer">
        <p>⚔️ WeaponShop - 武器屋経営放置ゲーム</p>
      </footer>
    </div>
  );
}

export default App;

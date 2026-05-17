import React from 'react';
import type { Boards, User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  activeCategory: string;
  searchTerm: string;
  boards: Boards;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onCategoryChange: (cat: string) => void;
  onSearchChange: (term: string) => void;
  onToggleForm: () => void;
  isFormOpen: boolean;
  onNearMe: () => void;
  onDonateClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeCategory,
  searchTerm,
  boards,
  onLogout,
  onOpenAuth,
  onCategoryChange,
  onSearchChange,
  onToggleForm,
  isFormOpen,
  onNearMe,
  onDonateClick
}) => {
  return (
    <header className="site-header">
      {/* Small top bar like 4chan */}
      <div className="top-board-nav">
        <div className="board-links">
          <a href="#" onClick={(e) => { e.preventDefault(); onCategoryChange('landing'); }}>[Home]</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onCategoryChange('all'); }}>[All]</a>
          <span style={{ opacity: 0.5 }}>|</span>
          <a href="#" onClick={(e) => { e.preventDefault(); onDonateClick(); }} style={{ color: '#008000', fontWeight: 'bold', animation: 'flash 1.5s infinite alternate' }}>[Donate 💖]</a>
          <span style={{ opacity: 0.5 }}>-</span>
          {Object.entries(boards).map(([catName, categories], i) => (
            <React.Fragment key={catName}>
              {categories.map((b) => (
                <React.Fragment key={b.id}>
                  <a href="#" onClick={(e) => { e.preventDefault(); onCategoryChange(b.id); }} title={b.id}>[{b.id}]</a>
                </React.Fragment>
              ))}
              {i < Object.keys(boards).length - 1 && <span style={{ opacity: 0.5, margin: '0 2px' }}>-</span>}
            </React.Fragment>
          ))}
          <style>{`
            @keyframes flash {
              0% { opacity: 0.6; color: #008000; }
              100% { opacity: 1; color: #c40000; }
            }
          `}</style>
        </div>
        <div className="top-auth" style={{ 
          whiteSpace: 'nowrap', 
          display: 'flex', 
          alignItems: 'center',
          borderLeft: '1px solid var(--border-red)',
          paddingLeft: '10px',
          marginLeft: '10px'
        }}>
          {currentUser ? (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <span 
                className="thread-name" 
                style={{ 
                  marginRight: '5px',
                  color: currentUser.isPremium ? '#b8860b' : undefined,
                  fontWeight: currentUser.isPremium ? 'bold' : undefined,
                  textShadow: currentUser.isPremium ? '1px 1px 0px rgba(0,0,0,0.1)' : undefined
                }}
              >
                {currentUser.username}
                {currentUser.isPremium && (
                  <span title="Bhejiyo Gold Pass Premium Contributor" style={{ marginLeft: '4px', cursor: 'help' }}>
                    🌟
                  </span>
                )}
              </span>
              <span style={{ opacity: 0.5 }}>|</span>
              <a href="#" onClick={(e) => { e.preventDefault(); onCategoryChange('profile'); }} style={{ padding: '0 2px' }}>[Profile]</a>
              <span style={{ opacity: 0.5 }}>|</span>
              <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} style={{ padding: '0 2px' }}>[Logout]</a>
            </div>
          ) : (
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenAuth('login'); }}>[Login/Signup]</a>
          )}
        </div>
      </div>

      <div className="header-main">
        <div className="header-brand" onClick={() => onCategoryChange('landing')} style={{ cursor: 'pointer' }}>
          <img
            src="/logo.png"
            alt="bhejiyo Logo"
            className="header-logo"
            style={{
              width: activeCategory === 'landing' ? '180px' : '120px',
              transition: 'all 0.3s ease'
            }}
          />
          <h1 className="header-title">
            /bhejiyo/ - bhejiyo
          </h1>
        </div>

        <div className="header-actions">
           <div className="search-box">
             <input
               type="text"
               placeholder="Search items..."
               value={searchTerm}
               onChange={(e) => onSearchChange(e.target.value)}
             />
             <button onClick={() => onSearchChange(searchTerm)}>[ Search ]</button>
             <button onClick={onNearMe} style={{ color: 'var(--text-red)', fontWeight: 'bold', marginLeft: '5px' }} title="Find items near your current location">[ Near Me ]</button>
           </div>
          <button
            onClick={onToggleForm}
            className="post-btn"
          >
            {isFormOpen ? '[ Close Form ]' : '[ Post Item ]'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

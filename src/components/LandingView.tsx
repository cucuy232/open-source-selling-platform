import React, { useState } from 'react';
import type { Boards, Listing, User } from '../types';

interface LandingViewProps {
  boards: Boards;
  listings: Listing[];
  onCategoryChange: (cat: string) => void;
  onItemClick: (item: Listing) => void;
  onEnquire: (item: Listing) => void;
  onLike: (e: React.MouseEvent, id: number) => void;
  onReport: (e: React.MouseEvent, id: number) => void;
  currentUser: User | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

const LandingView: React.FC<LandingViewProps> = ({ boards, listings, onCategoryChange, onItemClick, onEnquire, onLike, onReport }) => {
  const [showFilter, setShowFilter] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'likes'>('likes');
  const [showIntro, setShowIntro] = useState(true);

  const sortedListings = listings.slice().sort((a, b) => {
    if (sortBy === 'likes') {
      return (b.likes || 0) - (a.likes || 0);
    }
    return b.id - a.id;
  });

  return (
    <div className="landing-container">
      {showIntro && (
        <div className="chan-box">
          <div className="chan-box-header dark">
            <span>What is bhejiyo?</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setShowIntro(false)}>[X]</span>
          </div>
          <div className="chan-box-body">
            I tried the usual online market places for second hand items and I found that they are charging
            the user for every listing they make right after the 1st free listing. bhejiyo is free for users to post listings,
            and i intend to keep it that way. I used the retro web design used in websites like 4chan as reference
            for creating this website. The design is intentional and i am not a fan of the new trends of website designs with
            multiple animations and stuff. I have also added the options to like a listing and make it function like a social media
            platform.

          </div>
        </div>
      )}

      <div className="chan-box">
        <div className="chan-box-header">
          <span>Categories</span>
          <span
            style={{ fontSize: '0.7rem', fontWeight: 'normal', cursor: 'pointer' }}
            onClick={() => setShowFilter(!showFilter)}
          >
            filter {showFilter ? '▲' : '▼'}
          </span>
        </div>
        {showFilter && (
          <div style={{ padding: '5px 15px', background: 'var(--box-body-bg)', borderBottom: '1px solid var(--border-red)' }}>
            <input
              type="text"
              placeholder="Filter categories..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{ width: '100%', padding: '5px', fontSize: '0.8rem', border: '1px solid #800000', borderRadius: '0' }}
              autoFocus
            />
          </div>
        )}
        <div className="categories-grid" style={{ border: 'none' }}>
          {Object.entries(boards).map(([categoryName, boardList]) => {
            const filteredBoards = boardList.filter(b =>
              b.id.toLowerCase().includes(filterText.toLowerCase()) ||
              b.name.toLowerCase().includes(filterText.toLowerCase())
            );

            if (filteredBoards.length === 0) return null;

            return (
              <div key={categoryName} className="category-box">
                <h3>{categoryName}</h3>
                <ul className="category-list">
                  {filteredBoards.map(board => (
                    <li key={board.id}>
                      <a href="#" className="category-link" onClick={(e) => { e.preventDefault(); onCategoryChange(board.id); }}>
                        {board.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chan-box">
        <div className="chan-box-header">
          <span>{sortBy === 'likes' ? 'Most Liked Listings' : 'Recent Listings'}</span>
          <span
            style={{ fontSize: '0.7rem', fontWeight: 'normal', cursor: 'pointer' }}
            onClick={() => setShowOptions(!showOptions)}
          >
            options {showOptions ? '▲' : '▼'}
          </span>
        </div>
        {showOptions && (
          <div style={{ padding: '5px 15px', background: '#fdf6f2', borderBottom: '1px solid #800000', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Sort by:</span>
            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="sort"
                value="likes"
                checked={sortBy === 'likes'}
                onChange={() => setSortBy('likes')}
              />
              Most Liked
            </label>
            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="sort"
                value="recent"
                checked={sortBy === 'recent'}
                onChange={() => setSortBy('recent')}
              />
              Most Recent
            </label>
          </div>
        )}
        <div className="chan-box-body grid-bg" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {sortedListings.slice(0, 8).map(item => (
            <div key={item.id} style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => onItemClick(item)}>
              <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-red)', marginBottom: '4px', textDecoration: 'underline' }}>
                /{item.category}/
              </div>
              <img src={item.images[0]} alt={item.subject} style={{ width: '180px', height: '180px', objectFit: 'cover', border: '1px solid var(--border-red)' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '5px', color: 'var(--text-red)' }}>{item.subject}</div>
              <div style={{ fontSize: '0.7rem' }}>{item.price}</div>
              <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '2px' }}>{item.location}</div>
              <div style={{ fontSize: '0.7rem', color: '#d00', marginTop: '5px', fontWeight: 'bold', display: 'flex', gap: '10px' }}>
                <span onClick={(e) => { e.stopPropagation(); onLike(e, item.id); }}>[♥ {item.likes || 0}]</span>
                <span onClick={(e) => { e.stopPropagation(); onEnquire(item); }} style={{ color: 'blue', textDecoration: 'underline' }}>[Enquire]</span>
                <span onClick={(e) => { e.stopPropagation(); onReport(e, item.id); }} style={{ color: '#666', cursor: 'pointer' }}>[Report]</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingView;

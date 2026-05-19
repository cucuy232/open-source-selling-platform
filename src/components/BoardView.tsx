import React from 'react';
import ListingCard from './ListingCard';
import type { Listing } from '../types';

interface BoardViewProps {
  activeCategory: string;
  listings: Listing[];
  onItemClick: (item: Listing) => void;
  onEnquire: (item: Listing) => void;
  onLike: (e: React.MouseEvent, id: number | string) => void;
  onReport: (e: React.MouseEvent, id: number | string) => void;
}

const BoardView: React.FC<BoardViewProps> = ({ activeCategory, listings, onItemClick, onEnquire, onLike, onReport }) => {
  return (
    <div className="board-view chan-box">
      <div className="chan-box-header">
        <span>/{activeCategory}/ - {activeCategory === 'all' ? 'All Listings' : activeCategory}</span>
      </div>
      <div className="chan-box-body grid-bg">
        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', opacity: 0.5 }}>
            No listings in this category yet. Be the first to post!
          </div>
        ) : (
          <div className="threads-list">
            {listings.slice(0, 8).map((item) => (
              <ListingCard key={item.id} item={item} onClick={onItemClick} onEnquire={onEnquire} onLike={onLike} onReport={onReport} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardView;

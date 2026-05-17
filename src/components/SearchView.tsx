import React from 'react';
import type { Listing } from '../types';
import ListingCard from './ListingCard';

interface SearchViewProps {
  searchTerm: string;
  listings: Listing[];
  onItemClick: (item: Listing) => void;
  onEnquire: (item: Listing) => void;
  onLike: (e: React.MouseEvent, id: number) => void;
  onReport: (e: React.MouseEvent, id: number) => void;
}

const SearchView: React.FC<SearchViewProps> = ({
  searchTerm,
  listings,
  onItemClick,
  onEnquire,
  onLike,
  onReport
}) => {
  const searchLower = searchTerm.toLowerCase();
  const matchingListings = listings.filter(item =>
    item.subject.toLowerCase().includes(searchLower) ||
    item.body.toLowerCase().includes(searchLower) ||
    item.category.toLowerCase().includes(searchLower)
  );

  return (
    <div className="chan-box" style={{ width: '100%' }}>
      <div className="chan-box-header">Search Results for: "{searchTerm}"</div>
      <div className="chan-box-body">
        {matchingListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>No items found.</div>
        ) : (
          <div className="listings-container">
            {matchingListings.slice(0, 8).map(item => (
              <ListingCard 
                key={item.id} 
                item={item} 
                onClick={onItemClick} 
                onEnquire={onEnquire} 
                onLike={onLike} 
                onReport={onReport} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;

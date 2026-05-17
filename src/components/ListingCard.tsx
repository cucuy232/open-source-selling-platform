import React from 'react';
import type { Listing } from '../types';

interface ListingCardProps {
  item: Listing;
  onClick: (item: Listing) => void;
  onEnquire: (item: Listing) => void;
  onLike?: (e: React.MouseEvent, id: number | string) => void;
  onReport?: (e: React.MouseEvent, id: number | string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ item, onClick, onEnquire, onLike, onReport }) => {
  return (
    <article className="thread" onClick={() => onClick(item)} style={{ cursor: 'pointer' }}>
      <img src={item.images[0]} alt={item.subject} className="thread-image" />
      <div className="thread-content">
        <div className="thread-header">
          <div className="thread-header-left">
            <span className="thread-subject" style={{ textDecoration: 'underline' }}>{item.subject}</span>
            <span className="thread-name">{item.name}</span>
            <span className="thread-time">{item.time}</span>
            <span style={{ opacity: 0.7 }}>No. {item.id}</span>
          </div>
          <span className="thread-price">{item.price}</span>
        </div>
        <div className="thread-body">
          {item.body.split('\n').map((line, i) => (
            <div key={i} className={line.startsWith('>') ? 'greentext' : ''}>
              {line}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', marginTop: '10px', color: '#555' }}>
          <b>Ad posted at:</b> {item.location}
        </div>
        <div className="thread-footer" style={{ fontSize: '0.8rem', marginTop: '10px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEnquire(item); }}>[Enquire]</a>
          {' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onLike && onLike(e, item.id); }} style={{ fontWeight: 'bold' }}>
            [♥ Like ({item.likes || 0})]
          </a>
          {' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onReport && onReport(e, item.id); }}>[Report]</a>
        </div>
      </div>
    </article>
  );
};

export default ListingCard;

import React from 'react';
import { MessageSquare, MapPin } from 'lucide-react';
import type { Listing } from '../types';
import MapPreview from './MapPreview';

interface ItemDetailProps {
  activeItem: Listing;
  onBack: () => void;
  onChatClick: () => void;
  onLike: (e: React.MouseEvent, id: number) => void;
  onReport: (e: React.MouseEvent, id: number) => void;
  currentUser: any;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ activeItem, onBack, onChatClick, onLike, onReport }) => {
  return (
    <div className="item-detail-view">
      <div className="chan-box">
        <div className="chan-box-header">
          <span>Item Details: {activeItem.subject}</span>
          <span style={{ cursor: 'pointer' }} onClick={onBack}>[ Back ]</span>
        </div>
        <div className="chan-box-body grid-bg" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div className="gallery-main">
              <img src={activeItem.images[0]} alt={activeItem.subject} style={{ width: '100%', border: '1px solid var(--border-color)', marginBottom: '10px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {activeItem.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${activeItem.subject} ${i}`}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                  onClick={(e) => {
                    const mainImg = e.currentTarget.parentElement?.previousElementSibling?.querySelector('img');
                    if (mainImg) mainImg.src = img;
                  }}
                />
              ))}
            </div>

            {activeItem.coordinates && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-red)' }}>
                  <MapPin size={16} /> Item Location
                </div>
                <MapPreview 
                  center={activeItem.coordinates} 
                  popupText={activeItem.location} 
                  height="250px"
                />
              </div>
            )}
          </div>
          <div style={{ flex: '1.5', minWidth: '300px' }}>
            <h2 style={{ color: 'var(--text-red)', marginBottom: '10px' }}>{activeItem.subject}</h2>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-red)' }}>
              Price: {activeItem.price}
            </div>
            <div className="thread-body" style={{ padding: '15px', border: '1px solid var(--border-red)', marginBottom: '20px' }}>
              {activeItem.body.split('\n').map((line, i) => (
                <div key={i} className={line.startsWith('>') ? 'greentext' : ''}>
                  {line}
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <span className="thread-name">Seller: {activeItem.name}</span> |
              <span className="thread-time"> Listed on: {activeItem.time}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={{
                  background: 'var(--text-red)',
                  color: 'white',
                  padding: '10px 30px',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onClick={onChatClick}
              >
                <MessageSquare size={20} />
                CHAT WITH SELLER
              </button>
              <button
                style={{
                  background: '#fcfcfc',
                  color: 'var(--text-red)',
                  padding: '10px 20px',
                  border: '1px solid var(--border-color)',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
                onClick={(e) => onLike(e, activeItem.id)}
              >
                [ ♥ LIKE ({activeItem.likes || 0}) ]
              </button>
              <button
                style={{
                  background: '#eee',
                  color: '#444',
                  padding: '10px 20px',
                  border: '1px solid var(--border-color)',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                }}
                onClick={(e) => onReport(e, activeItem.id)}
              >
                [ REPORT AD ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;

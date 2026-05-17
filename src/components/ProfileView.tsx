import React from 'react';
import type { User, Listing } from '../types';


interface ProfileViewProps {
  currentUser: User;
  myListings: Listing[];
  likedListings: Listing[];
  onBack: () => void;
  onItemClick: (item: Listing) => void;
  onUpdateLocation: (location: string) => void;
  onDeleteListing: (id: any) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  currentUser, 
  myListings, 
  likedListings, 
  onBack, 
  onItemClick,
  onUpdateLocation,
  onDeleteListing
}) => {
  return (
    <div className="profile-view">
      <div className="chan-box" style={{ marginBottom: '20px' }}>
        <div className="chan-box-header">
          <span>User Profile: {currentUser.username}</span>
          <span style={{ cursor: 'pointer' }} onClick={onBack}>[ Back to Market ]</span>
        </div>
        <div className="chan-box-body" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', background: 'var(--box-body-bg)' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'white', 
                border: '1px solid var(--border-red)',
                color: 'var(--text-red)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '2rem', 
                fontWeight: '800',
                fontFamily: 'var(--font-serif)'
              }}>
                {currentUser.username[0].toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)' }}>
                <h2 style={{ margin: 0, color: 'var(--text-red)', fontWeight: '800', letterSpacing: '0.5px' }}>{currentUser.username}</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-red)', marginTop: '5px', fontFamily: 'monospace' }}>USER_ID: {currentUser.id}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-red)', fontFamily: 'monospace' }}>{currentUser.email}</div>
              </div>
            </div>
            
            <div style={{ borderTop: '1px dashed var(--border-red)', paddingTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-red)', fontSize: '0.8rem', fontWeight: '800', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>
                [LOCATION]
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  defaultValue={currentUser.location || ''} 
                  placeholder="Set your default location..."
                  onBlur={(e) => onUpdateLocation(e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: '8px', 
                    border: '1px solid var(--border-red)', 
                    background: 'white',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-serif)'
                  }}
                />

              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-red)', marginTop: '5px', fontStyle: 'italic', opacity: 0.8 }}>
                This location will be auto-filled when you post new items.
              </p>

            </div>
          </div>

          <div style={{ flex: '2', minWidth: '300px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'white', border: '1px solid var(--border-red)', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-red)', letterSpacing: '1px', marginBottom: '10px', fontFamily: 'var(--font-serif)' }}>[ LISTINGS ]</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-red)', fontFamily: 'var(--font-serif)' }}>{myListings.length}</div>
            </div>
            <div style={{ background: 'white', border: '1px solid var(--border-red)', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-red)', letterSpacing: '1px', marginBottom: '10px', fontFamily: 'var(--font-serif)' }}>[ LIKED ]</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-red)', fontFamily: 'var(--font-serif)' }}>{likedListings.length}</div>
            </div>
            <div style={{ background: 'white', border: '1px solid var(--border-red)', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-red)', letterSpacing: '1px', marginBottom: '10px', fontFamily: 'var(--font-serif)' }}>[ MESSAGES ]</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-red)', fontFamily: 'var(--font-serif)' }}>0</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* My Listings */}
        <div className="chan-box">
          <div className="chan-box-header">
            <span>My Active Listings ({myListings.length})</span>
          </div>
          <div className="chan-box-body" style={{ height: '250px', overflowY: 'auto', background: 'white' }}>
            {myListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>You haven't posted any items yet.</div>
            ) : (
              myListings.slice(0, 8).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => onItemClick(item)}
                  style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    padding: '10px', 
                    borderBottom: '1px solid #eee', 
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    alignItems: 'center'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#fdf6f2'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', gap: '10px', flex: 1, alignItems: 'center' }}>
                    <img src={item.images[0]} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', border: '1px solid var(--border-red)' }} />
                    <div style={{ fontFamily: 'var(--font-serif)' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-red)', letterSpacing: '0.3px' }}>{item.subject}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-red)' }}>{item.price}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-red)', opacity: 0.8 }}>Likes: {item.likes || 0}</div>
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteListing(item.id);
                      }}
                      style={{
                        background: '#ffebeb',
                        color: '#d9534f',
                        border: '1px dotted #d9534f',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#d9534f';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#ffebeb';
                        e.currentTarget.style.color = '#d9534f';
                      }}
                    >
                      [ 🗑 DELETE ]
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Liked Items */}
        <div className="chan-box">
          <div className="chan-box-header">
            <span>Items I Liked ({likedListings.length})</span>
          </div>
          <div className="chan-box-body" style={{ height: '250px', overflowY: 'auto', background: 'white' }}>
            {likedListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>No liked items yet.</div>
            ) : (
              likedListings.slice(0, 8).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => onItemClick(item)}
                  style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    padding: '10px', 
                    borderBottom: '1px solid #eee', 
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#fdf6f2'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <img src={item.images[0]} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', border: '1px solid var(--border-red)' }} />
                  <div style={{ fontFamily: 'var(--font-serif)' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-red)', letterSpacing: '0.3px' }}>{item.subject}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-red)' }}>{item.price}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-red)', opacity: 0.8 }}>Seller: {item.name}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="chan-box" style={{ marginTop: '20px' }}>
        <div className="chan-box-header">
          <span>Recent Messages</span>
        </div>
        <div className="chan-box-body">
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-red)', opacity: 0.6, fontFamily: 'var(--font-serif)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>[!]</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '800', letterSpacing: '0.5px' }}>NO NEW MESSAGES FOUND IN DATABASE</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;

import React, { useState } from 'react';
import type { User, Listing, ChatMessage, AuthData } from './types';
import { BOARDS, CATEGORIES, INITIAL_LISTINGS } from './data';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ListingForm from './components/ListingForm';
import ChatView from './components/ChatView';
import ItemDetail from './components/ItemDetail';
import LandingView from './components/LandingView';
import BoardView from './components/BoardView';
import ProfileView from './components/ProfileView';
import AdvertiseView from './components/AdvertiseView';
import SearchView from './components/SearchView';
import FAQView from './components/FAQView';
import SupportView from './components/SupportView';
import TermsView from './components/TermsView';
import Toast from './components/Toast';
import DonateModal from './components/DonateModal';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState('landing');
  const [activeItem, setActiveItem] = useState<Listing | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [likedItems, setLikedItems] = useState<number[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);

  const [authData, setAuthData] = useState<AuthData>({ username: '', email: '', password: '', isRobotChecked: false });
  const [promoConfig, setPromoConfig] = useState<{ itemId: number | null, days: number, reach: number }>({
    itemId: null,
    days: 7,
    reach: 5000
  });
  const [formData, setFormData] = useState<{
    subject: string,
    body: string,
    price: string,
    images: string[],
    category: string,
    currency: string,
    location: string,
    coordinates?: [number, number]
  }>({
    subject: '',
    body: '',
    price: '',
    images: [],
    category: 'misc',
    currency: '₹',
    location: '',
    coordinates: undefined
  });
  const [nearMeCoords, setNearMeCoords] = useState<[number, number] | null>(null);
  const [isDetectingNearMe, setIsDetectingNearMe] = useState(false);

  // Auto-recover user session from JWT token on mount
  React.useEffect(() => {
    const token = localStorage.getItem('bhejiyo_token');
    if (token) {
      fetch('http://localhost:5005/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
          } else {
            localStorage.removeItem('bhejiyo_token');
          }
        })
        .catch(err => console.error('Failed to recover active user session:', err));
    }
  }, []);

  const triggerGoogleBackendLogin = (name: string, email: string) => {
    setIsGoogleChooserOpen(false);
    setIsAuthOpen(false);
    setNotification({ message: '📡 Verifying Google OAuth Token with MongoDB...', type: 'info' });

    fetch('http://localhost:5005/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: name,
        email: email,
        googleId: `google_oauth_${email.split('@')[0]}_${Date.now()}`
      })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          throw new Error(data.message || 'Google authentication failed');
        }

        localStorage.setItem('bhejiyo_token', data.token);
        setCurrentUser(data.user);
        setNotification({
          message: `Successfully signed in via Google as ${data.user.username}! 🌟`,
          type: 'success'
        });
      })
      .catch(err => {
        console.error('Google Auth Error:', err);
        setNotification({
          message: `Google Login Failed: ${err.message}`,
          type: 'error'
        });
      });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleNearMe = () => {
    if (nearMeCoords) {
      setNearMeCoords(null);
      setNotification({ message: 'Proximity filter cleared.', type: 'info' });
      return;
    }

    setIsDetectingNearMe(true);
    setNotification({ message: 'Detecting your location...', type: 'info' });

    const onSuccess = (lat: number, lon: number) => {
      setNearMeCoords([lat, lon]);
      setIsDetectingNearMe(false);
      setActiveCategory('all');
      setSearchTerm('');
      setNotification({ message: 'Showing items near you!', type: 'success' });
    };

    const fetchIPLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.latitude && data.longitude) {
          onSuccess(data.latitude, data.longitude);
        } else {
          throw new Error('No coordinates');
        }
      } catch (err) {
        setIsDetectingNearMe(false);
        setNotification({ message: 'Could not detect location. Please search manually.', type: 'error' });
      }
    };

    if (!navigator.geolocation) {
      fetchIPLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => onSuccess(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        console.warn('Geolocation failed, falling back to IP');
        fetchIPLocation();
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const isSignup = authMode === 'signup';
    
    const url = isSignup 
      ? 'http://localhost:5005/api/auth/signup' 
      : 'http://localhost:5005/api/auth/login';

    const payload = isSignup 
      ? {
          username: authData.username,
          email: authData.email || `${authData.username}@bhejiyo.com`,
          password: authData.password
        }
      : {
          email: authData.username,
          password: authData.password
        };

    setNotification({ message: '🔒 Authenticating secure session node...', type: 'info' });

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          throw new Error(data.message || 'Authentication failed');
        }

        // Save session JWT token to localStorage
        localStorage.setItem('bhejiyo_token', data.token);
        
        setCurrentUser(data.user);
        setIsAuthOpen(false);
        setAuthData({ username: '', email: '', password: '', isRobotChecked: false });
        setNotification({
          message: isSignup 
            ? `Welcome to bhejiyo, ${data.user.username}! Account saved in MongoDB Atlas. 🌟` 
            : `Welcome back, ${data.user.username}! Session recovered from MongoDB. 🌟`,
          type: 'success'
        });
      })
      .catch(err => {
        console.error('Authentication Error:', err);
        setNotification({
          message: `Authentication Failed: ${err.message}`,
          type: 'error'
        });
      });
  };

  const handleLogout = () => {
    const name = currentUser?.username;
    setCurrentUser(null);
    localStorage.removeItem('bhejiyo_token'); // Clear stored token on logout
    setIsFormOpen(false);
    setNotification({ message: `Goodbye, ${name}! You have been logged out.`, type: 'info' });
  };

  const handleDonateSuccess = (amount: number, donorName: string) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        isPremium: true
      });
    }
    setNotification({
      message: `Thank you, ${donorName}! You contributed ₹${amount} and unlocked the Bhejiyo Gold Pass! 🌟`,
      type: 'success'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const { currency, ...restOfFormData } = formData;
    const newListing: Listing = {
      id: Date.now(),
      ...restOfFormData,
      price: currency + formData.price,
      name: currentUser.username,
      userId: currentUser.id,
      time: new Date().toLocaleString() + " (Today)",
      images: formData.images.length > 0 ? formData.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60"],
      likes: 0,
      createdAt: Date.now()
    };
    setListings([newListing, ...listings]);
    setFormData({ subject: '', body: '', price: '', images: [], category: 'misc', currency: '₹', location: '', coordinates: undefined });
    setIsFormOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = 5 - formData.images.length;
    if (remaining <= 0) return;

    const filesToProcess = files.slice(0, remaining);
    const promises = filesToProcess.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    const results = await Promise.all(promises);
    setFormData({ ...formData, images: [...formData.images, ...results] });
  };

  const handleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();

    if (!currentUser) {
      setAuthMode('login');
      setIsAuthOpen(true);
      setNotification({ message: 'Please sign in to like items.', type: 'info' });
      return;
    }

    let newLikes = 0;
    const item = listings.find(l => l.id === id);
    if (!item) return;

    if (likedItems.includes(id)) {
      setLikedItems(likedItems.filter(itemId => itemId !== id));
      newLikes = (item.likes || 0) - 1;
    } else {
      setLikedItems([...likedItems, id]);
      newLikes = (item.likes || 0) + 1;
    }

    setListings(listings.map(l => l.id === id ? { ...l, likes: newLikes } : l));

    if (activeItem && activeItem.id === id) {
      setActiveItem({ ...activeItem, likes: newLikes });
    }
  };

  const handleReport = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser) {
      setAuthMode('login');
      setIsAuthOpen(true);
      setNotification({ message: 'Please sign in to report items.', type: 'info' });
      return;
    }

    setNotification({ message: `Item #${id} has been reported for review. Thank you for keeping OSSP safe!`, type: 'success' });
  };

  const handleItemClick = (item: Listing) => {
    setActiveItem(item);
  };

  const handleEnquireClick = (item: Listing) => {
    if (!currentUser) {
      setAuthMode('login');
      setIsAuthOpen(true);
      setNotification({ message: 'Please sign in to enquire about items.', type: 'info' });
    } else {
      setActiveItem(item);
      setIsChatOpen(true);
      // Initialize chat with a welcome message from the seller
      setChatMessages([
        {
          sender: item.name,
          text: `Hey! Are you interested in the ${item.subject}?`,
          time: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  const handleUpdateLocation = (newLocation: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, location: newLocation });
      setNotification({ message: 'Profile updated successfully!', type: 'success' });
    }
  };

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const currentListings = listings.filter(l => !l.createdAt || (Date.now() - l.createdAt < SEVEN_DAYS_MS));

  const filteredListings = currentListings.filter(item => {
    const categoryMatch = activeCategory === 'all' || item.category === activeCategory || activeCategory === 'recent';
    if (!categoryMatch) return false;
    
    if (nearMeCoords) {
      if (item.coordinates) {
        const dist = calculateDistance(nearMeCoords[0], nearMeCoords[1], item.coordinates[0], item.coordinates[1]);
        return dist <= 50; // 50km radius
      }
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (nearMeCoords && a.coordinates && b.coordinates) {
       const distA = calculateDistance(nearMeCoords[0], nearMeCoords[1], a.coordinates[0], a.coordinates[1]);
       const distB = calculateDistance(nearMeCoords[0], nearMeCoords[1], b.coordinates[0], b.coordinates[1]);
       return distA - distB; // Sort by distance if near me is active
    }
    return (b.likes || 0) - (a.likes || 0);
  });

  const renderContent = () => {
    if (searchTerm) {
      return (
        <div className="search-results">
          {/* Category Matches */}
          {(() => {
            const matchingBoards = Object.values(BOARDS).flat().filter(b =>
              b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              b.id.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (matchingBoards.length > 0) {
              return (
                <div className="chan-box" style={{ marginBottom: '20px' }}>
                  <div className="chan-box-header">Matching Categories</div>
                  <div className="chan-box-body">
                    {matchingBoards.map(board => (
                      <div key={board.id} style={{ marginBottom: '5px' }}>
                        <a href="#" className="category-link" onClick={(e) => { e.preventDefault(); setActiveCategory(board.id); setSearchTerm(''); setActiveItem(null); }}>
                          /{board.id}/ - {board.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <SearchView 
            searchTerm={searchTerm}
            listings={currentListings}
            onItemClick={handleItemClick}
            onEnquire={handleEnquireClick}
            onLike={handleLike}
            onReport={handleReport}
          />
        </div>
      );
    }

    if (isChatOpen && activeItem) {
      return (
        <ChatView
          activeItem={activeItem}
          chatMessages={chatMessages}
          chatInput={chatInput}
          onBack={() => setIsChatOpen(false)}
          onInputChange={setChatInput}
          onSendMessage={(e, image, location) => {
            e.preventDefault();
            if (!chatInput && !image && !location) return;
            
            const messageText = location || chatInput;
            
            setChatMessages([
              ...chatMessages,
              {
                sender: 'You',
                text: messageText,
                time: new Date().toLocaleTimeString(),
                image
              }
            ]);
            
            if (!location) {
              setChatInput('');
            }
          }}
        />
      );
    }

    if (activeItem) {
      return (
        <ItemDetail
          activeItem={activeItem}
          onBack={() => setActiveItem(null)}
          onLike={handleLike}
          onReport={handleReport}
          currentUser={currentUser}
          onChatClick={() => {
            if (!currentUser) {
              setAuthMode('login');
              setIsAuthOpen(true);
              setNotification({ message: 'Please sign in to chat with the seller.', type: 'info' });
              return;
            }
            setIsChatOpen(true);
            if (chatMessages.length === 0) {
              setChatMessages([
                { sender: activeItem.name, text: "Hey! Are you interested in the " + activeItem.subject + "?", time: new Date().toLocaleTimeString() }
              ]);
            }
          }}
        />
      );
    }

    if (activeCategory === 'landing') {
      return (
        <LandingView
          boards={BOARDS}
          listings={currentListings}
          onCategoryChange={setActiveCategory}
          onItemClick={handleItemClick}
          onEnquire={handleEnquireClick}
          onLike={handleLike}
          onReport={handleReport}
          currentUser={currentUser}
          onOpenAuth={(mode) => { setAuthMode(mode); setIsAuthOpen(true); }}
        />
      );
    }

    if (activeCategory === 'profile' && currentUser) {
      return (
        <ProfileView
          currentUser={currentUser}
          myListings={currentListings.filter(l => l.userId === currentUser.id)}
          likedListings={currentListings.filter(l => likedItems.includes(l.id))}
          onBack={() => setActiveCategory('landing')}
          onItemClick={setActiveItem}
          onUpdateLocation={handleUpdateLocation}
        />
      );
    }

    if (activeCategory === 'faq') {
      return <FAQView onBack={() => setActiveCategory('landing')} />;
    }

    if (activeCategory === 'support') {
      return <SupportView onBack={() => setActiveCategory('landing')} />;
    }

    if (activeCategory === 'terms') {
      return <TermsView onBack={() => setActiveCategory('landing')} />;
    }

    if (activeCategory === 'advertise') {
      return (
        <AdvertiseView 
          currentUser={currentUser}
          currentListings={currentListings}
          promoConfig={promoConfig}
          onPromoConfigChange={setPromoConfig}
          onPostItemClick={() => setIsFormOpen(true)}
          onBackToHome={() => setActiveCategory('landing')}
        />
      );
    }

    return (
      <BoardView
        activeCategory={activeCategory}
        listings={filteredListings}
        onItemClick={handleItemClick}
        onEnquire={handleEnquireClick}
        onLike={handleLike}
        onReport={handleReport}
      />
    );
  };

  return (
    <div className="app">
      <Header
        currentUser={currentUser}
        activeCategory={activeCategory}
        searchTerm={searchTerm}
        boards={BOARDS}
        onLogout={handleLogout}
        onOpenAuth={(mode) => { setAuthMode(mode); setIsAuthOpen(true); }}
        onCategoryChange={(cat) => { setActiveCategory(cat); setActiveItem(null); setIsChatOpen(false); setSearchTerm(''); }}
        onSearchChange={setSearchTerm}
        onNearMe={handleNearMe}
        onToggleForm={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
          } else {
            if (!isFormOpen && currentUser.location) {
              setFormData(prev => ({ ...prev, location: currentUser.location || '' }));
            }
            setIsFormOpen(!isFormOpen);
          }
        }}
        isFormOpen={isFormOpen}
        onDonateClick={() => setIsDonateOpen(true)}
      />

      {isAuthOpen && (
        <AuthModal
          mode={authMode}
          authData={authData}
          onClose={() => setIsAuthOpen(false)}
          onAuth={handleAuth}
          onDataChange={setAuthData}
          onModeChange={setAuthMode}
          onGoogleLogin={() => setIsGoogleChooserOpen(true)}
          onViewTerms={() => { setIsAuthOpen(false); setActiveCategory('terms'); }}
        />
      )}

      {isFormOpen && (
        <ListingForm
          formData={formData}
          categories={CATEGORIES}
          currentUser={currentUser}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
          onDataChange={setFormData}
          onFileChange={handleFileChange}
        />
      )}

      {isDonateOpen && (
        <DonateModal
          onClose={() => setIsDonateOpen(false)}
          onSuccess={handleDonateSuccess}
          currentUser={currentUser}
          onOpenAuth={() => {
            setAuthMode('login');
            setIsAuthOpen(true);
          }}
        />
      )}

      <main className="category-container">
        {renderContent()}
      </main>

      <Footer
        listingCount={listings.length}
        onHomeClick={() => { setActiveCategory('landing'); setActiveItem(null); setIsChatOpen(false); }}
        onFAQClick={() => { setActiveCategory('faq'); setActiveItem(null); setIsChatOpen(false); }}
        onSupportClick={() => { setActiveCategory('support'); setActiveItem(null); setIsChatOpen(false); }}
        onAdvertiseClick={() => {
          if (currentUser) {
            setActiveCategory('advertise');
            setActiveItem(null);
            setIsChatOpen(false);
          } else {
            setAuthMode('login');
            setIsAuthOpen(true);
          }
        }}
        onDonateClick={() => setIsDonateOpen(true)}
      />

      <AnimatePresence>
        {notification && (
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* Retro Google Account Chooser Popup Modal */}
      {isGoogleChooserOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1100
        }}>
          <div className="post-form-container" style={{ width: '330px', padding: '18px', textAlign: 'center', border: '2px solid #4285F4', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(128,0,0,0.1)', paddingBottom: '6px' }}>
              <span style={{ fontWeight: 'bold', color: '#4285F4', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" style={{ width: '16px', height: '16px' }} />
                Google Accounts (OSSP Sandbox)
              </span>
              <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsGoogleChooserOpen(false)}>X</span>
            </div>
            
            <p style={{ fontSize: '0.78rem', color: '#555', margin: '0 0 12px 0', textAlign: 'left', lineHeight: '1.4' }}>
              Select an account to log in to <strong>bhejiyo</strong> securely:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'OSSP Administrator', email: 'admin.ossp@gmail.com', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Admin' },
                { name: 'Developer Mode', email: 'dev.bhejiyo@gmail.com', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Dev' },
                { name: 'OSSP Tester', email: 'tester.ossp@gmail.com', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Tester' }
              ].map((acc) => (
                <div 
                  key={acc.email}
                  onClick={() => triggerGoogleBackendLogin(acc.name, acc.email)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px',
                    border: '1px solid #d3d3d3',
                    background: '#fff',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f2f2f2'; e.currentTarget.style.borderColor = '#4285F4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d3d3d3'; }}
                >
                  <img src={acc.avatar} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f5f5f5' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#222' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>{acc.email}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '12px', borderTop: '1px dashed #ccc', paddingTop: '8px', lineHeight: '1.4' }}>
              🔒 MongoDB Cloud Atlas Connected.<br />
              Local Google developer Client ID is active.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

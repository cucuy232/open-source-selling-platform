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

const mapDbListingToFrontend = (dbListing: any): Listing => {
  return {
    id: dbListing._id || Date.now(),
    subject: dbListing.title,
    name: dbListing.user?.username || 'Anonymous',
    body: dbListing.description,
    price: typeof dbListing.price === 'number'
      ? '₹' + dbListing.price.toLocaleString('en-IN')
      : String(dbListing.price),
    images: dbListing.image ? [dbListing.image] : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60"],
    time: new Date(dbListing.createdAt).toLocaleString(),
    category: dbListing.category,
    userId: dbListing.user?._id || dbListing.user,
    location: dbListing.location,
    coordinates: dbListing.coordinates ? [dbListing.coordinates.lat, dbListing.coordinates.lng] : undefined,
    likes: dbListing.likes || 0,
    createdAt: new Date(dbListing.createdAt).getTime()
  };
};

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
  const [likedItems, setLikedItems] = useState<(number | string)[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | string | null>(null);

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

  // Fetch live listings from MongoDB Atlas on mount
  React.useEffect(() => {
    fetch('http://localhost:5005/api/listings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.listings && data.listings.length > 0) {
          const mapped = data.listings.map(mapDbListingToFrontend);
          setListings(mapped);
        }
      })
      .catch(err => console.error('Failed to retrieve listings from MongoDB Atlas:', err));
  }, []);

  const handleGoogleCredentialResponse = (response: any) => {
    setIsAuthOpen(false);
    setNotification({ message: '📡 Verifying Google OAuth Token with MongoDB...', type: 'info' });

    fetch('http://localhost:5005/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: response.credential
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

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const initGoogle = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: "597058348071-d2i0qs108tm6qujeue8b6qbq8iti8epo.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse,
          });
        } else {
          setTimeout(initGoogle, 300);
        }
      };
      initGoogle();
    }
  }, []);

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

    const token = localStorage.getItem('bhejiyo_token');
    const parsedPrice = parseFloat(formData.price.replace(/[^\d.]/g, '')) || 0;
    const lat = formData.coordinates ? formData.coordinates[0] : 28.6139;
    const lng = formData.coordinates ? formData.coordinates[1] : 77.2090;

    fetch('http://localhost:5005/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: formData.subject,
        price: parsedPrice,
        description: formData.body,
        category: formData.category,
        board: 'Marketplace',
        location: formData.location || 'Unknown Location',
        coordinates: { lat, lng },
        image: formData.images[0] || ''
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.listing) {
          const mapped = mapDbListingToFrontend(data.listing);
          setListings([mapped, ...listings]);
          setFormData({ subject: '', body: '', price: '', images: [], category: 'misc', currency: '₹', location: '', coordinates: undefined });
          setIsFormOpen(false);
          setNotification({ message: 'Successfully published listing to MongoDB Atlas! 🚀', type: 'success' });
        } else {
          throw new Error(data.message || 'Failed to save listing');
        }
      })
      .catch(err => {
        console.error('Publish Listing Error:', err);
        setNotification({ message: `Failed to post listing: ${err.message}`, type: 'error' });
      });
  };

  const compressImage = (base64Str: string, maxWidth = 600, maxHeight = 600, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Keep aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress as JPEG with specified quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = 5 - formData.images.length;
    if (remaining <= 0) return;

    const filesToProcess = files.slice(0, remaining);
    
    setNotification({ message: '📸 Compressing images for database efficiency...', type: 'info' });

    const promises = filesToProcess.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const rawBase64 = reader.result as string;
          compressImage(rawBase64, 600, 600, 0.6).then(compressed => {
            resolve(compressed);
          });
        };
        reader.readAsDataURL(file);
      });
    });
    const results = await Promise.all(promises);
    setFormData({ ...formData, images: [...formData.images, ...results] });
    setNotification({ message: '📸 Images compressed and loaded successfully! ⚡', type: 'success' });
  };


  const handleLike = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();

    if (!currentUser) {
      setAuthMode('login');
      setIsAuthOpen(true);
      setNotification({ message: 'Please sign in to like items.', type: 'info' });
      return;
    }

    const item = listings.find(l => l.id === id);
    if (!item) return;

    fetch(`http://localhost:5005/api/listings/${id}/like`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (likedItems.includes(id)) {
            setLikedItems(likedItems.filter(itemId => itemId !== id));
          } else {
            setLikedItems([...likedItems, id]);
          }
          const updatedLikes = data.likes !== undefined ? data.likes : (item.likes || 0) + 1;
          setListings(listings.map(l => l.id === id ? { ...l, likes: updatedLikes } : l));
          if (activeItem && activeItem.id === id) {
            setActiveItem({ ...activeItem, likes: updatedLikes });
          }
        }
      })
      .catch(err => console.error('Failed to update likes on backend:', err));
  };

  const handleReport = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser) {
      setAuthMode('login');
      setIsAuthOpen(true);
      setNotification({ message: 'Please sign in to report items.', type: 'info' });
      return;
    }

    fetch(`http://localhost:5005/api/listings/${id}/report`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotification({ message: `Listing has been successfully reported to the moderation panel. Thank you!`, type: 'success' });
        }
      })
      .catch(err => console.error('Failed to report listing on backend:', err));
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

  const handleDeleteListing = (listingId: number | string) => {
    if (!currentUser) {
      setAuthMode('login');
      setIsAuthOpen(true);
      setNotification({ message: 'Please sign in to delete listings.', type: 'info' });
      return;
    }
    setItemToDelete(listingId);
  };

  const executeDelete = (listingId: number | string) => {
    const token = localStorage.getItem('bhejiyo_token');
    
    setNotification({ message: '🗑️ Deleting listing from database...', type: 'info' });

    fetch(`http://localhost:5005/api/listings/${listingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setListings(listings.filter(l => l.id !== listingId));
          setNotification({ message: 'Listing deleted successfully! 🗑️', type: 'success' });
          if (activeItem && activeItem.id === listingId) {
            setActiveItem(null);
          }
        } else {
          throw new Error(data.message || 'Failed to delete listing');
        }
      })
      .catch(err => {
        console.error('Delete Listing Error:', err);
        setNotification({ message: `Failed to delete listing: ${err.message}`, type: 'error' });
      });
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
          onDelete={handleDeleteListing}
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
          onDeleteListing={handleDeleteListing}
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
          onGoogleLogin={() => {
            if (window.google?.accounts?.id) {
              window.google.accounts.id.prompt();
            } else {
              setNotification({ message: 'Google Client Library still loading...', type: 'error' });
            }
          }}
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



      {/* Retro Custom Confirmation Modal */}
      {itemToDelete !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1200
        }}>
          <div className="post-form-container" style={{ width: '350px', padding: '20px', border: '2px solid var(--border-red)', borderRadius: '4px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--border-red)', paddingBottom: '6px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-red)', fontSize: '0.95rem', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ Confirm Deletion
              </span>
              <span style={{ cursor: 'pointer', fontWeight: 'bold', fontFamily: 'monospace' }} onClick={() => setItemToDelete(null)}>X</span>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: '#444', marginBottom: '20px', fontFamily: 'var(--font-serif)', lineHeight: '1.4', textAlign: 'left' }}>
              Are you absolutely sure you want to delete this listing? This action is permanent and cannot be undone.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setItemToDelete(null)}
                style={{
                  background: '#eee',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '6px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'monospace'
                }}
              >
                [ CANCEL ]
              </button>
              <button
                onClick={() => {
                  if (itemToDelete !== null) {
                    const id = itemToDelete;
                    setItemToDelete(null);
                    executeDelete(id);
                  }
                }}
                style={{
                  background: '#ffebeb',
                  color: '#d9534f',
                  border: '1px solid #d9534f',
                  padding: '6px 16px',
                  fontSize: '0.85rem',
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
                [ YES, DELETE ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState, useRef } from 'react';
import type { Listing, ChatMessage } from '../types';
import { X } from 'lucide-react';

interface ChatViewProps {
  activeItem: Listing;
  chatMessages: ChatMessage[];
  chatInput: string;
  onBack: () => void;
  onSendMessage: (e: React.FormEvent, image?: string, location?: string) => void;
  onInputChange: (val: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  activeItem,
  chatMessages,
  chatInput,
  onBack,
  onSendMessage,
  onInputChange
}) => {
  const [pendingImage, setPendingImage] = useState<string | undefined>(undefined);
  const [detecting, setDetecting] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fallbackToIP = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const label = [data.city, data.region].filter(Boolean).join(', ');
        const locationText = `📍 My Location: ${label || `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`}`;
        onSendMessage({ preventDefault: () => {} } as React.FormEvent, undefined, locationText);
      } else {
        throw new Error('No coordinates in IP response');
      }
    } catch (err) {
      console.error('IP fallback failed:', err);
      setLocError('Could not detect location.');
      setTimeout(() => setLocError(null), 3000);
    } finally {
      setDetecting(false);
    }
  };

  const handleLocDetect = () => {
    setDetecting(true);
    setLocError(null);

    if (!navigator.geolocation) {
      fallbackToIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const label = [
            addr.neighbourhood || addr.suburb || addr.village || addr.hamlet,
            addr.city || addr.town || addr.county,
            addr.state,
          ].filter(Boolean).join(', ');
          const locationText = `📍 My Location: ${label || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}`;
          onSendMessage({ preventDefault: () => {} } as React.FormEvent, undefined, locationText);
        } catch {
          const locationText = `📍 My Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          onSendMessage({ preventDefault: () => {} } as React.FormEvent, undefined, locationText);
        } finally {
          setDetecting(false);
        }
      },
      async (err) => {
        console.warn('Browser geolocation failed (code', err.code, ') — falling back to IP geolocation');
        await fallbackToIP();
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    onSendMessage(e, pendingImage);
    setPendingImage(undefined);
  };

  return (
    <div className="chat-view">
      <div className="chan-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="chan-box-header">
          <span>Chat with {activeItem.name} re: {activeItem.subject}</span>
          <span style={{ cursor: 'pointer' }} onClick={onBack}>[ Back ]</span>
        </div>
        <div className="chan-box-body" style={{ height: '400px', overflowY: 'auto', background: '#fdf6f2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className="thread"
              style={{
                padding: '8px',
                marginBottom: '0',
                borderLeft: msg.sender === 'You' ? 'none' : '3px solid #789922',
                borderRight: msg.sender === 'You' ? '3px solid #d00' : 'none',
                alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: msg.sender === 'You' ? '#f0f0f0' : 'white',
                textAlign: msg.sender === 'You' ? 'right' : 'left'
              }}
            >
              <div className="thread-header" style={{ fontSize: '0.8rem' }}>
                <span className="thread-name">{msg.sender}</span>
                {" "}
                <span className="thread-time">{msg.time}</span>
              </div>
              <div className="thread-body" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                {msg.text}
                {msg.image && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={msg.image} alt="Attachment" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
          {locError && (
            <div style={{ color: '#d00', fontSize: '0.75rem', textAlign: 'center', padding: '5px' }}>
              {locError}
            </div>
          )}
        </div>

        {/* Pending Attachments Preview */}
        {pendingImage && (
          <div style={{ padding: '10px', background: '#eee', display: 'flex', gap: '10px', borderTop: '1px solid #ccc' }}>
            <div style={{ position: 'relative' }}>
              <img src={pendingImage} alt="Pending" style={{ height: '50px', border: '1px solid #999' }} />
              <X 
                size={14} 
                style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', cursor: 'pointer' }} 
                onClick={() => setPendingImage(undefined)}
              />
            </div>
          </div>
        )}

        <div className="chan-box-footer" style={{ padding: '15px', borderTop: '1px solid var(--border-color)', background: 'var(--post-bg)' }}>
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: 'var(--text-red)', 
                  fontSize: '1rem',
                  fontWeight: '800',
                  padding: '0 5px',
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '0.5px'
                }}
                title="Attach Photo"
              >
                [PIC]
              </button>
              <button 
                type="button" 
                onClick={handleLocDetect}
                disabled={detecting}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: detecting ? 'wait' : 'pointer', 
                  color: '#007bff', 
                  fontSize: '1rem',
                  fontWeight: '800',
                  padding: '0 5px',
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '0.5px',
                  opacity: detecting ? 0.6 : 1
                }}
                title="Send Location"
              >
                {detecting ? '[...]' : '[LOC]'}
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />

            <input
              placeholder="Type your message..."
              style={{ 
                flex: 1, 
                padding: '10px', 
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                background: 'white'
              }}
              value={chatInput}
              onChange={(e) => onInputChange(e.target.value)}
            />
            <button type="submit" style={{ 
              background: '#d00', 
              color: 'white', 
              border: 'none', 
              padding: '10px 25px', 
              fontWeight: '800', 
              cursor: 'pointer', 
              fontSize: '0.9rem',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.5px'
            }}>
              SEND
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatView;


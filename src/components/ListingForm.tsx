import React from 'react';
import type { User } from '../types';
import LocationPicker from './LocationPicker';

interface FormData {
  subject: string;
  body: string;
  price: string;
  images: string[];
  category: string;
  currency: string;
  location: string;
  coordinates?: [number, number];
}

interface ListingFormProps {
  formData: FormData;
  categories: string[];
  currentUser: User | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDataChange: (data: FormData) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ListingForm: React.FC<ListingFormProps> = ({
  formData,
  categories,
  onClose,
  onSubmit,
  onDataChange,
  onFileChange
}) => {
  const lastLocationRef = React.useRef<string>(formData.location);

  // Keep lastLocationRef in sync if parent coordinates are cleared/changed out of band
  React.useEffect(() => {
    if (!formData.location) {
      lastLocationRef.current = '';
    }
  }, [formData.location]);

  // Debounced geocoding when the user types in the input box
  React.useEffect(() => {
    if (formData.location === lastLocationRef.current) {
      return;
    }

    if (formData.location.trim().length < 3) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.location)}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          lastLocationRef.current = formData.location;
          onDataChange({
            ...formData,
            coordinates: [lat, lon]
          });
        }
      } catch (err) {
        console.error('Geocoding typed location failed:', err);
      }
    }, 1000); // 1-second debounce to respect Nominatim API guidelines

    return () => clearTimeout(timer);
  }, [formData.location]);

  // Click on the map to set position, followed by reverse geocoding to update text field
  const handleMapPositionChange = async (pos: [number, number]) => {
    // 1. Instantly update marker on the map
    onDataChange({ ...formData, coordinates: pos });

    // 2. Query Nominatim to reverse geocode and get the area name
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${pos[0]}&lon=${pos[1]}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const addr = data.address || {};
      const label = [
        addr.neighbourhood || addr.suburb || addr.village || addr.hamlet,
        addr.city || addr.town || addr.county,
        addr.state,
      ].filter(Boolean).join(', ');

      const finalLabel = label || data.display_name || `${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}`;

      // Update coordinates and location name together, and synchronize ref
      lastLocationRef.current = finalLabel;
      onDataChange({
        ...formData,
        location: finalLabel,
        coordinates: pos
      });
    } catch (err) {
      console.error('Reverse geocoding map click failed:', err);
    }
  };

  return (
    <div className="post-form-container">
      <div className="post-header">
        <span>Post New Listing</span>
        <span style={{ cursor: 'pointer' }} onClick={onClose}>X</span>
      </div>
      <form onSubmit={onSubmit} className="post-form">
        <div style={{ position: 'relative' }}>
          <input
            placeholder="Subject / Item Name"
            required
            maxLength={100}
            value={formData.subject}
            onChange={e => onDataChange({ ...formData, subject: e.target.value })}
            style={{ width: '100%', paddingRight: '45px' }}
          />
          <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: formData.subject.length >= 90 ? '#d00' : '#999', fontFamily: 'monospace' }}>
            {formData.subject.length}/100
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-red)', fontFamily: 'var(--font-serif)' }}>₹</span>
          <input
            placeholder="Price"
            type="number"
            required
            value={formData.price}
            onChange={e => onDataChange({ ...formData, price: e.target.value })}
            style={{ flex: 1 }}
          />
        </div>
        <select
          value={formData.category}
          onChange={e => onDataChange({ ...formData, category: e.target.value })}
        >
          {categories.filter(c => c !== 'all').map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div style={{ position: 'relative' }}>
          <textarea
            placeholder="Description (use > for greentext)"
            rows={5}
            required
            maxLength={2000}
            value={formData.body}
            onChange={e => onDataChange({ ...formData, body: e.target.value })}
            style={{ width: '100%', paddingBottom: '20px' }}
          />
          <span style={{ position: 'absolute', right: '8px', bottom: '8px', fontSize: '0.65rem', color: formData.body.length >= 1800 ? '#d00' : '#999', fontFamily: 'monospace' }}>
            {formData.body.length}/2000
          </span>
        </div>
        
        <LocationField formData={formData} onDataChange={onDataChange} lastLocationRef={lastLocationRef} />

        <LocationPicker 
          position={formData.coordinates} 
          onPositionChange={handleMapPositionChange}
        />

        <div className="file-upload-box" style={{ border: '1px solid var(--border-red)', padding: '10px', background: 'var(--box-body-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
            <label style={{ fontSize: '0.8rem' }}>Upload Item Images:</label>
            <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: formData.images.length >= 5 ? '#d00' : '#999' }}>
              {formData.images.length}/5 images
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={formData.images.length >= 5}
            onChange={onFileChange}
            style={{ opacity: formData.images.length >= 5 ? 0.4 : 1 }}
          />
          {formData.images.length >= 5 && (
            <div style={{ fontSize: '0.7rem', color: '#d00', marginTop: '5px', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              Maximum of 5 images reached. Remove one to add another.
            </div>
          )}
          <div style={{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap' }}>
            {formData.images.map((img: string, i: number) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={img} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', border: '1px solid var(--border-red)' }} />
                <button
                  type="button"
                  style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#d00', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                  onClick={() => onDataChange({ ...formData, images: formData.images.filter((_: string, idx: number) => idx !== i) })}
                >×</button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit">Post Item</button>
      </form>
    </div>
  );
};

export default ListingForm;

// --- Sub-component: location field with auto-detect button ---

interface LocationFieldProps {
  formData: { location: string; coordinates?: [number, number]; [key: string]: any };
  onDataChange: (data: any) => void;
  lastLocationRef: React.MutableRefObject<string>;
}

const LocationField: React.FC<LocationFieldProps> = ({ formData, onDataChange, lastLocationRef }) => {
  const [detecting, setDetecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);

  React.useEffect(() => {
    // If the location matches the last programmatically set location, don't show suggestions
    if (formData.location === lastLocationRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (formData.location.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.location)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (err) {
        console.error('Fetching suggestions failed:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 500); // 500ms debounce for suggestion list

    return () => clearTimeout(timer);
  }, [formData.location]);

  const applyLocation = async (latitude: number, longitude: number) => {
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

      const finalLabel = label || data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      lastLocationRef.current = finalLabel;

      onDataChange({
        ...formData,
        location: finalLabel,
        coordinates: [latitude, longitude] as [number, number],
      });
    } catch {
      const finalLabel = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      lastLocationRef.current = finalLabel;

      onDataChange({
        ...formData,
        location: finalLabel,
        coordinates: [latitude, longitude] as [number, number],
      });
    }
    setDetecting(false);
  };

  const fallbackToIP = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const label = [data.city, data.region].filter(Boolean).join(', ');

        const finalLabel = label || `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`;
        lastLocationRef.current = finalLabel;

        onDataChange({
          ...formData,
          location: finalLabel,
          coordinates: [data.latitude, data.longitude] as [number, number],
        });
        setDetecting(false);
      } else {
        throw new Error('No coordinates in IP response');
      }
    } catch {
      setDetecting(false);
      setError('Could not detect location. Please type your city manually.');
    }
  };

  const handleDetect = () => {
    setDetecting(true);
    setError(null);

    if (!navigator.geolocation) {
      fallbackToIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await applyLocation(pos.coords.latitude, pos.coords.longitude);
      },
      async (err) => {
        console.warn('Browser geolocation failed (code', err.code, ') — falling back to IP geolocation');
        await fallbackToIP();
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  const handleSelectSuggestion = (s: any) => {
    const finalLabel = s.display_name;
    const lat = parseFloat(s.lat);
    const lon = parseFloat(s.lon);

    lastLocationRef.current = finalLabel;

    onDataChange({
      ...formData,
      location: finalLabel,
      coordinates: [lat, lon] as [number, number]
    });

    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            placeholder="City / Area Name (e.g. Indiranagar, Bangalore)"
            required
            maxLength={100}
            value={formData.location}
            onChange={e => onDataChange({ ...formData, location: e.target.value })}
            onBlur={() => {
              // Hide suggestions on blur, with a small delay so onMouseDown on suggestions still triggers first
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            style={{ width: '100%' }}
          />
          {loadingSuggestions && (
            <span style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.75rem',
              color: 'var(--text-red)',
              pointerEvents: 'none'
            }}>
              ⏳
            </span>
          )}
        </div>
        <button
          type="button"
          id="detect-location-btn"
          onClick={handleDetect}
          disabled={detecting}
          title="Detect my current location"
          style={{
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '0 10px',
            fontSize: '0.78rem',
            cursor: detecting ? 'wait' : 'pointer',
            opacity: detecting ? 0.6 : 1,
            background: 'var(--box-header-bg, #d6daf0)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            flexShrink: 0,
          }}
        >
          {detecting ? '⏳ Detecting…' : '📍 Detect'}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: '85px', // leaves room to align with the text input rather than crossing over the detect button
          background: 'var(--box-body-bg, #fdf6f2)',
          border: '1px solid var(--border-red, #800000)',
          borderTop: 'none',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto',
          margin: 0,
          padding: 0
        }}>
          {suggestions.map((s, idx) => (
            <div
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevents input blur before selection completes
                handleSelectSuggestion(s);
              }}
              style={{
                padding: '6px 10px',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(128, 0, 0, 0.1)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-red)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border-red, #800000)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-red)';
              }}
            >
              {s.display_name}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ fontSize: '0.7rem', color: '#d00', marginTop: '4px', fontStyle: 'italic' }}>
          {error}
        </div>
      )}
    </div>
  );
};

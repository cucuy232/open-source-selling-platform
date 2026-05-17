import React from 'react';
import type { User, Listing } from '../types';

interface AdvertiseViewProps {
  currentUser: User | null;
  currentListings: Listing[];
  promoConfig: { itemId: number | null, days: number, reach: number };
  onPromoConfigChange: (config: { itemId: number | null, days: number, reach: number }) => void;
  onPostItemClick: () => void;
  onBackToHome: () => void;
}

const AdvertiseView: React.FC<AdvertiseViewProps> = ({
  onBackToHome
}) => {
  return (
    <div className="chan-box" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
      <div className="chan-box-header">Advertise on bhejiyo</div>
      <div className="chan-box-body" style={{ padding: '40px 20px' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-red)', marginBottom: '30px', lineHeight: '1.4' }}>
          contact <a href="mailto:otzi294@gmail.com" style={{ textDecoration: 'underline', color: 'inherit' }}>otzi294@gmail.com</a> for queries on sponsored listings
        </div>
        <button className="chan-button" onClick={onBackToHome}>[ Back to Home ]</button>
      </div>
    </div>
  );
};

export default AdvertiseView;

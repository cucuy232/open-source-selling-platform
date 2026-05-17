import React from 'react';

interface FooterProps {
  listingCount: number;
  onHomeClick: () => void;
  onFAQClick: () => void;
  onSupportClick: () => void;
  onAdvertiseClick: () => void;
  onDonateClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ listingCount, onHomeClick, onFAQClick, onSupportClick, onAdvertiseClick, onDonateClick }) => {
  return (
    <footer style={{ marginTop: '50px', textAlign: 'center', padding: '20px', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
      <div className="chan-box" style={{ background: 'var(--post-bg)', padding: '10px' }}>
        Total Listings: {listingCount} | Active Users: 420 | Market Volume: $9,001
      </div>
      <p style={{ marginTop: '10px' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onHomeClick(); }}>Home</a> |
        <a href="#" onClick={(e) => { e.preventDefault(); onFAQClick(); }}>FAQ</a> |
        <a href="#" onClick={(e) => { e.preventDefault(); onSupportClick(); }}>Support</a> |
        <a href="#" onClick={(e) => { e.preventDefault(); onAdvertiseClick(); }}>Advertise</a> |
        <a href="#" onClick={(e) => { e.preventDefault(); onDonateClick(); }} style={{ color: 'green', fontWeight: 'bold' }}>Donate 💖</a>
      </p>
      <p style={{ marginTop: '10px', opacity: 0.5 }}>
        Copyright © 2026 bhejiyo Marketplace Support LLC. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;

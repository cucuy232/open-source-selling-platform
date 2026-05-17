import React from 'react';

interface FAQViewProps {
  onBack: () => void;
}

const FAQView: React.FC<FAQViewProps> = ({ onBack }) => {
  return (
    <div className="chan-box">
      <div className="chan-box-header">Frequently Asked Questions</div>
      <div className="chan-box-body">
        <h4 style={{ color: 'var(--text-red)' }}>Q: How do I post a listing?</h4>
        <p>A: Click the [Post New Listing] button in the header. You must be signed in to post.</p>
        <h4 style={{ color: 'var(--text-red)', marginTop: '15px' }}>Q: Is this site anonymous?</h4>
        <p>A: While you can browse anonymously, we require an email for posting to prevent spam.</p>
        <h4 style={{ color: 'var(--text-red)', marginTop: '15px' }}>Q: Can I buy items directly here?</h4>
        <p>A: bhejiyo is a marketplace. You must "Enquire" to chat with the seller and arrange the deal.</p>
        <button className="chan-button" style={{ marginTop: '20px' }} onClick={onBack}>Back to Home</button>
      </div>
    </div>
  );
};

export default FAQView;

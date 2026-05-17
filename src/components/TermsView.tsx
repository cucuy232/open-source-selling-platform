import React from 'react';

interface TermsViewProps {
  onBack: () => void;
}

const TermsView: React.FC<TermsViewProps> = ({ onBack }) => {
  return (
    <div className="chan-box" style={{ maxWidth: '800px', margin: '20px auto' }}>
      <div className="chan-box-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>⚖️ Terms of Service & Privacy Policy</span>
        <button className="chan-button" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={onBack}>[ Back to Home ]</button>
      </div>
      <div className="chan-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.6', fontSize: '0.9rem' }}>
        <div>
          <h3 style={{ color: 'var(--text-red)', marginBottom: '8px', borderBottom: '1px dashed var(--border-red)', paddingBottom: '4px', fontSize: '1rem' }}>📜 Terms of Service</h3>
          <p>Welcome to <strong>bhejiyo</strong>. By accessing or using our platform, you agree to comply with and be bound by the following terms:</p>
          <ol style={{ marginLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>User Accounts:</strong> You must create an account to post listings or make payments. You are responsible for maintaining confidentiality of your password and credentials.</li>
            <li><strong>Listing Guidelines:</strong> You are fully responsible for the items you post. Spam, scams, offensive posts, and illegal items are strictly prohibited and will be removed immediately.</li>
            <li><strong>Payment & Donations:</strong> Payments made via UPI or Razorpay support the platform creators. These are voluntary actions, and donations are non-refundable.</li>
            <li><strong>Platform Limitation:</strong> bhejiyo is a retro-styled peer-to-peer billboard directory. We do not intermediate exchanges, verify users, or handle shipping logistics. Trade at your own risk.</li>
          </ol>
        </div>

        <div>
          <h3 style={{ color: 'var(--text-red)', marginBottom: '8px', borderBottom: '1px dashed var(--border-red)', paddingBottom: '4px', fontSize: '1rem' }}>🔒 Privacy Policy</h3>
          <p>Your privacy is extremely important to us. Here is how your information is handled:</p>
          <ul style={{ marginLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', listStyleType: 'disc' }}>
            <li><strong>Data Collection:</strong> We collect only the information required for registration and listing execution: username, email address, password hashes, and optional location coordinates.</li>
            <li><strong>Cloud Security:</strong> All data is transmitted securely via HTTPS and stored in fully secured clusters in MongoDB Atlas Cloud. Password values are hashed using the blowfish-based <code>bcrypt</code> cryptosystem.</li>
            <li><strong>No Tracking:</strong> We do not track your browser activity, use cookie-based advertisement identifiers, or sell any of your records to third-party brokers.</li>
            <li><strong>User Control:</strong> You can delete or edit your active listings at any point directly from your Profile view.</li>
          </ul>
        </div>

        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
          <button className="chan-button" style={{ padding: '6px 20px', fontWeight: 'bold' }} onClick={onBack}>
            Return to Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsView;

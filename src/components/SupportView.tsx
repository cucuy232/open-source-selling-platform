import React from 'react';

interface SupportViewProps {
  onBack: () => void;
}

const SupportView: React.FC<SupportViewProps> = ({ onBack }) => {
  return (
    <div className="chan-box">
      <div className="chan-box-header">Support & Contact</div>
      <div className="chan-box-body">
        <p>If you encounter any issues or have questions, please reach out to us:</p>
        <ul style={{ marginTop: '10px', listStyleType: 'none' }}>
          <li>Email: <span style={{ color: 'blue' }}> otzi294@gmail.com </span></li>
        </ul>
        <button className="chan-button" style={{ marginTop: '20px' }} onClick={onBack}>Back to Home</button>
      </div>
    </div>
  );
};

export default SupportView;

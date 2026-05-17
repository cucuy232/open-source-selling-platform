import React, { useState } from 'react';
import type { AuthData } from '../types';

interface AuthModalProps {
  mode: 'login' | 'signup';
  authData: AuthData;
  onClose: () => void;
  onAuth: (e: React.FormEvent) => void;
  onDataChange: (data: AuthData) => void;
  onModeChange: (mode: 'login' | 'signup') => void;
  onGoogleLogin: () => void;
  onViewTerms: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  authData,
  onClose,
  onAuth,
  onDataChange,
  onModeChange,
  onGoogleLogin,
  onViewTerms
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  React.useEffect(() => {
    const renderGoogleBtn = () => {
      const btnContainer = document.getElementById("google-signin-btn");
      if (btnContainer && window.google?.accounts?.id) {
        window.google.accounts.id.renderButton(
          btnContainer,
          { 
            theme: "outline", 
            size: "large", 
            text: "signin_with", 
            shape: "rectangular",
            width: 270
          }
        );
      } else {
        setTimeout(renderGoogleBtn, 300);
      }
    };
    renderGoogleBtn();
  }, [mode]);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000
    }}>
      <div className="post-form-container" style={{ width: '320px' }}>
        <div className="post-header">
          <span>{mode === 'login' ? 'Login' : 'Signup'}</span>
          <span style={{ cursor: 'pointer' }} onClick={onClose}>X</span>
        </div>
        <form onSubmit={onAuth} className="post-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <input
              placeholder="Username"
              required
              value={authData.username}
              onChange={e => onDataChange({ ...authData, username: e.target.value })}
            />
            {mode === 'signup' && (
              <div style={{ fontSize: '0.68rem', color: '#666', textAlign: 'left', marginTop: '-6px', marginBottom: '6px', paddingLeft: '2px' }}>
                💡 Min. 3 characters (e.g. joe, sam)
              </div>
            )}
          </div>
          
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <input
                type="email"
                placeholder="Email Address"
                required
                value={authData.email || ''}
                onChange={e => onDataChange({ ...authData, email: e.target.value })}
              />
              <div style={{ fontSize: '0.68rem', color: '#666', textAlign: 'left', marginTop: '-6px', marginBottom: '6px', paddingLeft: '2px' }}>
                💡 Valid email (e.g. jo@email.com)
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <input
              type="password"
              placeholder={mode === 'signup' ? "Create Password" : "Password"}
              required
              value={authData.password}
              onChange={e => onDataChange({ ...authData, password: e.target.value })}
            />
            {mode === 'signup' && (
              <div style={{ fontSize: '0.68rem', color: '#666', textAlign: 'left', marginTop: '-6px', marginBottom: '6px', paddingLeft: '2px' }}>
                💡 Min. 6 characters
              </div>
            )}
          </div>
          {mode === 'signup' && (
            <div style={{ 
              background: '#f9f9f9', 
              border: '1px solid #d3d3d3', 
              padding: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              margin: '10px 0',
              borderRadius: '3px'
            }}>
              <input 
                type="checkbox" 
                id="robot-check" 
                checked={authData.isRobotChecked || false}
                onChange={e => onDataChange({ ...authData, isRobotChecked: e.target.checked })}
                style={{ width: '20px', height: '20px', margin: 0, cursor: 'pointer' }}
                required
              />
              <label htmlFor="robot-check" style={{ fontSize: '0.85rem', cursor: 'pointer', color: '#555' }}>
                I'm not a robot
              </label>
              <img 
                src="https://www.gstatic.com/recaptcha/api2/logo_48.png" 
                alt="reCAPTCHA" 
                style={{ marginLeft: 'auto', width: '24px', opacity: 0.8 }} 
              />
            </div>
          )}

          {/* Terms & Conditions / Privacy Policy Checkbox (Signup Only) */}
          {mode === 'signup' && (
            <div style={{ 
              background: '#fcf8f5', 
              border: '1px dashed var(--border-red)', 
              padding: '8px 10px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px',
              margin: '10px 0',
              borderRadius: '2px',
              textAlign: 'left'
            }}>
              <input 
                type="checkbox" 
                id="terms-check" 
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                style={{ width: '16px', height: '16px', margin: '2px 0 0 0', cursor: 'pointer' }}
                required
              />
              <label htmlFor="terms-check" style={{ fontSize: '0.68rem', cursor: 'pointer', color: '#555', lineHeight: '1.4' }}>
                I agree to the <a href="#" onClick={(e) => { e.preventDefault(); onViewTerms(); }} style={{ color: 'var(--text-red)', textDecoration: 'underline', fontWeight: 'bold' }}>Terms of Service</a> and <a href="#" onClick={(e) => { e.preventDefault(); onViewTerms(); }} style={{ color: 'var(--text-red)', textDecoration: 'underline', fontWeight: 'bold' }}>Privacy Policy</a>.
              </label>
            </div>
          )}

          <button 
            type="submit" 
            disabled={mode === 'signup' ? (!agreedToTerms || !authData.isRobotChecked) : false}
            style={{
              cursor: (mode === 'login' || (agreedToTerms && authData.isRobotChecked)) ? 'pointer' : 'not-allowed',
              opacity: (mode === 'login' || (agreedToTerms && authData.isRobotChecked)) ? 1 : 0.6
            }}
          >
            {mode === 'login' ? 'Login' : 'Signup'}
          </button>
          
          <div style={{ margin: '15px 0', textAlign: 'center', position: 'relative' }}>
            <hr style={{ border: '0', borderTop: '1px solid #ccc' }} />
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 10px', fontSize: '0.7rem', color: '#888' }}>OR</span>
          </div>

          <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}></div>

          <p style={{ fontSize: '0.8rem', marginTop: '10px', textAlign: 'center' }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <a href="#" onClick={(e) => { e.preventDefault(); onModeChange(mode === 'login' ? 'signup' : 'login'); }}>
              {mode === 'login' ? 'Sign up' : 'Login'}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;

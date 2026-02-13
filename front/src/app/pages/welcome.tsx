// src/app/pages/welcome.tsx
// Version simplifiée pour tester

import { useNavigate } from 'react-router-dom';

export function WelcomePage() {
  const navigate = useNavigate();

  console.log('🎨 WelcomePage rendered!');

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div className="inline-flex items-center justify-center w-25 h-25 mb-4">
            <img 
             src='/assert/logovio.png'
              alt="VIO Logo" 
             className="w-full h-full object-contain"
             />
            </div>


        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#1e293b',
          marginBottom: '16px'
        }}>
          Welcome to VIO
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#64748b',
          marginBottom: '32px'
        }}>
          Your compassionate companion on your healing journey
        </p>

        <div style={{
          backgroundColor: '#f0fdfa',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #99f6e4'
        }}>
          <p style={{ color: '#334155', lineHeight: '1.6' }}>
            VIO transforms your treatment journey into a meaningful, emotionally supportive experience. 
            You'll create a personal connection with your future healthy self, track your progress, 
            and receive adaptive support that meets you exactly where you are.
          </p>
        </div>

        <button
          onClick={() => {
            console.log('🚀 Navigating to /avatar-name');
            navigate('/avatar-name');
          }}
          style={{
            background: 'linear-gradient(to right, #14b8a6, #10b981)',
            color: 'white',
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Begin Your Journey
          <span>→</span>
        </button>

        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '32px'
        }}>
          <div style={{ width: '32px', height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #14b8a6, #10b981)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#cbd5e1' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#cbd5e1' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#cbd5e1' }} />
        </div>
      </div>
    </div>
  );
}
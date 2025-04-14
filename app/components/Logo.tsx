import React from 'react';

export default function Logo({ inline = false }: { inline?: boolean }) {
  return (
    <div style={{ 
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      marginBottom: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: inline ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
          AI
        </div>
        <h1 style={{
          fontWeight: 'bold',
          fontSize: inline ? '1.25rem' : '1.5rem',
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          AI Chat
        </h1>
      </div>
    </div>
  );
} 
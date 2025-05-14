import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../context/auth';
import { useLocation } from 'react-router-dom';

/**
 * A debugging component that displays authentication information.
 * Only visible in development mode.
 */
const AuthDebugger = () => {
  const { auth } = useAuthContext();
  const location = useLocation();
  const [urlToken, setUrlToken] = useState(null);
  
  useEffect(() => {
    // Extract token from URL if present
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      // Show only first 10 characters for security
      setUrlToken(`${token.substring(0, 10)}...`);
    }
  }, [location]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const debuggerStyle = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '4px',
    zIndex: 9999,
    fontSize: '12px',
    maxWidth: '300px',
    opacity: 0.9
  };

  return (
    <div style={debuggerStyle}>
      <h6>Auth Debug Info</h6>
      <div>
        <strong>Auth Status:</strong> {auth ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {auth && (
        <>
          <div><strong>User:</strong> {auth.name}</div>
          <div><strong>Roles:</strong> {auth.roles?.join(', ')}</div>
          <div><strong>Token:</strong> {auth.accessToken?.substring(0, 10)}...</div>
        </>
      )}
      {urlToken && (
        <div><strong>URL Token:</strong> {urlToken}</div>
      )}
      <div><strong>Path:</strong> {location.pathname}{location.search}</div>
    </div>
  );
};

export default AuthDebugger; 
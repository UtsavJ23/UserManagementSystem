import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../context/auth';
import { useLocation } from 'react-router-dom';
import axios from '../api/axios';
import { axiosPrivate } from '../api/axios';
import useRefreshToken from '../hooks/useRefreshToken';

/**
 * A debugging component that displays authentication information.
 * Enhanced with tools to test auth endpoints.
 */
const AuthDebugger = () => {
  const { auth } = useAuthContext();
  const location = useLocation();
  const [urlToken, setUrlToken] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const refresh = useRefreshToken();
  
  useEffect(() => {
    // Extract token from URL if present
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      // Show only first 10 characters for security
      setUrlToken(`${token.substring(0, 10)}...`);
    }
  }, [location]);

  const testPublicEndpoint = async () => {
    try {
      setTestError(null);
      const response = await axios.get('/api/debug/debug-public');
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      setTestError(`Public endpoint error: ${err.message}\n${JSON.stringify(err.response?.data || {}, null, 2)}`);
    }
  };

  const testPrivateEndpoint = async () => {
    try {
      setTestError(null);
      const response = await axiosPrivate.get('/api/debug/debug-private');
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      setTestError(`Private endpoint error: ${err.message}\n${JSON.stringify(err.response?.data || {}, null, 2)}`);
    }
  };

  const testRefreshToken = async () => {
    try {
      setTestError(null);
      const newToken = await refresh();
      setTestResult(`Token refreshed: ${newToken ? 'Success' : 'Failed'}`);
    } catch (err) {
      setTestError(`Refresh token error: ${err.message}\n${JSON.stringify(err.response?.data || {}, null, 2)}`);
    }
  };

  // Set styles based on environment
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
    maxWidth: isExpanded ? '500px' : '300px',
    opacity: 0.9
  };

  // Only show full tools in development
  if (process.env.NODE_ENV !== 'development' && !isExpanded) {
    return (
      <div style={{ ...debuggerStyle, maxWidth: '100px' }}>
        <button 
          onClick={() => setIsExpanded(true)}
          style={{ padding: '4px 8px', fontSize: '11px' }}
        >
          Show Auth Debug
        </button>
      </div>
    );
  }

  return (
    <div style={debuggerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h6 style={{ margin: 0 }}>Auth Debug Info</h6>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ padding: '4px 8px', fontSize: '11px' }}
        >
          {isExpanded ? 'Minimize' : 'Expand'}
        </button>
      </div>

      <div>
        <strong>Auth Status:</strong> {auth ? 'Authenticated' : 'Not Authenticated'}
      </div>
      
      {auth && (
        <>
          <div><strong>User:</strong> {auth.name}</div>
          <div><strong>Email:</strong> {auth.email}</div>
          <div><strong>Roles:</strong> {auth.roles?.join(', ')}</div>
          <div><strong>Token:</strong> {auth.accessToken ? `${auth.accessToken.substring(0, 15)}...` : 'None'}</div>
        </>
      )}
      
      {urlToken && <div><strong>URL Token:</strong> {urlToken}</div>}
      
      {isExpanded && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button onClick={testPublicEndpoint} style={{ padding: '4px 8px', fontSize: '11px' }}>
            Test Public Endpoint
          </button>
          <button onClick={testPrivateEndpoint} style={{ padding: '4px 8px', fontSize: '11px' }}>
            Test Private Endpoint
          </button>
          <button onClick={testRefreshToken} style={{ padding: '4px 8px', fontSize: '11px' }}>
            Test Refresh Token
          </button>
          
          {testError && (
            <div style={{ marginTop: '5px', padding: '5px', backgroundColor: '#ffebee', borderRadius: '4px', fontSize: '11px' }}>
              <strong>Error:</strong> 
              <pre style={{ whiteSpace: 'pre-wrap', margin: '5px 0 0 0', fontSize: '10px' }}>{testError}</pre>
            </div>
          )}
          
          {testResult && (
            <div style={{ marginTop: '5px', padding: '5px', backgroundColor: '#e8f5e9', borderRadius: '4px', fontSize: '11px' }}>
              <strong>Result:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', margin: '5px 0 0 0', fontSize: '10px' }}>{testResult}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;
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
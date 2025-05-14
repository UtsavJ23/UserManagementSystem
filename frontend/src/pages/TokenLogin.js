import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/auth';
import jwt_decode from 'jwt-decode';
import Loading from '../components/Loading';

/**
 * TokenLogin page that handles authentication via token in URL
 * This should be used for the root path with token parameter
 */
const TokenLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useAuthContext();
  const [status, setStatus] = useState('Processing token...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const processToken = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (!token) {
          setError('No token found in URL');
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        
        // Decode the token
        const decoded = jwt_decode(token);
        console.log('Token decoded successfully');
        
        // Update auth context
        dispatch({ 
          type: 'LOGIN', 
          payload: { ...decoded.userInfo, accessToken: token } 
        });
        
        setStatus('Successfully authenticated');
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/');
        
        // Redirect to home page
        setTimeout(() => navigate('/'), 1000);
      } catch (error) {
        console.error('Error processing token:', error);
        setError(`Authentication failed: ${error.message}`);
        setTimeout(() => navigate('/login'), 2000);
      }
    };
    
    processToken();
  }, [location, dispatch, navigate]);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: '20px',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <h2>Authentication</h2>
      {error ? (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <p>{error}</p>
          <p>Redirecting...</p>
        </div>
      ) : (
        <>
          <p>{status}</p>
          <Loading />
        </>
      )}
    </div>
  );
};

export default TokenLogin; 
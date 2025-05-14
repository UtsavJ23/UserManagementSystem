import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/auth';
import jwt_decode from 'jwt-decode';

/**
 * Component to handle token processing from URL
 * This should be placed at the root path to capture redirects with tokens
 */
const TokenHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch, auth } = useAuthContext();

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      try {
        // Decode the token and update auth context
        const decoded = jwt_decode(token);
        dispatch({ 
          type: 'LOGIN', 
          payload: { ...decoded.userInfo, accessToken: token } 
        });
        
        console.log('Successfully authenticated from URL token');
        
        // Clean up URL by removing the token parameter
        window.history.replaceState({}, document.title, '/');
        
        // Force a page reload to ensure the auth state is properly applied
        window.location.reload();
      } catch (error) {
        console.error('Error processing token from URL:', error);
        navigate('/login');
      }
    }
  }, [location, dispatch, navigate]);

  return null; // This component doesn't render anything
};

export default TokenHandler; 
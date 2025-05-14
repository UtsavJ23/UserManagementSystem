import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/auth';
import jwt_decode from 'jwt-decode';

/**
 * Custom hook to handle authentication token from URL
 * This detects if there's a token in the URL and updates auth context
 */
const useHandleUrlToken = () => {
  const location = useLocation();
  const { dispatch } = useAuthContext();

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
        // This prevents token from staying in browser history
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (error) {
        console.error('Error processing token from URL:', error);
      }
    }
  }, [location, dispatch]);
};

export default useHandleUrlToken; 
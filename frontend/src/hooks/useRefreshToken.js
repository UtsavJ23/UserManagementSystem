import axios from '../api/axios' 
import { useAuthContext } from '../context/auth' 
import { useLogout } from '../hooks/useLogout'
import jwt_decode from 'jwt-decode'

const useRefreshToken = () => {
    const { dispatch } = useAuthContext()
    const { logout } = useLogout()

    const refresh = async () => {
        try {
            const response = await axios.post('/api/auth/refresh') 
            
            if (response.data) {
                try {
                    const decoded = jwt_decode(response.data)
                    dispatch({type: 'LOGIN', payload: {...decoded.userInfo, accessToken: response.data}})
                    return response.data
                } catch (decodeError) {
                    console.error('Error decoding token:', decodeError)
                    return null
                }
            }
            return null
        } catch (error) {
            console.error('Token refresh error:', error.response?.data || error.message)
            
            // Only logout for specific error conditions
            const wrongToken = error.response?.status === 403 && error.response?.data?.error === "Forbidden"
            const userNotFound = error.response?.status === 401
            const isBlocked = error.response?.status === 400
            
            if (wrongToken || userNotFound || isBlocked) {
                logout()
            }
            
            // Let the calling function handle the error
            throw error
        }
    }
    
    return refresh 
} 

export default useRefreshToken 
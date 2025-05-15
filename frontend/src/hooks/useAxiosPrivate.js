import { useEffect } from "react" 
import { axiosPrivate } from "../api/axios" 
import { useAuthContext } from '../context/auth'
import { useLogout } from './useLogout'
import useRefreshToken from './useRefreshToken' 

const useAxiosPrivate = () => {
    const { logout } = useLogout()
    const {auth} = useAuthContext()
    const refresh = useRefreshToken() 

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                // Always add the Authorization header if auth token exists
                if (!config.headers['Authorization'] && auth?.accessToken) {
                    config.headers['Authorization'] = `Bearer ${auth.accessToken}`
                    // Help with debugging authentication issues
                    console.log('Adding auth token to request')
                }
                return config 
            }, (error) => Promise.reject(error)
        )

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config
                
                // Check for auth error conditions
                const isAuthError = error.response?.status === 403 || error.response?.status === 401
                const hasRefreshBeenAttempted = prevRequest?._retry
                
                // Only try to refresh token once per request
                if (isAuthError && !hasRefreshBeenAttempted) {
                    try {
                        prevRequest._retry = true
                        // Get a new token
                        const newAccessToken = await refresh()
                        
                        // If we successfully got a new token, retry the original request
                        if (newAccessToken) {
                            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
                            return axiosPrivate(prevRequest)
                        } else {
                            // If refresh returned nothing (but didn't throw), still logout
                            console.error('Token refresh failed - no new token returned')
                            return Promise.reject(error)
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError)
                        // Only logout for specific auth errors, not for network errors
                        if (refreshError.response && refreshError.response.status >= 400) {
                            logout()
                        }
                        return Promise.reject(refreshError)
                    }
                }

                // Don't automatically logout for other errors
                // This prevents unwanted redirects during network issues
                if (error.response && error.response.status === 403 && prevRequest?._retry) {
                    console.error('Received 403 after token refresh - logging out')
                    logout()
                }

                return Promise.reject(error) 
            }
        ) 

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept) 
            axiosPrivate.interceptors.response.eject(responseIntercept) 
        }
    }, [auth, refresh, logout])

    return axiosPrivate 
}

export default useAxiosPrivate 
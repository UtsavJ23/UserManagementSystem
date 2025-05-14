import { useState } from 'react'
import { useAuthContext } from '../context/auth'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import axios from '../api/axios' 
import jwt_decode from 'jwt-decode'

export const useLogin = () => {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const { dispatch } = useAuthContext()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)

  const login = async (email, password, persist) => {
    if (!executeRecaptcha) {
      setError('Execute recaptcha not yet available')
      return
    }

    const token = await executeRecaptcha("enquiryFormSubmit")
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post('/api/auth/login', { email, password, persist, token})
      const decoded = jwt_decode(response.data)
      dispatch({type: 'LOGIN', payload: {...decoded.userInfo, accessToken: response.data}})
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      setError(error.response.data.error)
    }
  }

  return { login, isLoading, error }
}
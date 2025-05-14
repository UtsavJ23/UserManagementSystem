import { useState } from 'react'
import axios from '../api/axios' 

export const useSignup = () => {
  const [ error, setError ] = useState(null)
  const [ isLoading, setIsLoading ] = useState(null)
  const [ mailSent, setMailSent ] = useState(false)

  const signup = async (name, email, password, persist) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post('/api/auth/signup', { name, email, password, persist })
      setMailSent(response.data.mailSent)
      setIsLoading(false)
    } catch (error) {
      // console.log(error)
      setIsLoading(false)
      setError(error.response.data.error)
    }
  }

  return { signup, isLoading, error, mailSent }
}
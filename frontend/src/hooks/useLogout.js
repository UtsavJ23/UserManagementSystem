import { useAuthContext } from '../context/auth'
import { useWorkingHoursContext } from '../context/workingHours'
import { useUserContext } from '../context/user'
import usePersist from './usePersist'
import axios from '../api/axios' 
import io from 'socket.io-client'

export const useLogout = () => {
  const { dispatch } = useAuthContext()
  const { dispatch: dispatchWorkingHours } = useWorkingHoursContext()
  const { dispatch: dispatchUsers } = useUserContext()
  const { setPersist } = usePersist()
  
  const logout = async () => {
    try {
      const socket = io(process.env.SERVER_SOCKET_URL)
      await axios.post('/api/auth/logout')
      dispatch({ type: 'LOGOUT' })
      dispatchUsers({ type: 'SET_USER', payload: null })
      dispatchWorkingHours({ type: 'SET_WORKING_HOURS', payload: null })
      setPersist(false)
      socket.emit('disconnet')
    } catch (error) {
      // console.log(error)
    }
  }

  return { logout }
}
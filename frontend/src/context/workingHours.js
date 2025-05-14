import { createContext, useReducer, useContext } from 'react'

export const WorkingHoursContext = createContext()

export const workingHoursReducer = (state, action) => {
  switch (action.type) {
    case 'SET_WORKING_HOURS':
      return { workingHours: action.payload }
    case 'CREATE_WORKING_HOUR':
      return { workingHours: [action.payload, ...state.workingHours] }
    case 'UPDATE_WORKING_HOUR':
      return { workingHours: action.payload }
    case 'DELETE_WORKING_HOUR':
      return { workingHours: state.workingHours.filter(w => w._id !== action.payload._id) }
    default:
      return state
  }
}

export const WorkingHoursContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workingHoursReducer, { workingHours: null })
  return (<WorkingHoursContext.Provider value={{ ...state, dispatch }}>{ children }</WorkingHoursContext.Provider>)
}

export const useWorkingHoursContext = () => {
  const context = useContext(WorkingHoursContext)
  if(!context) throw Error('useWorkingHoursContext must be used inside a WorkingHoursContextProvider')
  return context
} 
import { createContext, useReducer, useContext } from "react"

export const AuthContext = createContext()

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { auth: action.payload }
        case 'LOGOUT':
            return { auth: null }
        default:
            return state
    }
}

export const AuthContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(authReducer, { auth: null })
    return (<AuthContext.Provider value={{ ...state, dispatch }}>{ children }</AuthContext.Provider>)
}

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if(!context) throw Error('useAuthContext must be used inside an AuthContextProvider')
    return context
}
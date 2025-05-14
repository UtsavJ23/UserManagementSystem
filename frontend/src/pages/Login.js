import { useRef, useState } from 'react'
import { useLogin } from '../hooks/useLogin'
import { Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import usePersist from '../hooks/usePersist' 
import PersistLoginAlert from '../components/auth/PersistLoginAlert'
import PersistLoginCheckbox from '../components/auth/PersistLoginCheckbox'
import SignInWithGoogleButton from '../components/auth/SignInWithGoogleButton'

const Login = () => {
  const { login, error, isLoading } = useLogin()
  const { persist, setPersist } = usePersist()
  const [ changeIcon, setChangeIcon ] = useState(false)
  const emailRef = useRef('')
  const passwordRef = useRef('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(emailRef.current.value.trim(), passwordRef.current.value.trim(), persist)
  }

  const handleShowPassword =  (e) => {
    e.preventDefault()
    const isPassword = passwordRef.current.type === "password"
    passwordRef.current.type = isPassword ? "text" : "password"
    setChangeIcon(isPassword)
  }

  return (
    <>
      <form className="login" onSubmit={handleSubmit}>
        <h3 className="text-center mb-4">Log In</h3>

        <label>Email Address:</label>
        <input className="inputs" type="email" ref={emailRef}/>

        <label>Password:</label>
        <div className="d-flex">
          <input className="inputs" type="password" ref={passwordRef} autoComplete="on"/>
          <button className="btn mb-2" onClick={handleShowPassword}>{changeIcon ? <FaEyeSlash/> : <FaEye/>}</button>
        </div>

        <div className="d-flex justify-content-between">
          <PersistLoginCheckbox persist={persist} setPersist={setPersist} />
          <label className="form-check-label"><Link to="/recover-password">Forgot Password ?</Link></label>
        </div>

        <button className="w-100 mt-3" disabled={isLoading}>Log In</button>

        <div className="signup-prompt mt-3">Create an account ? <Link to="/signup">Signup</Link></div>
        {error && <div className="error">{error}</div>}
      </form>

      <div className="google-hr"><hr/></div>
      <SignInWithGoogleButton persist={persist} setPersist={setPersist}/>

      {persist && (<PersistLoginAlert maxWidth="400px" marginAuto={true}/>)}
    </>
  )
}

export default Login
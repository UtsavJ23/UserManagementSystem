import { useRef, useState } from 'react'
import { useSignup } from '../hooks/useSignup'
import { Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { TbMailForward } from 'react-icons/tb'
import usePersist from '../hooks/usePersist'
import PersistLoginAlert from '../components/auth/PersistLoginAlert'
import PersistLoginCheckbox from '../components/auth/PersistLoginCheckbox'
import SignInWithGoogleButton from '../components/auth/SignInWithGoogleButton'

const Signup = () => {
  const { signup, error, isLoading, mailSent} = useSignup()
  const { persist, setPersist } = usePersist()
  const [ changeIcon, setChangeIcon ] = useState(false)
  const nameRef = useRef('')
  const emailRef = useRef('')
  const passwordRef = useRef('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    await signup(nameRef.current.value, emailRef.current.value.trim(), passwordRef.current.value.trim(), persist)
  }

  const handleShowPassword =  (e) => {
    e.preventDefault()
    const isPassword = passwordRef.current.type === "password"
    passwordRef.current.type = isPassword ? "text" : "password"
    setChangeIcon(isPassword)
  }

  return (
    <>
      {!mailSent && (
        <>
          <form className="signup" onSubmit={handleSubmit}>
            <h3 className="text-center mb-4">Sign Up</h3>
            
            <label>Username:</label>
            <input className="inputs" type="text" ref={nameRef} />

            <label>Email Address:</label>
            <input className="inputs" type="email" ref={emailRef}/>

            <label>Password:</label>
            <div className="d-flex">
              <input className="inputs" type="password" ref={passwordRef} autoComplete="off"/>
              <button className="btn mb-2" onClick={handleShowPassword}>{changeIcon ? <FaEyeSlash/> : <FaEye/>}</button>
            </div>

            <PersistLoginCheckbox persist={persist} setPersist={setPersist} />

            <button className="w-100 mt-3" disabled={isLoading}>Sign Up</button>

            <div className="signup-prompt mt-3">Already have an account ? <Link to="/login">Login</Link></div>
            {error && 
              (<div className="error">{error}
                {error==="Password not strong enough" && 
                  (<ul>
                    <li>At least 8 character</li>
                    <li>At least 1 lowercase</li>
                    <li>At least 1 uppercase</li>
                    <li>At least 1 numbers</li>
                    <li>At least 1 symbols</li>
                  </ul>)}
              </div>)}
          </form>

          <div className="google-hr"><hr/></div>
          <SignInWithGoogleButton persist={persist} setPersist={setPersist}/>

          {persist && (<PersistLoginAlert maxWidth="400px" marginAuto={true}/>)}
        </>
      )}

    {mailSent && (
      <div className="verify center shadow">
        <div className="icon"><TbMailForward className="fa"/></div>
        <div className="fs-3 fw-semibold">Verify your email</div>
        <div className="description">We've sent you a link in your email to verify your email address and activate your account. Just click the link to complete the signup process.</div>
        <small><div className="fw-semibold" style={{color: '#348df2'}}>The link in the email will expire in 15 minutes.</div></small>
      </div>
    )}
   </>
  )
}

export default Signup
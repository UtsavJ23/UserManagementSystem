import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdOutlineMailLock } from 'react-icons/md'
import axiosPublic from '../../../api/axios' 
import RestPassword from './RestPassword'
import VerifyOTP from './VerifyOTP'
const validator = require('validator')
const EMAIL_VALIDATOR_OPTIONS = { host_whitelist: ['gmail.com', 'yahoo.com', 'outlook.com'] }

const VerifyEmail = () => {
  const emailRef = useRef('')
  const navigate = useNavigate()
  const [ email, setEmail ] = useState(null)
  const [ error, setError ] = useState(null)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ isVerified, setIsVerified] = useState(false)
  const [ otpVerify, setOTPVerify ] = useState(false)

  const validateEmail = emailInput => {
    if (validator.isEmpty(emailInput, { ignore_whitespace: true })) throw Error('Email is required', 400)

    if (!validator.isEmail(emailInput, EMAIL_VALIDATOR_OPTIONS)) throw Error('Email not valid', 400)
  }

  const  handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      validateEmail(emailRef.current.value.trim())

      const response = await axiosPublic.post('/api/auth/verify-email', { email: emailRef.current.value.trim() })

      setIsVerified(response.data.emailVerified)
      setEmail(response.data.email)
      setIsLoading(false)
      // navigate('/not-found')
    } catch (error) {
      setError(error.response.data.error || 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <>
      {!isVerified && (<div className="otp-container">
          <div className="row justify-content-center">
            <div className="col text-center">
              <div className="otp-box">
                <div className="otp-icon"><MdOutlineMailLock className="fa"/></div>           
                <h3>Forgot Your Password ?</h3>
                <div className="description">Please enter your email address. We will send a one-time password (OTP) to this address for verification.</div>
                <form onSubmit={handleSubmit}>
                  <input className="inputs" type="email" ref={emailRef} placeholder='Email Address'/>
                  <button type="submit" className="otp-button btn btn-primary mb-1" disabled={isLoading}>{isLoading ? 'Sending...' : 'Next'}</button>
                </form>
                {error && <div className="error">{error}</div>}
              </div>
              <div className="signup-prompt mt-2">Back to <Link to="/">Home Page</Link></div>
            </div>
          </div>
        </div>)}

      {isVerified && !otpVerify && <VerifyOTP setOTPVerify={setOTPVerify} email={email}/>}

      {isVerified && otpVerify && <RestPassword email={email}/>}
    </>
  )
}

export default VerifyEmail
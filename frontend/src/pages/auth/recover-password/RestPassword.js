import { useRef, useState } from 'react'
import { Link, useNavigate  } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { MdOutlineMailLock } from 'react-icons/md'
import axiosPublic from '../../../api/axios' 
const validator = require('validator')

const RestPassword = ({ email }) => {
  const navigate = useNavigate()
  const passwordRef = useRef('')
  const confirmPasswordRef = useRef('')
  const [ error, setError ] = useState(null)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ changeIcon, setChangeIcon ] = useState(false)

  const handleShowPassword  =  (e, ref) => {
    e.preventDefault()
    const isPassword = ref.current.type === "password"
    ref.current.type = isPassword ? "text" : "password"
    setChangeIcon(isPassword)
  }

  const validatePasswordField = (ref, fieldName) => {
    if (validator.isEmpty(ref.current?.value ?? '', { ignore_whitespace: true })) throw new Error(`${fieldName} is required`)
  }

  const  handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      validatePasswordField(passwordRef, 'Password');
      validatePasswordField(confirmPasswordRef, 'Confirm Password')

      if(passwordRef.current.value !== confirmPasswordRef.current.value) throw Error("Passwords don't match")
      await axiosPublic.post('/api/auth/rest-password', { email, password: passwordRef.current.value })
      setIsLoading(false)
      setError(null)
      navigate('/login')
     }catch (error) {
      // console.log(error)
      setError(error.response?.data.error ? error.response.data.error : error.message)
      setIsLoading(false)
      if(!error.response.data.passwordUpdated){
        setTimeout(() => navigate('/not-found'), 10000)
      }
    }
  }

  return (
    <div className="otp-container">
    <div className="row justify-content-center">
      <div className="col text-center">
        <div className="otp-box">
          <div className="otp-icon"><MdOutlineMailLock className="fa"/></div>           
          <h3>Reset Password</h3>
          <form onSubmit={handleSubmit}>
            <div className="d-flex">
              <input className="rest-pass-input" type="password" ref={passwordRef} placeholder='New Password'/>
              <button className="btn mb-2" onClick={(e) => handleShowPassword(e, passwordRef)}>{changeIcon ? <FaEyeSlash/> : <FaEye/>}</button>
            </div>
            <div className="d-flex">
              <input className="inputs" type="password" ref={confirmPasswordRef} placeholder='Confirm New Password'/>
              <button className="btn mb-2" onClick={(e) => handleShowPassword(e, confirmPasswordRef)}>{changeIcon ? <FaEyeSlash/> : <FaEye/>}</button>
            </div>
            <button type="submit" className="otp-button btn btn-primary mb-1" disabled={isLoading}>{isLoading ? 'Sending...' : 'Reset Password'}</button>
          </form>
          {error &&  (<div className="error">{error} 
            {error==="Password not strong enough" && 
                (<ul>
                  <li>At least 8 character</li>
                  <li>At least 1 lowercase</li>
                  <li>At least 1 uppercase</li>
                  <li>At least 1 numbers</li>
                  <li>At least 1 symbols</li>
                </ul>)}
            </div>)}
        </div>
        <div className="signup-prompt mt-2">Back to <Link to="/">Home Page</Link></div>
      </div>
    </div>
  </div>
  )
}

export default RestPassword
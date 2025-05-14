import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdOutlineSecurity } from "react-icons/md"
import axiosPublic from '../../../api/axios' 

const VerifyOTP = ({ email, setOTPVerify }) => {
  const navigate = useNavigate()
  const inputs = useRef([])
  const [ error, setError ] = useState(null)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ otp, setOtp ] = useState(Array(6).fill(''))

  const handleChange = (e, index) => {
    const value = e.target.value
    if (/^\d$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      
      if (index < 5) {
        inputs.current[index + 1].focus()
      }
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp]
      if (otp[index] === '') {
        if (index > 0) {
          inputs.current[index - 1].focus()
          newOtp[index - 1] = ''
          setOtp(newOtp)
        }
      } else {
        newOtp[index] = ''
        setOtp(newOtp)
      }
    }
  }

  const  handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if(!(/^\d{6}$/.test(otp.join('')))) return setError('Invalid OTP')

      const response = await axiosPublic.post('/api/auth/verify-OTP', { email, otp: otp.join('') })

      setOTPVerify(response.data.otpVerified)
      setIsLoading(false)
      setError(null)
    } catch (error) {
      setError(error.response.data.error)
      setIsLoading(false)
      if(!error.response.data.otpVerifie){
        setTimeout(() => navigate('/not-found'), 10000)
      }
    }
  }

  return (
    <div className="otp-container">
      <div className="row justify-content-center">
        <div className="col text-center">
          <div className="otp-box">
            <div className="otp-icon"><MdOutlineSecurity className="fa"/></div>           
            <h3>OTP Valification</h3>
            <div className="description">A 6-digit OTP (One-Time Password) has been sent to {email}. Kindly check your email and enter the OTP code below.</div>
            <form onSubmit={handleSubmit}>
              <div className="otp-inputs gap-2 my-4">
                {otp.map((data, index) => (
                  <input 
                    className="otp-input"
                    key={index} 
                    type="text" 
                    maxLength="1" 
                    value={data} 
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputs.current[index] = el)} />
                ))}
              </div>
              <button type="submit" className="otp-button btn btn-primary mb-1" disabled={isLoading}>{isLoading ? 'Sending...' : 'Verify OTP'}</button>
            </form>
            {error && <div className="error">{error}</div>}
          </div>
          <div className="signup-prompt mt-2">Back to <Link to="/">Home Page</Link></div>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP
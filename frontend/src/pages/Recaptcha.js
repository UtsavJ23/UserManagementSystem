import React from 'react'
import Login from './Login'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

const Recaptcha = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_SITE_KEY}  scriptProps={{ async: false, defer: false, appendTo: "head", nonce: undefined, }}>
      <Login/>
    </GoogleReCaptchaProvider>
  )
}

export default Recaptcha
import React from 'react'
import './Login.css'

const Login = () => {
  return (
    <div>
      <form>
        <input type="text" id="username" placeholder="Enter Username" className="form" /><br />
        <input type="password" id="pass" placeholder="Password" className="form" /><br />
        <button type="button">Login</button>
        <button type="button">Forget password</button>
      </form>
    </div>
  )
}

export default Login

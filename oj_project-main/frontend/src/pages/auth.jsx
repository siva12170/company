import React from 'react'
import { useState } from 'react'
import HoverCard from '../components/hovercard.jsx'
import Login from '../components/login.jsx'
import Register from '../components/register.jsx'


function Auth({ initialView }) {
  const [isLoginView, setIsLoginView] = useState(initialView !== 'register');

  const toggleForm = () => {
    setIsLoginView((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background with blur effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-white bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-black opacity-5 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-1/4 w-[200px] h-[200px] rounded-full bg-gray-400 opacity-10 blur-[80px]"></div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-black">
            Welcome to <span className="border-b-4 border-black">CodeJudge</span>
          </h1>
          <p className="text-gray-600">
            {isLoginView ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Auth form with glass effect */}
        <div className="bg-white/80 backdrop-blur-md border-2 border-black rounded-lg shadow-2xl">
          <HoverCard className="w-full">
            {isLoginView ? (
              <Login onToggleForm={toggleForm} />
            ) : (
              <Register onToggleForm={toggleForm} />
            )}
          </HoverCard>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
import { useState } from 'react';
import InputField, { UserIcon, MailIcon, LockIcon } from './Inputfield';
import {ToastContainer} from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

export default function Register({ onToggleForm }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [registerInfo, setRegisterInfo] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    accType: 'User'
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setRegisterInfo({ ...registerInfo, [name]: value });
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const { fullName, username, email, password, accType } = registerInfo;
    if(!fullName || !username || !email || !password || !accType) {
      return handleError("Please fill all fields");
    }


    setIsSubmitting(true);

    try{
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...registerInfo
        })
      });
      const result = await response.json();
      if (response.ok) {
        const accountTypeMessage = registerInfo.accType === 'Problemsetter' 
          ? "Problemsetter account created successfully! You can now create and manage coding problems." 
          : "User account created successfully!";
        handleSuccess(accountTypeMessage);
        setTimeout(() =>{
          onToggleForm();
        },2000)
      } else {
        handleError(result.message || "Registration failed");
      }
    } catch(err) {
      handleError("Registration failed. Try again. : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
    
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-center mb-2 text-black">Add Memeber</h2>
      <p className="text-center text-gray-600 mb-8">Fill details to become dev</p>
      
      <form onSubmit={handleSubmit}>
        <InputField 
          icon={UserIcon} 
          type="text" 
          name="fullName" 
          placeholder="Full Name" 
          onChange={handleChange} 
          autoFocus={true} 
        />
        <InputField 
          icon={UserIcon} 
          type="text" 
          name="username" 
          placeholder="Dev name" 
          onChange={handleChange} 
        />
        <InputField 
          icon={MailIcon} 
          type="email" 
          name="email" 
          placeholder="Email" 
          onChange={handleChange} 
        />
        {/* Added isPassword prop to enable the visibility toggle */}
        <InputField 
          icon={LockIcon} 
          type="password" 
          name="password" 
          placeholder="Secret Key" 
          isPassword={true} 
          onChange={handleChange} 
        />
        
        {/* Account Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-3">
            Account Type
          </label>
          <div className="space-y-3">
            <div className={`flex items-start p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              registerInfo.accType === 'User' 
                ? 'border-black bg-gray-100' 
                : 'border-gray-300 hover:border-gray-500'
            }`} onClick={() => setRegisterInfo({...registerInfo, accType: 'User'})}>
              <input
                type="radio"
                id="user-type"
                name="accType"
                value="User"
                checked={registerInfo.accType === 'User'}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-black focus:ring-gray-400 border-gray-400"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <label htmlFor="user-type" className="text-sm font-medium text-black cursor-pointer">
                    User
                  </label>
                  <span className="ml-2 px-2 py-1 text-xs bg-white text-black border border-black rounded-full">
                    Standard
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Solve Quests, participate in contests, and track your progress
                </p>
              </div>
            </div>
            
            <div className={`flex items-start p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              registerInfo.accType === 'Problemsetter' 
                ? 'border-black bg-gray-100' 
                : 'border-gray-300 hover:border-gray-500'
            }`} onClick={() => setRegisterInfo({...registerInfo, accType: 'Problemsetter'})}>
              <input
                type="radio"
                id="problemsetter-type"
                name="accType"
                value="Problemsetter"
                checked={registerInfo.accType === 'Problemsetter'}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-black focus:ring-gray-400 border-gray-400"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <label htmlFor="problemsetter-type" className="text-sm font-medium text-black cursor-pointer">
                    Problemsetter
                  </label>
                  <span className="ml-2 px-2 py-1 text-xs bg-black text-white rounded-full">
                    Creator
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Create and manage coding problems, plus all user features
                </p>
                <div className="flex items-center mt-2 text-xs text-black">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Problem creation & management tools
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg transition duration-300 transform shadow-lg hover:shadow-xl mt-4 font-bold bg-black hover:bg-gray-800 text-white hover:scale-105`}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-8">
        Already a dev?
        <a 
          href="/auth"
          className="font-semibold text-black hover:text-gray-700 ml-2 focus:outline-none border-b border-transparent hover:border-black transition duration-300"
        >
          Enter
        </a>
      </p>
      <ToastContainer />
    </div>
  );
};
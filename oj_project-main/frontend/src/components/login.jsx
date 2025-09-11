import { useState } from 'react';
import InputField, { MailIcon, LockIcon, UserIcon } from './Inputfield';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {ToastContainer} from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

export default function Login({ onToggleForm }) {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo({ ...loginInfo, [name]: value });
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const { email, password } = loginInfo;
    if(!email || !password) {
      return handleError("Please fill all fields");
    }


    setIsSubmitting(true);

    try{
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...loginInfo
        })
      });
      const result = await response.json();
      console.log('Login response:', result);
      
      if (response.ok && result.success) {
        handleSuccess("Entered successfully!");
        login(result.data.user);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        const errorMessage = result.message || "Login failed";
        handleError(errorMessage);
      }
    } catch(err) {
      handleError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-center mb-2 text-black">Welcome Back</h2>
      <p className="text-center text-gray-600 mb-8">Enter to access your dashboard</p>
      
      <form onSubmit={handleSubmit}>
        <InputField 
          icon={UserIcon} 
          type="text" 
          name="email" 
          placeholder="Dev name or Email" 
          onChange={handleChange} 
          autoFocus={true} 
        />
        <InputField 
          icon={LockIcon} 
          type="password" 
          name="password" 
          placeholder="Secret Key" 
          isPassword={true} 
          onChange={handleChange} 
        />
        <div className="text-right mb-6">
          <a href="#" className="text-sm text-gray-600 hover:text-black transition duration-300 border-b border-transparent hover:border-black">
            Forgot Password?
          </a>
        </div>
        
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full mt-6 font-bold py-3 rounded-lg transition duration-300 transform shadow-lg hover:shadow-xl bg-black hover:bg-gray-800 text-white hover:scale-105`}
        >
          {isSubmitting ? 'Entering...' : 'Enter'}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-8">
        Not a dev?
        <a 
          href="/signup"
          className="font-semibold text-black hover:text-gray-700 ml-2 focus:outline-none border-b border-transparent hover:border-black transition duration-300"
        >
          {/* Sign Up */} Become dev
         </a>
      </p>
      <ToastContainer />
    </div>
  );
};

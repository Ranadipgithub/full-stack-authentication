import React, { useContext, useEffect } from 'react'
import { assets } from '../assets/assets.js'
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const EmailVerify = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const {backendUrl, isLoggedIn, userData, getUserData} = useContext(AppContext);
  const inputRefs = React.useRef([]);
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      {
        inputRefs.current[index + 1].focus();
      }
    }
  }
  const handleKeyDown = (e,index) => {
    if (e.key === 'Backspace' && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('Text');
    const pasteArray = pastedData.split('');
    pasteArray.forEach((char, index) => {
      if(inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    })
  }

  const onSubmitHandler = async (e) => {
    try{
      e.preventDefault();
      const otpArray = inputRefs.current.map(ref => ref.value);
      const otp = otpArray.join('');
      const {data} = await axios.post(backendUrl + '/api/auth/verify-account', {otp});
      if(data.success){
        toast.success(data.message);
        navigate('/');
      } else{
        toast.error(data.message);
      }
    } catch(err){
      toast.error(err.message);
    }
  }

  useEffect(() => {
    isLoggedIn && userData && userData.isAccountVerified && navigate('/');
  }, [isLoggedIn, userData]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={() => navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />
      <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-3xl font-semibold mb-4 text-white text-center'>Email Verify Otp</h1>
        <p className='mb-6 text-center text-indigo-300'>Enter the 6 digit code sent to your email id</p>
        <div onPaste={handlePaste} className='flex justify-between mb-8'>
          {Array(6).fill(0).map((_, index) => (
            <input ref={el => (inputRefs.current[index] = el)} onInput={(e) => handleInput(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} maxLength='1' key={index} type="text" className="w-12 h-12 text-center border border-gray-600 rounded-md mr-2 text-white" required />
          ))}
        </div>
        <button  className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer'>Verify Email</button>
      </form>
    </div>
  )
}

export default EmailVerify

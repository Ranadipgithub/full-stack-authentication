import React, { useContext, useEffect, useRef } from 'react'
import { assets } from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContext);
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = useRef(null);

  const sendVerificationOtp = async () => {
    try{
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp');
      if(data.success){
        navigate('/email-verify');
        toast.success(data.message);
      }else{
        toast.error(data.message);
      }
    } catch(error){
      toast.error(error.message);
    };
  }

  const logout = async () => {
    try{
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate('/');
    } catch(error){
      toast.error(error.message);
    };
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 bg-white'>
      <img src={assets.logo} alt="logo" className='w-28 sm:w-32' />
      {userData ? (
        <div className='relative' ref={menuRef} onClick={() => setShowMenu(!showMenu)}>
          <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white cursor-pointer'>
            {userData.name[0].toUpperCase()}
          </div>
          <div className={`absolute ${showMenu ? 'block' : 'hidden'} top-10 right-0 z-10 text-black rounded bg-gray-100`}>
            <ul className='list-none m-0 p-2 text-sm'>
              {!userData.isAccountVerified && (
                <li onClick={sendVerificationOtp} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>
                  Verify Email
                </li>
              )}
              <li onClick={logout} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button onClick={() => navigate('/login')} className='flex items-center gap-2 border border-gray-500 rounded-full py-2 px-6 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer'>
          Login <img src={assets.arrow_icon} alt="arrow" />
        </button>
      )}
    </div>
  )
}

export default Navbar

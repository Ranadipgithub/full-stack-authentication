import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import {toast} from 'react-toastify'

const Login = () => {
    const navigate = useNavigate();
    const {backendUrl, setIsLoggedIn, getUserData} = useContext(AppContext);
    console.log("Backend URL from Context:", backendUrl); 
    const [state, setState] = useState('Sign Up');
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            axios.defaults.withCredentials = true;

            if (state === "Sign Up") {
                const { data } = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password });

                if (data.success) {
                    setIsLoggedIn(true);
                    getUserData();
                    navigate("/");
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axios.post(`${backendUrl}/api/auth/login`, { email, password });

                if (data.success) {
                    setIsLoggedIn(true);
                    getUserData();
                    navigate("/");
                } else {
                    toast.error(data.message);
                }
            }
        } catch (err) {
            console.error(err.response?.data || err.message); // Debugging
            toast.error(err.response?.data?.message || "Something went wrong!");
        }
    };
    return (
        <div className='min-h-screen flex flex-col items-center justify-center px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
            <img onClick={() => navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />
            <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
                <h2 className='text-3xl font-semibold mb-3 text-white text-center'>{state === "Sign Up" ? "Create account" : "Login"}</h2>
                <p className='text-center text-sm mb-6'>{state === "Sign Up" ? "Create your account" : "Login to your account"}</p>

                <form onSubmit={onSubmitHandler}>
                    {state === "Sign Up" && (
                        <div className='flex items-center gap-3 w-full px-5 py-2.5 mb-4 rounded-full bg-[#333A5C]'>
                            <img src={assets.person_icon} alt="" />
                            <input onChange={e => setName(e.target.value)} value={name} className='w-full bg-transparent text-white outline-none' type="text" placeholder='Full Name' required />
                        </div>
                    )}
                    <div className='flex items-center gap-3 w-full px-5 py-2.5 mb-4 rounded-full bg-[#333A5C]'>
                        <img src={assets.mail_icon} alt="" />
                        <input onChange={e => setEmail(e.target.value)} value={email} className='w-full bg-transparent text-white outline-none' type="email" placeholder='Email Id' required />
                    </div>
                    <div className='flex items-center gap-3 w-full px-5 py-2.5 mb-4 rounded-full bg-[#333A5C]'>
                        <img src={assets.lock_icon} alt="" />
                        <input onChange={e => setPassword(e.target.value)} value={password} className='w-full bg-transparent text-white outline-none' type="password" placeholder='Password' required />
                    </div>
                    <p onClick={() => navigate('/reset-password')} className='text-right text-indigo-400 cursor-pointer mb-4'>Forgot Password?</p>
                    <button className='w-full bg-indigo-500 hover:bg-indigo-600 transition-all py-2.5 rounded-full cursor-pointer text-white font-medium'>{state === "Sign Up" ? "Sign Up" : "Login"}</button>
                </form>
                {state === "Sign Up" ? (
                    <p className='text-center mt-4 text-sm text-gray-400'>Already have an account?{' '} <span className='text-indigo-400 cursor-pointer underline' onClick={() => setState("Login")}>Login here</span></p>
                ) : (<p className='text-center mt-4 text-sm text-gray-400'>Don't have an account?{' '} <span className='text-indigo-400 cursor-pointer underline' onClick={() => setState("Sign Up")}>Sign Up</span></p>
                )}
            </div>
        </div>
    )
}

export default Login

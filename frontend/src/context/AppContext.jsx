import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;
    const backendUrl = import.meta.env.VITE_BACKEND_URI;
    console.log(backendUrl);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(false);

    const getUserData = async () => {
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(backendUrl + '/api/user/data');
            data.success ? setUserData(data.userData) : toast.error(data.message);
        } catch (err) {
            // toast.error(err.message);
            console.log(err);
        }
    }

    const getAuthState = async () => {
        axios.defaults.withCredentials = true;
        try{
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth');
            if(data.success){
                setIsLoggedIn(true);
                getUserData();
            }
        } catch(err){
            toast.error(err.message);
        }
    }

    

    useEffect(() => {
        getAuthState();
    }, [])

    const value = {
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
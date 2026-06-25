import { createContext,useEffect,useState } from "react";
import axios from "axios";
import { USER_ROLE } from "../utils/constant";
const AppContext = createContext();

export const AppContextProvider = (props)=>{
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedin,setIsLoggedin] = useState(false)
    const[userData,setUserData] = useState(false)
    const [isLoading, setIsLoading] = useState(true);
    
      


    const getUserData = async ()=>{

        try {
            axios.defaults.withCredentials=true
            const {data} = await axios.get(backendUrl + '/api/user/data', {}    )
            data.success ? setUserData(data.userData) : alert(data.message)

            
        } catch (error) {
            alert(error.message)
        }


    }

    useEffect(() => {
      let active = true;

      const initializeAuth = async () => {
         try {
            axios.defaults.withCredentials = true
            const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`)

            if (data.success && active) {
               setIsLoggedin(true);
               const { data: userDataResult } = await axios.get(`${backendUrl}/api/user/data`)
               
               if (userDataResult.success && active) {
                  setUserData(userDataResult.userData);
                  console.log(userDataResult.userData);
               }
            }
         } catch (err) {
            if (active) console.log(err.response?.data?.message || err.message);
         }finally {
        // 3. Turn off loading state when API requests finish (success or fail)
        if (active) setIsLoading(false);
      }
      };

      initializeAuth();
      return () => {
         active = false;
      };
   }, [backendUrl]);


    const isAdmin = userData && userData.role === USER_ROLE.ADMIN

    const value = {
        backendUrl,
        isLoggedin,setIsLoggedin,
        userData,setUserData,
        getUserData,
        isLoading,
        isAdmin,
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export { AppContext }
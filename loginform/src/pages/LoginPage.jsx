import { useContext, useState } from 'react'
import '../css/loginPage.css'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
const LoginPage = () => {
  const {backendUrl,setIsLoggedin,getUserData} = useContext(AppContext)

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
     
    email: '',
    password: '',
    
   
  });
  const isValidPassword = (password) => {

    const passwordregex = /^[a-zA-Z0-9!@#$%()_]{3,}$/;
    return passwordregex.test(password);}

  




const [errors, setErrors] = useState({});
const validateForm = () => {
  let newError = {};
  const emailregex = /^[a-zA-Z0-9._%+$]+@[a-zA-Z0-9.]+\.[a-zA-Z].{2,}$/;



  if(!formData.email){
    newError.email = "user emailid is required"
    
  }

  else if(!emailregex.test(formData.email)){
    newError.email= "format is not valid"
  }
  if(!formData.password){
    newError.password = "password is required"
    
  }
  else if(!isValidPassword(formData.password)){
     newError.password = "password is not in the correct format"

  }

 
  setErrors(newError);
  return Object.keys(newError).length === 0;
};





const handleSubmit = async (e) => {
  e.preventDefault();
  if(!validateForm()) return;
    
  
 try {
     
   axios.defaults.withCredentials = true
    
  
       const {data}= await axios.post(backendUrl + '/api/auth/login',formData)

       if(data.success){
        setIsLoggedin(true)
        getUserData()
        navigate('/userpage')
       }else{
        alert(data.message)
       }

    
    
   } catch (error) {
    alert(error.message);
    alert(error.response?.data?.message);
    
   }
 


  

  
};
const handleChange = (e) =>{
  const {id,value} = e.target;

  setFormData({
    ...formData,
    [id]:value,
  })
};






  return (
    <div className="login-page">
    <div className="container">
      <div className='head'>
        <h1>Smart Parking </h1>
      </div>
      <div className='sign up'>
        <h3>Login Here</h3>
        <div className='details'></div>
        <form name="myform" onSubmit={handleSubmit}>
        
            
          <div className="input">
            <label htmlFor="email">Email</label>
            <input type="text" placeholder="you@example.com" id="email" value={formData.email} onChange={handleChange}></input>{errors.email && <div className='errors'>{errors.email}</div>}

          </div>
          <div className="input">
            <label htmlFor="password">Password</label>
            <input type="password" placeholder="min 6 chars,enter your password" id="password" value={formData.password} onChange={handleChange}></input>{errors.password && <div className='errors'>{errors.password}</div>}
          </div>
           
         
          <div className="submitdetails">
            <button onClick={handleSubmit}>Submit</button>
          </div>
          <div className="forgot-password-link">
            <span onClick={() => navigate('/reset-password-request')}>
              Forgot Password?
            </span>
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}

export default LoginPage
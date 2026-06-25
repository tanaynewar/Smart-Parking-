import { useState, useContext } from 'react'
import '../css/registerpage.css'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Registerpage = () => {
  const { backendUrl, setIsLoggedin } = useContext(AppContext)
  const navigate = useNavigate()

  
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    car_number: '',
    vehicle_type: ''
  });

  const isValidPassword = (password) => {
    const passwordregex = /^[a-zA-Z0-9!@#$%()_]{3,}$/;
    return passwordregex.test(password);
  }

  const isValidPhone = (phone) => {
    const phoneregex = /^[0-9]{10}$/;
    return phoneregex.test(phone);
  };
  const isValidCarNumber = (carNumber) => {
  const carRegex =
    /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}$/i;

  return carRegex.test(carNumber);
};

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newError = {};
    const emailregex = /^[a-zA-Z0-9._%+$]+@[a-zA-Z0-9.]+\.[a-zA-Z].{2,}$/;

    if (!formData.username) {
      newError.username = "user name is required"
    }
    if (!formData.email) {
      newError.email = "user emailid is required"
    } else if (!emailregex.test(formData.email)) {
      newError.email = "format is not valid"
    }
    if (!formData.password) {
      newError.password = "password is required"
    } else if (!isValidPassword(formData.password)) {
      newError.password = "password is not in the correct format"
    }

    if (formData.password !== formData.confirmPassword) {
      newError.confirmPassword = "password is not the same"
    }
    if (!formData.phoneNumber) {
      newError.phoneNumber = "phone number is required"
    } else if (!isValidPhone(formData.phoneNumber)) {
      newError.phoneNumber = "phone number must be 10 digit is required"
    }
    if (!formData.car_number) {
  newError.car_number = "Car registration number is required";
} else if (!isValidCarNumber(formData.car_number)) {
  newError.car_number = "Car registration number is not in the correct format";
}
    if (!formData.vehicle_type) {
      newError.vehicle_type = "vehicle type is required"
    }
    
    setErrors(newError);
    return Object.keys(newError).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    
    setIsLoading(true);

    try {
      axios.defaults.withCredentials = true
      const { data } = await axios.post(backendUrl + '/api/auth/register', formData)

      if (data.success) {
        setIsLoggedin(true)
        navigate('/login') 
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert(error.response?.data?.message);
    } finally {
      
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    })
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className='head'>
          <h1>Smart Parking </h1>
        </div>
        <div className='sign up'>
          <h3>Sign Up</h3>
          <div className='details'></div>
          <form name="myform" onSubmit={handleSubmit}>
            <div className="input">
              <label htmlFor="username">Username</label>
              <input type="text" placeholder="enter your username" id="username" value={formData.username} onChange={handleChange}></input>
              {errors.username && <div className='errors'>{errors.username}</div>}
            </div>
            <div className="input">
              <label htmlFor="email">Email</label>
              <input type="text" placeholder="you@example.com" id="email" value={formData.email} onChange={handleChange}></input>
              {errors.email && <div className='errors'>{errors.email}</div>}
            </div>
            <div className="input">
              <label htmlFor="password">Password</label>
              <input type="password" placeholder="min 6 chars,enter your password" id="password" value={formData.password} onChange={handleChange}></input>
              {errors.password && <div className='errors'>{errors.password}</div>}
            </div>
            <div className="input">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" placeholder="re-enter your password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange}></input>
              {errors.confirmPassword && <div className='errors'>{errors.confirmPassword}</div>}
            </div>
            <div className="input">
              <label htmlFor="phoneNumber">Enter Your Mobile Number</label>
              <input type="text" placeholder="please provide your mobile number" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange}></input>
              {errors.phoneNumber && <div className='errors'>{errors.phoneNumber}</div>}
            </div>
            <div className="input">
              <label htmlFor="car_number">Enter Your Car Registration Number</label>
              <input type="text" placeholder="please provide your car registration number" id="car_number" value={formData.car_number || ''} onChange={handleChange}></input>
              {errors.car_number && <div className='errors'>{errors.car_number}</div>}
            </div>
            <div className="input">
              <label htmlFor="vehicle_type">Vehicle Type</label>
              <select id="vehicle_type" value={formData.vehicle_type} onChange={handleChange}>
                <option value="" disabled>Select vehicle type</option>
                <option value="2">2 Wheeler</option>
                <option value="3">3 Wheeler</option>
                <option value="4">4 Wheeler</option>
              </select>
              {errors.vehicle_type && <div className='errors'>{errors.vehicle_type}</div>}
            </div>
            <div className="submitdetails">
              {/* Button becomes disabled and changes text dynamically when loading */}
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Registerpage
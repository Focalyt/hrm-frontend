import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/login.css';
import { toast } from 'react-toastify';

const Login = () => {
  const [emailOrPhone, setEmailorPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false); // Use boolean for loading state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();


  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  

  if (token) {
    // Verify token with backend
<<<<<<< HEAD
    axios.get(`${process.env.BACKEND_URI}&/verify-token`, {
=======
    axios.get('http://localhost:3000/verify-token', {
>>>>>>> parent of be70948 (url added)
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.data.token === token && response.data.role === "admin" ) {
          setIsAuthenticated(true); // Token matches, allow access
          navigate('/admin/dashboard');
        }
        else if  (response.data.token === token && response.data.role === "employee" ) {
          setIsAuthenticated(true); // Token matches, allow access
          navigate('/employee/dashboard');
        }
        

         else {
          toast('Access denied');; // Token doesn't match, clear storage and redirect
        }
      })
      .catch(error => {
        navigate('/login')

        // On any error, clear storage and redirect to login
      })
    return;
  }



  const submitHandler = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
<<<<<<< HEAD
      .post(`${process.env.REACT_APP_BACKEND_URI}/employee/login`, {
=======
      .post('http://localhost:3000/employee/login', {
>>>>>>> parent of be70948 (url added)
        emailOrPhone: emailOrPhone,
        password: password,
      })
      .then((res) => {
        setLoading(false);
        console.log(res.data)
        localStorage.setItem('company_name', res.data.company_name)
        localStorage.setItem('employeeID', res.data._id)
        localStorage.setItem('first_name', res.data.first_name)
        localStorage.setItem('last_name', res.data.last_name)
        localStorage.setItem('email', res.data.email)
        localStorage.setItem('photo_url', res.data.photo_url)
        localStorage.setItem('photo_Id', res.data.photo_Id)
        localStorage.setItem('role', res.data.role)
        localStorage.setItem('designation', res.data.designation)
        localStorage.setItem('token', res.data.token)
        if(res.data.role === "employee"){
            setIsAuthenticated(true); // Token matches, allow access
            navigate('/employee/dashboard');
        }
        else if(res.data.role === "employee"){
          setIsAuthenticated(true); // Token matches, allow access
          navigate('/admin/dashboard');
      }
      else{
        return
      }
        

        toast('Welocome to HRM')
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.response.data.error); // Better user feedback
        console.log(err.response.data.error);
      });
  };

  return (
    <div className="main-wrapper">
      <div className="header-wrapper">
        <div className="wrapper-header">
          <img className="logo" alt="Logo" src={require('../../assets/Focalyt new Logo.png')} />
        </div>

        <form className="form-wrapper" onSubmit={submitHandler}>
          <input required value={emailOrPhone} onChange={(e) => setEmailorPhone(e.target.value)} placeholder="Email/Mobile Number" />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Added value for password input
            placeholder="Password"
          />
          <button type="submit">
            {isLoading && <i className="fa-solid fa-spinner fa-spin-pulse fa-spin-reverse"></i>} Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

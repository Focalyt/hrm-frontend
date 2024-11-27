import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/admin.css'
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Admin = () => {
  const location = useLocation()
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track if the token is valid

  // const [loading, setLoading] = useState(true); // Track loading state

  const [isOpen, setIsOpen] = useState(false);

  // Toggle Dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const clearStorage = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
    toast('Successfully Logout');
  };
  const logOut = () => {
    const confirmation = window.confirm('Are you sure you want to logout')
    if (confirmation) {
      clearStorage()
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    if (!token) {
      // If token doesn't exist, redirect to login
      navigate('/login');
      return;
    }

    // Verify token with backend
    axios.get(`${process.env.BACKEND_URI}&/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.data.token === token) {
          setIsAuthenticated(true); // Token matches, allow access
        } else {
          toast('Access denied');; // Token doesn't match, clear storage and redirect
        }
      })
      .catch(error => {
        navigate('/login')

        // On any error, clear storage and redirect to login
      })

  });
  if (!isAuthenticated) {
    return null; // Render nothing if not authenticated to avoid double redirects
  }

  return (
    <div className='dashboard-container'>
      <div className='side-nave'>
        <div className='profile-container'>
          <div className='profile-pic-container'>
            <img className='company-logo' alt='logo' src={localStorage.getItem('photo_url')} />
          </div>
          {/* <h2>{localStorage.getItem('company_name')}</h2> */}

        </div>
        <div className='menu-container'>
          <Link to='/admin/dashboard' className={location.pathname === '/admin/dashboard' ? 'active-menu-link' : 'menu-link'}><i class="fa-solid fa-gauge"></i> Dashboard</Link>
          <Link to='/admin/add-employee' className={location.pathname === '/admin/add-employee' ? 'active-menu-link' : 'menu-link'}><i class="fa-solid fa-user-plus"></i>Add Employee</Link>
          <Link to='/admin/employee-list' className={location.pathname === '/admin/employee-list' ? 'active-menu-link' : 'menu-link'}><i class="fa-solid fa-user"></i>  Employee List</Link>
          <Link to='/admin/setting' className={location.pathname === '/admin/setting' ? 'active-menu-link' : 'menu-link'}><i class="fa-solid fa-gear"></i>  Setting</Link>
          <Link onClick={logOut} className='menu-link'><i class="fa-solid fa-right-from-bracket"></i> Logout</Link>

        </div>

      </div>

      <div className='content-container'>
        <div className='contantent-container-top-bar-main' >
          <div className='contantent-container-top-bar'>

          <div className='profile-details' onClick={(toggleDropdown)}>
            <span className='profile-name'>{localStorage.getItem('first_name')} {localStorage.getItem('last_name')}</span>
            <span className='profile-disgnation'>{localStorage.getItem('role')} </span>
          </div>
          <div className='profile-pic-div' onClick={(toggleDropdown)}>
            <img className='profile-pic' alt='profile-pic' src={localStorage.getItem('photo_url')} />
          </div>
          </div>

        </div>
        <div className='content-container-main' >
          <Outlet />
        </div>

      </div>

    </div>
  );
}

export default Admin;

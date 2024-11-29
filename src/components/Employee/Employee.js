import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/admin.css'
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { MdOutlineNotificationAdd } from "react-icons/md";
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

  //sidebar toggle 
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarVisible(true); // Show sidebar on large screens
      } else {
        setSidebarVisible(false); // Hide sidebar on small screens
      }
    };
  
    // Attach the event listener
    window.addEventListener('resize', handleResize);
  
    // Initial check
    handleResize();
  
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Mobile Sidebar Link 
  const isSmallDevice = useMediaQuery({maxWidth:768});

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarVisible(false); // Close sidebar on small screens
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
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
    axios.get(`https://hrm-back-end.onrender.com/verify-token`, {
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
     <button className="toggle-btn" onClick={toggleSidebar}>
        <i className="fa-solid fa-bars"></i>
      </button>
      {/* <div className='side-nave'> */}
      <div className={`side-nave ${isSidebarVisible ? 'visible' : 'hidden'}`}>
        <div className='profile-container'>
          <div className='profile-pic-container'>
            <img className='company-logo' alt='logo' src={localStorage.getItem('photo_url')} />
          </div>
          {/* <h2>{localStorage.getItem('company_name')}</h2> */}

        </div>
        <div className='menu-container'>
        {!isSmallDevice && (<>
          <Link to='/employee/dashboard' className={location.pathname === '/admin/dashboard' ? 'active-menu-link' : 'menu-link'}    onClick={() => handleLinkClick()}
><i class="fa-solid fa-gauge"></i> Dashboard</Link>
          <Link to='/employee/attendance' className={location.pathname === '/admin/add-employee' ? 'active-menu-link' : 'menu-link' }      onClick={() => handleLinkClick()}
><i class="fa-solid fa-clipboard-user"></i> Attendance</Link>
          <Link to='/employee/salary-details' className={location.pathname === '/admin/employee-list' ? 'active-menu-link' : 'menu-link'}       onClick={() => handleLinkClick()}
><i class="fa-solid fa-wallet"></i>  Salary Details</Link>
        </>)}
   
          <Link to='/employee/ticket' className={location.pathname === '/admin/employee-list' ? 'active-menu-link' : 'menu-link'}       onClick={() => handleLinkClick()}
><i class="fa-solid fa-ticket"></i>  Ticket</Link>
          <Link to='/employee/setting' className={location.pathname === '/admin/setting' ? 'active-menu-link' : 'menu-link'}       onClick={() => handleLinkClick()}
><i class="fa-solid fa-gear"></i>  Setting</Link>
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
          <div className='reactIcon' onClick={(toggleDropdown)}>
          <MdOutlineNotificationAdd />
          </div>
          </div>

        </div>
        <div className='content-container-main' >
          <Outlet />
        </div>

      </div>
    {/*  Mobile Footer */}
    
    <div className='mobile_footer_tabs' id="mobileFooter">
        <div className='mobile_container' >
          <ul className='mobile_link_list'>
          <li>
          <Link to='/employee/dashboard' className={location.pathname === '/admin/dashboard' ? 'active-menu-link' : 'menu-link'}    onClick={() => handleLinkClick()}
><i class="fa-solid fa-gauge"></i> Dashboard</Link>
          </li>
            <li>
            <Link to='/employee/attendance' className={location.pathname === '/admin/add-employee' ? 'active-menu-link' : 'menu-link'}       onClick={() => handleLinkClick()}
><i class="fa-solid fa-clipboard-user"></i> Attendance</Link></li>
            <li>
            <Link to='/employee/salary-details' className={location.pathname === '/admin/employee-list' ? 'active-menu-link' : 'menu-link'}       onClick={() => handleLinkClick()}
><i class="fa-solid fa-wallet"></i>  Salary Details</Link> 

            </li>
          </ul>

        </div>
    </div>
    </div>
  );
}

export default Admin;

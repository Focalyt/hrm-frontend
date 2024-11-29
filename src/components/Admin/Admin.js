import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/admin.css';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  // Toggle Dropdown
  const toggleSettingsMenu = () => {
    setIsSettingOpen(prev => !prev);
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

 const handleLinkClick = () => {
  if (window.innerWidth <= 768) {
    setSidebarVisible(false); // Close sidebar on small screens
  }
};

  const clearStorage = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
    toast('Successfully Logout');
  };

  const logOut = () => {
    const confirmation = window.confirm('Are you sure you want to logout?');
    if (confirmation) {
      clearStorage();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get(`https://hrm-back-end.onrender.com/verify-token`, {

      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (response.data.token === token) {
          setIsAuthenticated(true);
        } else {
          toast('Access denied');
          clearStorage();
        }
      })
      .catch(() => {
        clearStorage();
        navigate('/login');
      });
  }, [navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className='dashboard-container'>
    <button className="toggle-btn" onClick={toggleSidebar}>
    {/*  */}
        <i className="fa-solid fa-bars"></i>
      </button>
      {/* <div className='side-nave'> */}
      <div className={`side-nave ${isSidebarVisible ? 'visible' : 'hidden'}`}>

        <div className='profile-container'>
          <div className='profile-pic-container'>
            <img className='company-logo' alt='logo' src={localStorage.getItem('photo_url')} />
          </div>
        </div>

        <div className='menu-container'>
<<<<<<< HEAD
          <Link to='/admin/dashboard' className={location.pathname === '/admin/dashboard' ? 'active-menu-link' : 'menu-link'} onClick={handleLinkClick}><i className="fa-solid fa-gauge"></i> Dashboard</Link>
          <Link to='/admin/add-employee' className={location.pathname === '/admin/add-employee' ? 'active-menu-link' : 'menu-link'} onClick={handleLinkClick}><i className="fa-solid fa-user-plus"></i>Add Employee</Link>
          <Link to='/admin/employee-attendance' className={location.pathname === '/admin/employee-attendance' ? 'active-menu-link' : 'menu-link'} onClick={handleLinkClick}><i className="fa-solid fa-clipboard-user"></i>  Employees Attendance</Link>
          <Link to='/admin/employee-list' className={location.pathname === '/admin/employee-list' ? 'active-menu-link' : 'menu-link'} onClick={handleLinkClick}><i className="fa-solid fa-user"></i>  Employee List</Link>
          <Link to='/admin/setting' className={location.pathname === '/admin/setting' ? 'active-menu-link' : 'menu-link'} onClick={handleLinkClick}><i className="fa-solid fa-gear"></i>  Setting</Link>
          <Link onClick={logOut} className='menu-link'><i className="fa-solid fa-right-from-bracket"></i> Logout</Link>
=======
          <Link to='/admin/dashboard' className={location.pathname === '/admin/dashboard' ? 'active-menu-link' : 'menu-link'}>
            <i className="fa-solid fa-gauge"></i> Dashboard
          </Link>
          <Link to='/admin/add-employee' className={location.pathname === '/admin/add-employee' ? 'active-menu-link' : 'menu-link'}>
            <i className="fa-solid fa-user-plus"></i> Add Employee
          </Link>
          <Link to='/admin/employee-attendance' className={location.pathname === '/admin/employee-attendance' ? 'active-menu-link' : 'menu-link'}>
            <i className="fa-solid fa-clipboard-user"></i> Employees Attendance
          </Link>
          <Link to='/admin/employee-list' className={location.pathname === '/admin/employee-list' ? 'active-menu-link' : 'menu-link'}>
            <i className="fa-solid fa-user"></i> Employee List
          </Link>
          <Link onClick={toggleSettingsMenu} to='/admin/setting' className={location.pathname === '/admin/setting' ? 'active-menu-link' : 'menu-link'}>
            <i className="fa-solid fa-gear"></i> Setting
            <span className="arrow-icon">
              <i className={isSettingOpen?`fa fa-chevron-right`:`fa fa-chevron-down`}></i>
            </span>
          </Link>
>>>>>>> 505c7a7ada843990c6abbd0b7832b189e0e414b5

          {isSettingOpen && (
            <div className={`menu-setting-container${
              isSettingOpen ? "-open" : ""
            }`}>
              <Link to='/admin/setting/category' className={location.pathname === '/admin/setting/category' ? 'active-menu-link' : 'menu-link'}>
                <i className="fa-solid fa-list"></i> Category
              </Link>
              <Link to='/admin/setting/sub-category' className={location.pathname === '/admin/setting/sub-category' ? 'active-menu-link' : 'menu-link'}>
                <i className="fa-solid fa-list"></i> Sub Category
              </Link>
            </div>
          )}

          <Link onClick={logOut} className='menu-link'>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </Link>
        </div>
      </div>

      <div className='content-container'>
        <div className='contantent-container-top-bar-main'>
          <div className='contantent-container-top-bar'>
            <div className='profile-details'>
              <span className='profile-name'>{localStorage.getItem('first_name')} {localStorage.getItem('last_name')}</span>
              <span className='profile-disgnation'>{localStorage.getItem('role')}</span>
            </div>
            <div className='profile-pic-div'>
              <img className='profile-pic' alt='profile-pic' src={localStorage.getItem('photo_url')} />
            </div>
          </div>
        </div>
        <div className='content-container-main'>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;

import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from './components/Common/Login';
import Admin from './components/Admin/Admin';
import AdminDashboard from './components/Admin/Dashboard';
import EmployeeList from './components/Admin/EmployeeList';
import EmployeeAttendance from './components/Admin/EmployeeAttendance';
import Category from './components/Admin/Category';
import SubCategoty from './components/Admin/SubCategory';
import AddEmployee from './components/Admin/AddEmployee';


import Employee from './components/Employee/Employee';
import EmployeeDashboard from './components/Employee/Dashboard';
import Attendance from './components/Employee/Attendance';
import EmployeeSetting from './components/Employee/Setting';
import EmployeeSalary from './components/Employee/Salary';
import Ticket from './components/Employee/Ticket';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const myRoutes = createBrowserRouter([
    { path: '/', element: <Navigate to="/login" /> },
    { path: '/login', element: <Login /> },
    {
        path: '/admin',
        element: <Admin />,
        children: [
            { path: 'dashboard', element: <AdminDashboard /> },
            { path: 'employee-list', element: <EmployeeList /> },
            { path: 'employee-attendance', element: <EmployeeAttendance /> },
            { path: 'setting/category', element: <Category /> },
            { path: 'setting/sub-category', element: <SubCategoty /> },
            { path: 'add-employee', element: <AddEmployee /> },
        ],
    },
    {
        path: '/employee',
        element: <Employee />,
        children: [
            { path: 'dashboard', element: <EmployeeDashboard /> },
            { path: 'attendance', element: <Attendance /> },
            { path: 'salary-details', element: <EmployeeSalary /> },
            { path: 'ticket', element: <Ticket /> },
            { path: 'setting', element: <EmployeeSetting /> },
        ],
    },
]);

function App() {
    return (
        <div>
            <RouterProvider router={myRoutes} />
            <ToastContainer />
        </div>
    );
}

export default App;

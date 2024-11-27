import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/employeeList.css';
import { toast } from 'react-toastify';

const EmployeeList = () => {
    const [users, setEmployees] = useState([]);
    const [editEmployee, setEditEmployee] = useState(null);
    const validUser = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    const [isStatusActive, setStatus]= useState('checked');



    const fetchEmployees = () => {
<<<<<<< HEAD
        axios.get(`${process.env.BACKEND_URI}&/employee/employee-list?email=${validUser}`, {
=======
        axios.get(`http://localhost:3000/employee/employee-list?email=${validUser}`, {
>>>>>>> parent of 0351025 (url added)
            headers: {
                Authorization: `Bearer ${token}` // Add the token in the Authorization header
            }
        })
            .then(response => {
                setEmployees(response.data);
                //    console.log(users)                   
            })
            .catch(error => console.error('Error fetching employees:', error));
    };

    useEffect(() => {
        if (validUser) {
            fetchEmployees();
        } else {
            console.warn('No valid user email found in local storage.');
        }
    }, [validUser]);

    const handleEditClick = (employee) => {
        setEditEmployee(employee); // Set the employee data to be edited, assuming `employee` is nested under `employee`
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditEmployee({ ...editEmployee, [name]: value });
    };
    

    const handleEditSubmit = async (e) => {
        e.preventDefault();
    
        const { _id, ...updates } = editEmployee; // Separate _id from the rest of the updates
    
        try {
            const response = await axios.patch(
                `${process.env.BACKEND_URI}&/user/edit-employee/${_id}`,
                updates, // Pass the nested structure directly
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            toast.success(response.data.message || "Employee updated successfully!");
            setEditEmployee(null); // Clear the edit form
            fetchEmployees(); // Refresh the employee list
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "An error occurred. Please try again.";
            toast.error(`Error: ${errorMessage}`);
            console.error("Error updating employee:", error);
        }
    };
    

    const handleDelete = (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this employee?");
        if (confirmed) {
            axios.delete(`${process.env.BACKEND_URI}&/user/delete-employee/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}` // Add the token in the Authorization header
                    }
                }
            )
                .then(response => {
                    console.log(response.data.message);
                    toast(response.data.message);
                    fetchEmployees(); // Refresh list after deletion
                })
                .catch(error => {
                    console.error('Error deleting employee:', error);
                    const errorMessage =
                        error.response?.data.message || "An error occurred. Please try again.";
                    toast.error(`Error: ${errorMessage}`);
                });
        }
    };

    return (
        <div className="employee-list-container">
            <h2 className="employee-list-title">User List</h2>
            <input type="text" placeholder="Search something..." className="search-input" />
            <table className="employee-table">
                <thead>
                    <tr className='header-tr'>
                        <th>Name</th>
                        <th>EMP-Code</th>
                        <th>Mobile</th>
                        <th>Designation</th>
                        {/* <th>Created Date</th> */}
                        <th>Joining Date</th>
                        {/* <th>Left Date</th> */}
                        <th>Status</th>

                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(emp => (


                        <tr key={emp._id}>
                            <td className="employee-info">
                                <img src={emp?.photo_url || 'default-avatar.png'} alt={emp?.first_name} className="employee-avatar" />
                                <div className='employee-basic-info'>
                                    <span className="employee-name">{emp?.first_name} {emp?.last_name}</span>
                                    <span className="employee-email">{emp?.officialEmail}</span>
                                </div>
                            </td>
                            <td>{emp?.employee_id || 'ID Missing'}</td>
                            <td>{emp?.phone_number || 'Phone Number Missing'}</td>
                            <td>{emp?.designation || 'Designation Missing'}</td>
                            {/* <td>{emp?.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'Invalid Date'}</td> */}
                            {/* <td>{emp?.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'Invalid Date'}</td> */}
                            <td>{emp?.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'Invalid Date'}</td>
                            <td>
                                <label className="switch">
                                    <input className='statuscheck' type="checkbox" checked={emp.employment_details.status} />
                                    <span className="slider round"></span>
                                </label></td>

                            <td >
                                <button className="action-btn edit-btn" onClick={() => handleEditClick(emp)}><i class="fa-solid fa-eye"></i></button>
                                <button className="action-btn edit-btn" onClick={() => handleEditClick(emp)}>✏️</button>

                                {/* <button className="action-btn delete-btn" onClick={() => handleDelete(emp._id)}>🗑️</button> */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Expanded Edit Employee Form */}
            {editEmployee && (
                <div className="edit-employee-form">
                    <h3>Edit Employee</h3>
                    <form onSubmit={handleEditSubmit}>
                        <label>
                            First Name:
                            <input type="text" name="first_name" value={editEmployee.first_name || ''} onChange={handleEditChange} />
                        </label>
                        <label>
                            Last Name:
                            <input type="text" name="last_name" value={editEmployee.last_name || ''} onChange={handleEditChange} />
                        </label>
                        <label>
                            Personal Email:
                            <input type="email" name="personalEmail" value={editEmployee.personalEmail || ''} onChange={handleEditChange} />
                        </label>
                        <label>
                            Official Email:
                            <input type="email" name="officialEmail" value={editEmployee.officialEmail || ''} onChange={handleEditChange} />
                        </label>
                        <label>
                            Phone Number:
                            <input type="tel" name="phone_number" value={editEmployee.phone_number || ''} onChange={handleEditChange} />
                        </label>
                        <label>
                            Gender:
                            <input type="text" name="gender" value={editEmployee.gender || ''} onChange={handleEditChange} />
                        </label>
                        <label>
                            Date of Birth:
                            <input type="date" name="date_of_birth" value={editEmployee.date_of_birth || ''} onChange={handleEditChange} />
                        </label>
                        <label>
                         Left Date:
                            <input type="date" name="termination_date" value={editEmployee.termination_date || ''} onChange={handleEditChange} />
                        </label>
                        <label>
                            Role:
                            <input type="text" name="role" value={editEmployee.role || ''} onChange={handleEditChange} />
                        </label>
                        <label>
                            Status
                            <input type="checkbox" name="status" value={editEmployee.employment_details.status || ''} onChange={handleEditChange} />
                        </label>
                        <button type="submit" className="save-btn">Save</button>
                        <button type="button" className="cancel-btn" onClick={() => setEditEmployee(null)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;

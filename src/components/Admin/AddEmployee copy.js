import React, { useState, useEffect } from 'react';
import '../../css/addEmployee.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddEmployee = (e) => {
    const [step, setStep] = useState(1); // Step control
    const [employees, setEmployees] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const validUser = localStorage.getItem('email');

    // Initialize employee state with all fields
    const [employee, setEmployee] = useState({
        employee_id: '',
        first_name: '',
        last_name: '',
        personalEmail: '',
        officialEmail: '',
        phone_number: '',
        date_of_birth: '',
        gender: '',
        marital_status: '',
        nationality: '',
        photo_url: '',
        address: { street: '', city: '', state: '', zip_code: '', country: '' },
        employment_details: { 
            employee_type: '', department: '', job_title: '', job_role: '', grade: '', work_location: '', 
            joining_date: '', termination_date: '', manager_id: '', 
            team: [{ team_id: '', team_name: '' }],  // Initialize team as an array with a default object
            status: '' 
        },
        salary_details: { 
            base_salary: '', bonus: '', overtime_rate: '', commission: '', 
            tax_deductions: { tax_code: '', tax_amount: '' }, 
            benefits: { 
                health_insurance: false, life_insurance: false, retirement_fund: '', 
                stock_options: false, 
                paid_time_off: { total_days: '', days_used: '' } 
            } 
        },
        documents: { 
            id_proof: '', resume: '', offer_letter: '', contract_letter: '', 
            other_documents: [{ document_name: '', document_url: '' }] // Initialize other_documents as an array
        },
        emergency_contact: { name: '', relationship: '', phone_number: '', email: '' },
        access_control: { role: '', permissions: { can_edit_profile: false, can_approve_leaves: false, can_view_salary: false, can_view_documents: false } },
        audit_logs: []
    });
    // File upload handler
    const fileHandler = (e) => {
        const file = e.target.files[0];
        setImageUrl(URL.createObjectURL(file)); // Preview URL
        setEmployee((prevEmployee) => ({
            ...prevEmployee,
            photo_url: file // File to be uploaded
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee({ ...employee, [name]: value });
    };

    

    useEffect(() => {
        if (validUser) {
            axios.get(`${process.env.BACKEND_URI}&/employee/employees-list?email=${validUser}&simple=true`)
                .then((res) => {
                    setEmployees(res.data);
                    console.log('Fetched employees:', res.data);
                })
                .catch((err) => console.error('Error fetching employees:', err));
        } else {
            console.warn('No valid user email found in local storage.');
        }
    }, [validUser]);

    const handleNext = () => setStep((prevStep) => prevStep + 1);
    const handleBack = () => setStep((prevStep) => prevStep - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Employee Data:', employee);

        const confirmed = window.confirm("Are you sure you want to add employee?");
        if (confirmed) {
            const formData = new FormData();
            formData.append('employee', JSON.stringify(employee));
            formData.append('profile-pic', employee.photo_url); // Attach file

            axios.post(`${process.env.BACKEND_URI}&/employee/add-employee`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((res) => {
                    console.log('Response from server:', res.data);
                    toast.success(res.data.message);
                })
                .catch((err) => {
                    console.error('Error:', err.response ? err.response.data : err.message);
                    toast.error(err.response.data.error);
                });
        }
    };



    return (
        <div className="add-employee-container">
            <h2 className="form-title">Add Employee</h2>

            {/* Step Headers */}
            <div className="step-header">
                <button className={`step-tab ${step === 1 ? 'active' : ''}`} onClick={() => setStep(1)}>
                    Basic Information
                </button>
                <button className={`step-tab ${step === 2 ? 'active' : ''}`} onClick={() => setStep(2)}>
                    Address Information
                </button>
                <button className={`step-tab ${step === 3 ? 'active' : ''}`} onClick={() => setStep(3)}>
                    Employment Details
                </button>
                <button className={`step-tab ${step === 4 ? 'active' : ''}`} onClick={() => setStep(4)}>
                    Emergency Contact
                </button>
                <button className={`step-tab ${step === 5 ? 'active' : ''}`} onClick={() => setStep(5)}>
                    Documents
                </button>
                <button className={`step-tab ${step === 6 ? 'active' : ''}`} onClick={() => setStep(6)}>
                    Salary Details
                </button>
            </div>

            <form className="add-employee-form" onSubmit={handleSubmit}>
                {/* Step 1: Basic Information */}
                {step === 1 && (
                    <div className="form-section">

                        <div className='form-fields'>
                        
                            <label className="form-label">
                                Nationality:
                                <select
                                    name="nationality"
                                    value={employee.nationality}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Indian">Indian</option>

                                    <option value="Other">Other</option>
                                </select>
                            </label>
                            
                            
                            <label className="form-label" style={{display:'flex', flexDirection:'row', overflow:'hidden'}}>
                                <div>
                                Profiel Image:
                                <input className="form-input" type="file" name="profile-pic" onChange={fileHandler} required /></div>
                                {imageUrl && <img src={imageUrl} alt="Profile Preview" className='profile-img-preview' />}
                            </label>
                            
                            
                            
                        </div>
                        <div className='form-fields'>
                            <label className="form-label">
                                First Name:
                                <input className="form-input" type="text" name="first_name" value={employee.first_name} onChange={handleChange} required />
                            </label>
                            <label className="form-label">
                                Last Name:
                                <input className="form-input" type="text" name="last_name" value={employee.last_name} onChange={handleChange} required />
                            </label>
                        </div>
                        <div className='form-fields'>
                            <label className="form-label">
                                Personal Email:
                                <input className="form-input" type="email" name="personalEmail" value={employee.personalEmail} onChange={handleChange} required />
                            </label>
                            <label className="form-label">
                                Phone Number:
                                <input className="form-input" type="tel" name="phone_number" value={employee.phone_number} onChange={handleChange} required />
                            </label>
                        </div>
                        <div className='form-fields'>
                            <label className="form-label">
                                Date of Birth:
                                <input className="form-input" type="date" name="date_of_birth" value={employee.date_of_birth} onChange={handleChange} required />
                            </label>
                            <label className="form-label">
                                Gender:
                                <select
                                    name="gender"
                                    value={employee.gender}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 2: Address Information */}
                {step === 2 && (
                    <div className="form-section">
                        <div className='form-fields'>
                            <label className="form-label">
                                Street:
                                <input className="form-input" type="text" name="street" value={employee.street} onChange={handleChange} />
                            </label>
                            <label className="form-label">
                                City:
                                <input className="form-input" type="text" name="city" value={employee.city} onChange={handleChange} />
                            </label>
                        </div>

                        <div className='form-fields'>
                            <label className="form-label">
                                State:
                                <input className="form-input" type="text" name="state" value={employee.state} onChange={handleChange} />
                            </label>
                            <label className="form-label">
                                Pin Code:
                                <input className="form-input" type="text" name="zip_code" value={employee.zip_code} onChange={handleChange} />
                            </label>
                        </div>

                        <div className='form-fields'>
                            <label className="form-label">
                                Country:
                                <input className="form-input" type="text" name="country" value={employee.country} onChange={handleChange} />
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 3: Employment Details */}
                {step === 3 && (
                    <div className="form-section">

                        <div className='form-fields'>
                            <label className="form-label">
                                Employee Type:
                                <input className="form-input" type="text" name="employee_type" value={employee.employee_type} onChange={handleChange} />
                            </label>
                            <label className="form-label">
                                Department:
                                <input className="form-input" type="text" name="department" value={employee.department} onChange={handleChange} />
                            </label>

                        </div>

                        <div className='form-fields'>
                            <label className="form-label">
                                Job Title:
                                <input className="form-input" type="text" name="job_title" value={employee.job_title} onChange={handleChange} />
                            </label>
                            <label className="form-label">
                                Job Role:
                                <input className="form-input" type="text" name="job_role" value={employee.job_role} onChange={handleChange} />
                            </label>
                        </div>

                        <div className='form-fields'>
                            <label className="form-label">
                                Work Location:
                                <input className="form-input" type="text" name="work_location" value={employee.work_location} onChange={handleChange} />
                            </label>
                            <label className="form-label">
                                Joining Date:
                                <input className="form-input" type="date" name="joining_date" value={employee.joining_date} onChange={handleChange} />
                            </label>
                        </div>
                        <div className='form-fields'>

                        <label className="form-label">
                            Reporting Manager:
                            <select
                                name="reporting_manager"
                                
                        
                                className="form-input"
                            >
                                <option value="">Select Reporting Manager</option>
                                {employees.map((emp) => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.first_name} {emp.last_name} - {emp.employee_id}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="form-label" >
                                Employee ID:
                                <input className="form-input" type="text" name="employee_id" value={employee.employee_id} onChange={handleChange} required />
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 4: Emergency Contact */}
                 {step === 4 && (
                    <div className="form-section">
                        <div className='form-fields'>
                            <label className="form-label">
                                Name:
                                <input className="form-input" type="text" name="emergency_contact_name" value={employee.emergency_contact_name} onChange={handleChange} />
                            </label>
                            <label className="form-label">
                                Relationship:
                                <input className="form-input" type="text" name="emergency_contact_relationship" value={employee.emergency_contact_relationship} onChange={handleChange} />
                            </label>
                        </div>

                        <div className='form-fields'>
                            <label className="form-label">
                                Phone Number:
                                <input className="form-input" type="tel" name="emergency_contact_phone" value={employee.emergency_contact_phone} onChange={handleChange} />
                            </label>
                            <label className="form-label">
                                Email:
                                <input className="form-input" type="email" name="emergency_contact_email" value={employee.emergency_contact_email} onChange={handleChange} />
                            </label>
                        </div>
                    </div>
                )} 

                {/* Step 5: Documents */}
                {step === 5 && (
                    <div className="form-section">
                        <div className="form-fields">
                            <label className="form-label">
                                ID Proof:
                                <input type="file" className="form-input" name="id_proof" onChange={fileHandler} />
                            </label>
                            <label className="form-label">
                                Resume:
                                <input type="file" className="form-input" name="resume" onChange={fileHandler} />
                            </label>
                        </div>
                        <div className="form-fields">
                            <label className="form-label">
                                Offer Letter:
                                <input type="file" className="form-input" name="offer_letter" onChange={fileHandler} />
                            </label>
                            <label className="form-label">
                                Contract Letter:
                                <input type="file" className="form-input" name="contract_letter" onChange={fileHandler} />
                            </label>
                        </div>
                        
                    </div>
                )}

                {/* Step 6: Salary Details */}
                {step === 6 && (
                    <div className="form-section">
                        <div className="form-fields">
                            <label className="form-label">
                                Base Salary:
                                <input type="number" name="base_salary" value={employee.salary_details.base_salary} onChange={handleChange} className="form-input" />
                            </label>
                            <label className="form-label">
                                Bonus:
                                <input type="number" name="bonus" value={employee.salary_details.bonus} onChange={handleChange} className="form-input" />
                            </label>
                        </div>
                        
                        
                        <div className="form-fields">
                            <label className="form-label">
                                Health Insurance:
                                <input type="checkbox" name="health_insurance" checked={employee.salary_details.benefits.health_insurance} onChange={(e) => setEmployee({ ...employee, salary_details: { ...employee.salary_details, benefits: { ...employee.salary_details.benefits, health_insurance: e.target.checked } } })} className="form-input" />
                            </label>
                            <label className="form-label">
                                Life Insurance:
                                <input type="checkbox" name="life_insurance" checked={employee.salary_details.benefits.life_insurance} onChange={(e) => setEmployee({ ...employee, salary_details: { ...employee.salary_details, benefits: { ...employee.salary_details.benefits, life_insurance: e.target.checked } } })} className="form-input" />
                            </label>
                        </div>
                       
                       
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="button-container-wrapper">
                    <div className="button-container">
                        {step > 1 ? (
                            <button type="button" onClick={handleBack} className="back-button">Back</button>
                        ) : (
                            <div className="button-placeholder"></div> // Placeholder to align "Next" on the right in the first step
                        )}
                        {step < 6 && <button type="button" onClick={handleNext} className="next-button">Next</button>}
                        {step === 6 && <button type="submit" className="submit-button">Submit</button>}
                    </div>
                </div>

            </form>
        </div>
    );
};

export default AddEmployee;

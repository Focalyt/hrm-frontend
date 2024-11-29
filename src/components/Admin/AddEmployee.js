import React, { useState, useEffect } from 'react';
import '../../css/addEmployee.css';
import axios from 'axios';
import { toast } from 'react-toastify';




const EmployeeForm = () => {


    const [employees, setEmployees] = useState([]);

    const validUser = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (validUser) {

            axios.get(`https://hrm-back-end.onrender.com/user/employee-list?email=${validUser}&simple=true`, {

                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
            )
                .then((res) => {
                    setEmployees(res.data);
                    
                })
                .catch((err) => console.error('Error fetching employees:', err));
        } else {
            console.warn('No valid user email found in local storage.');
        }
    }, [validUser]);
    const [employee, setEmployee] = useState({
        employee_id: "",
        user_id: "",
        first_name: "",
        last_name: "",
        personalEmail: "",
        designation: "",
        officialEmail: "",
        phone_number: "",
        date_of_birth: "",
        gender: "",
        marital_status: "",
        address: {
            street: "",
            city: "",
            state: "",
            pin_code: "",
            country: ""
        },
        employment_details: {
            department: "",
            designation: "",
            job_role: "",
            work_location: "",
            joining_date: "",
            termination_date: "",
            manager_id: ""
        },
        emergency_contact: {
            emergency_contact_name: "",
            emergency_contact_relationship: "",
            emergency_contact_phone: "",
            emergency_contact_email: ""
        },
        salary_details: {
            base_salary: "",
            benefits: {
                health_insurance: false,
                life_insurance: false,
            },
        },
    });

    const [files, setFiles] = useState({
        profilePic: null,
        aadhaar: null,
        panCard: null,
        resume: null,
        offerLetter: null,
        educationDoccument: null,
    });

    const [imageUrl, setImageUrl] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleNestedChange = (e, parentField) => {
        const { name, value } = e.target;
        setEmployee((prevState) => ({
            ...prevState,
            [parentField]: {
                ...prevState[parentField],
                [name]: value,
            },
        }));
    };
    

    const fileHandler = (e) => {
        const { name } = e.target;
        const file = e.target.files[0]; // Get the selected file

        if (file) {
            setFiles((prevState) => ({
                ...prevState,
                [name]: file, // Dynamically set the file in state
            }));
        }
        if (name === "profilePic" && file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const isConfirmed = window.confirm("Are you sure you want to add the employee?");
        if (!isConfirmed) {
            // If the user cancels, stop the form submission
            return;
        }
        const formData = new FormData();

        // Append text fields
        for (const key in employee) {
            if (typeof employee[key] === "object") {
                for (const subKey in employee[key]) {
                    formData.append(`${key}.${subKey}`, employee[key][subKey]);
                }
            } else {
                formData.append(key, employee[key]);
            }
        }

        // Append file fields
        for (const key in files) {
            if (files[key]) {
                formData.append(key, files[key]);
            }
        }

        try {

            const response = await axios.post(`https://hrm-back-end.onrender.com/user/add-user`, formData, {

                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const uniqueId = response.data._id;
            console.log("Unique ID received:", uniqueId);

            // Append unique ID to formData for the second API call
            formData.append("user_id", uniqueId);

            const addEmployeeResponse = await axios.post(`https://hrm-back-end.onrender.com/employee/add-employee`,

                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",

                    },
                }
            );
            console.log("Form submitted successfully with data:", Object.fromEntries(formData));
            toast.success("Form submitted successfully!"); // Success toast
        } catch (error) {
            const errorMessage =
                error.response?.data?.error || "An error occurred. Please try again.";
            toast.error(`Error: ${errorMessage}`);
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="add-employee-container">
            <div className='top_bar_title'>
                <span className="page-title">Add Employee</span>
                <div className="breadcrumb">
                    <a href="/admin">Home </a>
                    <span className="separator">» </span>
                    <span>Add Employee</span>
                </div>
            </div>



            <form className="add-employee-form" onSubmit={handleSubmit}>

                <div className="form-section">
                    <div className="section-title">Basic Information</div>
                    <div className="form-fields">
                        <label className="form-label" style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
                            <div>
                                Profile Image:
                                <input
                                    className="form-input"
                                    type="file"
                                    name="profilePic"
                                    onChange={fileHandler}
                                    required
                                />
                            </div>
                            {imageUrl && <img src={imageUrl} alt="Profile Preview" className="profile-img-preview" />}
                        </label>
                        <label className="form-label">
                            Personal Email:
                            <input
                                className="form-input"
                                type="email"
                                name="personalEmail"
                                value={employee.personalEmail}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>
                    <div className="form-fields">
                        <label className="form-label">
                            First Name:
                            <input
                                className="form-input"
                                type="text"
                                name="first_name"
                                value={employee.first_name}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label className="form-label">
                            Last Name:
                            <input
                                className="form-input"
                                type="text"
                                name="last_name"
                                value={employee.last_name}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>
                    <div className="form-fields">
                        <label className="form-label">
                            Reporting Manager:
                            <select
                                name="manager_id"
                                className="form-input"
                                value={employee.employment_details.manager_id}
                                onChange={(e) => handleNestedChange(e, "employment_details")}// Update manager_id in state
                            >
                                <option value="">Select Reporting Manager</option>
                                {employees.map((emp) => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.first_name} {emp.last_name} - {emp.employee_id}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="form-label">
                            Phone Number:
                            <input
                                className="form-input"
                                type="tel"
                                name="phone_number"
                                value={employee.phone_number}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>
                    <div className="form-fields">
                        <label className="form-label">
                            Date of Birth:
                            <input
                                className="form-input"
                                type="date"
                                name="date_of_birth"
                                value={employee.date_of_birth}
                                onChange={handleChange}
                                required
                            />
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
                    <div className="form-fields">
                        
                        <label className="form-label">
                            Employee ID
                            <input
                                className="form-input"
                                type="text"
                                name="employee_id"
                                value={employee.employee_id}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>
                </div>

                {/* Step 2: Address Information */}
                <div className="form-section">
                    <div className="section-title">Address Information</div>
                    <div className="form-fields">
                        <label className="form-label">
                            Street:
                            <input
                                className="form-input"
                                type="text"
                                name="street"
                                value={employee.address.street}
                                onChange={(e) => handleNestedChange(e, "address")}
                            />
                        </label>
                        <label className="form-label">
                            City:
                            <input
                                className="form-input"
                                type="text"
                                name="city"
                                value={employee.address.city}
                                onChange={(e) => handleNestedChange(e, "address")}
                            />
                        </label>
                    </div>
                    <div className="form-fields">
                        <label className="form-label">
                            State:
                            <input
                                className="form-input"
                                type="text"
                                name="state"
                                value={employee.address.state}
                                onChange={(e) => handleNestedChange(e, "address")}
                            />
                        </label>
                        <label className="form-label">
                            Pin Code:
                            <input
                                className="form-input"
                                type="text"
                                name="pin_code"
                                value={employee.address.pin_code}
                                onChange={(e) => handleNestedChange(e, "address")}
                            />
                        </label>
                    </div>
                    <div className="form-fields">
                        <label className="form-label">
                            Country:
                            <input
                                className="form-input"
                                type="text"
                                name="country"
                                value={employee.address.country}
                                onChange={(e) => handleNestedChange(e, "address")}
                            />
                        </label>
                    </div>
                </div>

                {/* Step 3: Employment Details */}
                <div className="form-section">
                    <div className="section-title">Employment Details</div>
                    <div className="form-fields">
                        <label className="form-label">
                            Department:
                            <input
                                className="form-input"
                                type="text"
                                name="department"
                                value={employee.employment_details.department}
                                onChange={(e) => handleNestedChange(e, "employment_details")}
                            />
                        </label>
                        <label className="form-label">
                            Designation:
                            <input
                                className="form-input"
                                type="text"
                                name="designation"
                                value={employee.designation}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div className="form-fields">
                        <label className="form-label">
                            Job Role:
                            <input
                                className="form-input"
                                type="text"
                                name="job_role"
                                value={employee.employment_details.job_role}
                                onChange={(e) => handleNestedChange(e, "employment_details")}
                            />
                        </label>
                        <label className="form-label">
                            Work Location:
                            <input
                                className="form-input"
                                type="text"
                                name="work_location"
                                value={employee.employment_details.work_location}
                                onChange={(e) => handleNestedChange(e, "employment_details")}
                            />
                        </label>
                    </div>
                    <div className="form-fields">
                        <label className="form-label">
                            Joining Date:
                            <input
                                className="form-input"
                                type="date"
                                name="joining_date"
                                value={employee.employment_details.joining_date}
                                onChange={(e) => handleNestedChange(e, "employment_details")}
                            />
                        </label>
                        <label className="form-label">
                            Official Email:
                            <input
                                className="form-input"
                                type="email"
                                name="officialEmail"
                                value={employee.officialEmail}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>



                </div>

                {/* Step 4: Emergency Contact */}
                <div className="form-section">
                    <div className="section-title">Emergency Contact</div>
                    <div className="form-fields">
                        <label className="form-label">
                            Name:
                            <input
                                className="form-input"
                                type="text"
                                name="emergency_contact_name"
                                value={employee.emergency_contact.emergency_contact_name}
                                onChange={(e) => handleNestedChange(e, "emergency_contact")}
                            />
                        </label>
                        <label className="form-label">
                            Relationship:
                            <input
                                className="form-input"
                                type="text"
                                name="relationship"
                                value={employee.emergency_contact.emergency_contact_relationship}
                                onChange={(e) => handleNestedChange(e, "emergency_contact")}
                            />
                        </label>
                    </div>
                    <div className="form-fields">
                        <label className="form-label">
                            Phone Number:
                            <input
                                className="form-input"
                                type="tel"
                                name="emergency_contact_phone"
                                value={employee.emergency_contact.emergency_contact_phone}
                                onChange={(e) => handleNestedChange(e, "emergency_contact")}
                            />
                        </label>
                        <label className="form-label">
                            Email:
                            <input
                                className="form-input"
                                type="email"
                                name="emergency_contact_email"
                                value={employee.emergency_contact.emergency_contact_email}
                                onChange={(e) => handleNestedChange(e, "emergency_contact")}
                            />
                        </label>
                    </div>
                </div>

                {/* Step 5: Documents */}
                <div className="form-section">
                    <div className="section-title">Documents</div>
                    <div className="form-fields">
                        <label className="form-label">
                            Aadhaar:
                            <input type="file" className="form-input" name="aadhaar" onChange={fileHandler} />
                        </label>
                        <label className="form-label">
                            PAN Card:
                            <input type="file" className="form-input" name="panCard" onChange={fileHandler} />
                        </label>
                    </div>
                    <div className="form-fields">
                        <label className="form-label">
                            Resume:
                            <input type="file" className="form-input" name="resume" onChange={fileHandler} />
                        </label>
                        <label className="form-label">
                            Offer Letter:
                            <input type="file" className="form-input" name="offerLetter" onChange={fileHandler} />
                        </label>
                    </div>
                    <div className="form-fields">
                        <label className="form-label">
                            Education Documents
                            <input type="file" className="form-input" name="educationDoccument" onChange={fileHandler} />
                        </label>
                        
                    </div>
                </div>


                {/* Step 6: Salary Details */}

                <div className="form-section">
                    <div className="section-title">Salary Details</div>
                    <div className="form-fields">
                        <label className="form-label">
                            Base Salary:
                            <input type="number" name="base_salary" value={employee.salary_details.base_salary} onChange={(e) => handleNestedChange(e, "salary_details")} className="form-input" />
                        </label>
                        <label className="form-label">
                            Bonus:
                            <input type="number" name="bonus" value={employee.salary_details.bonus} onChange={(e) => handleNestedChange(e, "salary_details")} className="form-input" />
                        </label>
                    </div>



                </div>


                {/* Navigation Buttons */}
                <div className='button-container'>
                    <button type="submit" className="submit-button">Submit</button>
                    <button className="submit-button">Reset</button>
                </div>


            </form>
        </div>
    );
};

export default EmployeeForm;


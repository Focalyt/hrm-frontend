import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import '../../css/Employee/attendance.css';


function Attendance() {

    const employeeID = localStorage.getItem('employeeID');
    const token = localStorage.getItem('token');

    const [punchInTime, setPunchInTime] = useState(null);
    const [punchOutTime, setPunchOutTime] = useState(null);
    const [filterStatus, setFilterStatus] = useState("All");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const recordsPerPage = 10; // Records per page

    useEffect(() => {
        fetchTodayAttendance();
        fetchAttendanceRecords();
    }, [currentPage, fromDate, toDate, filterStatus]);

    // Fetch today's attendance
    const fetchTodayAttendance = () => {
        const today = new Date().toISOString().split("T")[0];

        axios
            .get(
                `https://hrm-back-end.onrender.com/employee/employee-attendance?employeeId=${employeeID}&from=${today}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                if (res.data.attendance[0] && res.data.attendance[0].checkInTime) {
                    setPunchInTime(res.data.attendance[0].checkInTime);
                    setPunchOutTime(res.data.attendance[0].checkOutTime);
                } else {
                    setPunchInTime(null);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching today's attendance:", err);
                setLoading(false);
            });
    };

    // Fetch attendance records with pagination
    const fetchAttendanceRecords = () => {
        setLoading(true);

        const queryParams = new URLSearchParams({
            employeeId: employeeID,
            status: filterStatus === "All" ? "" : filterStatus,
            ...(fromDate && { from: fromDate }),
            ...(toDate && { to: toDate }),
            page: currentPage,
            limit: recordsPerPage,
        }).toString();

        axios
            .get(`https://hrm-back-end.onrender.com/employee/employee-attendance?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (res.data && res.data.attendance && res.data.attendance.length > 0) {
                    setAttendanceRecords(res.data.attendance);
                    setTotalRecords(res.data.totalRecords || 0); // Total records for pagination
                } else {
                    setAttendanceRecords([]);
                    setTotalRecords(0);
                }
            })
            .catch((err) => {
                console.error("Error fetching attendance records:", err);
                setAttendanceRecords([]);
                setTotalRecords(0);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Pagination Handlers
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(totalRecords / recordsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    }; 
    



    const markInTime = () => {


        axios.post(`https://hrm-back-end.onrender.com/employee/employee-attendance`, {}, {

            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                // const isoTime = res.data.employeeAttendance.checkInTime;

                // const formatToIST = (isoString) => {
                //     const utcDate = new Date(isoString); // Parse UTC time
                //     const istDate = new Date(utcDate.getTime()); // Add IST offset                
                //     // Extract IST hours, minutes, seconds
                //     let hours = istDate.getUTCHours(); // Use UTC-based methods
                //     const minutes = istDate.getUTCMinutes().toString().padStart(2, "0");
                //     const seconds = istDate.getUTCSeconds().toString().padStart(2, "0");
                //     const ampm = hours >= 12 ? "PM" : "AM";
                //     hours = hours % 12 || 12; // Convert to 12-hour format

                //     return `${hours}:${minutes}:${seconds} ${ampm}`;
                // };
                window.location.reload();



            })
            .catch((err) => console.error('Error marking attendance:', err));

    };
    const markOutTime = () => {
        const currentTime = new Date().toISOString(); // Current time in ISO format
        console.log(currentTime)

        axios.patch(`https://hrm-back-end.onrender.com/employee/employee-attendance?employeeId=${employeeID}`, { checkOutTime: currentTime }, {

            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                // console.log(res)
                // const isoTime = res.data.attendance.checkOutTime;


                // const formatToIST = (isoString) => {
                //     const utcDate = new Date(isoString); // Parse UTC time
                //     const istDate = new Date(utcDate.getTime()); // Add IST offset                
                //     // Extract IST hours, minutes, seconds
                //     let hours = istDate.getUTCHours(); // Use UTC-based methods
                //     const minutes = istDate.getUTCMinutes().toString().padStart(2, "0");
                //     const seconds = istDate.getUTCSeconds().toString().padStart(2, "0");
                //     const ampm = hours >= 12 ? "PM" : "AM";
                //     hours = hours % 12 || 12; // Convert to 12-hour format

                //     return `${hours}:${minutes}:${seconds} ${ampm}`;
                // };
                window.location.reload();
            })
            .catch((err) => console.error('Error marking attendance:', err));

    };




    
    const formatToIST = (isoString) => {
        const utcDate = new Date(isoString); // Parse UTC time
        const istDate = new Date(utcDate.getTime()); // Use directly if already IST

        // Extract hours, minutes, seconds
        let hours = utcDate.getHours(); // Local time
        const minutes = utcDate.getMinutes().toString().padStart(2, "0");
        const seconds = utcDate.getSeconds().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // Convert to 12-hour format

        return `${hours}:${minutes}:${seconds} ${ampm}`;
    };

    const convertToIST = (utcString) => {
        const utcDate = new Date(utcString);
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(utcDate.getTime() + istOffset);

        const year = istDate.getFullYear();
        const month = (istDate.getMonth() + 1).toString().padStart(2, "0");
        const date = istDate.getDate().toString().padStart(2, "0");
        const hours = istDate.getHours().toString().padStart(2, "0");
        const minutes = istDate.getMinutes().toString().padStart(2, "0");
        const seconds = istDate.getSeconds().toString().padStart(2, "0");
        const milliseconds = istDate.getMilliseconds().toString().padStart(3, "0");

        const istOffsetString = "+05:30";

        return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}.${milliseconds}${istOffsetString}`;
    };

    return (
        <div className="employee-list-container">
            <div className='today-attendace-container'>
                <div>
                    <h2 className="employee-list-title">Today's Attendance</h2>

                </div>
                <div className='punch-time'>
                    {/* <div className='punch-lable'>

                        <span>Punch in Time:</span>
                        <span>Punch Out Time:</span>

                    </div> */}
                    <div className='punch-button'>
                        {punchInTime ? (
                            <span className="punch-time-display">
                                In Time: {formatToIST(punchInTime)}
                            </span>
                        ) : (
                            <button className='punch-in' onClick={markInTime}>Mark In Now</button>
                        )}
                        {punchOutTime ? (
                            <span className="punch-time-display">
                                Out Time: {formatToIST(punchOutTime)}
                            </span>
                        ) :
                            <button className='punch-out' onClick={markOutTime}>Mark Out Now</button>}
                    </div>

                </div>
            </div>

            <div className='date-filter-label-container'>
                <label className="date-filter-label">
                    From:
                    <input
                        className="form-input"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </label>
                <label className="date-filter-label">
                    To:
                    <input
                        className="form-input"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}

                    />
                </label>
                <div class="filter-item status-btn">
                    <label for="status">Status:</label>
                    <select
                        id="status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                    </select>

                </div>
                {/* <div class="filter-item">
                    <button onclick="applyFilters()">Apply Filters</button>
                </div> */}
            </div>
            {/* Pagination Section */}
          <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Prev
                </button>
                <span>
                    Page {currentPage} of {Math.ceil(totalRecords / recordsPerPage)}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === Math.ceil(totalRecords / recordsPerPage)}
                >
                    Next
                </button>
            </div>
            <h2 className="employee-list-title">Attendace Records</h2>
            
            {loading ? (
                <p>Loading attendance records...</p>
            ) : attendanceRecords.length > 0 ? (

                <table className="employee-table">
                    <thead>
                        <tr className='header-tr'>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Punch In Time</th>
                            <th>Punch Out Time</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceRecords.map((record, index) => (



                            <tr key={index} >
                                <td>{record.date ? record.date.split("T")[0] : "Not Available"}</td>
                                <td>{record.status || "-"}</td>
                                <td>{record.checkInTime ? formatToIST(record.checkInTime) : "-"}</td>

                                <td>{record.checkOutTime ? formatToIST(record.checkOutTime) : "-"}</td>
                                <td>
                                    Raise Request
                                </td>


                            </tr>))}

                    </tbody>
                </table>) : (
                <p>No attendance records found.</p>
            )}
            
          {/* Pagination Section */}
          <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Prev
                </button>
                <span>
                    Page {currentPage} of {Math.ceil(totalRecords / recordsPerPage)}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === Math.ceil(totalRecords / recordsPerPage)}
                >
                    Next
                </button>
            </div>

        </div>
    )
}

export default Attendance
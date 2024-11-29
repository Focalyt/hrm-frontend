import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Import XLSX library
import "../../css/Admin/attendance.css";

function EmployeeAttendance() {
    const token = localStorage.getItem("token");

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Default to today
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortOrder, setSortOrder] = useState("asc");
    const [filterStatus, setFilterStatus] = useState("All"); // Status filter

    const recordsPerPage = 10;

    // Save data to sessionStorage
    const saveToSessionStorage = (key, data) => {
        sessionStorage.setItem(key, JSON.stringify(data));
    };

    // Fetch data from sessionStorage
    const fetchFromSessionStorage = (key) => {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    };

    // Fetch attendance data
    const fetchAttendanceData = useCallback(() => {
        setLoading(true);

        const queryParams = new URLSearchParams({
            from: selectedDate,
            to: selectedDate,
            status: filterStatus === "All" ? "" : filterStatus, // Filter by status
            page: currentPage,
            limit: recordsPerPage,
            sortBy: "date",
            sortOrder: sortOrder,
        }).toString();

        const cacheKey = `attendance_all_${selectedDate}_${filterStatus}_${currentPage}`;

        // Try fetching from sessionStorage
        const cachedData = fetchFromSessionStorage(cacheKey);

        if (cachedData) {
            console.log("Loaded data from sessionStorage:", cachedData);

            setAttendanceRecords(cachedData.records || []);
            setTotalRecords(cachedData.totalRecords || 0);
            setLoading(false);
        } else {
            // Fetch from API
            axios
                .get(`https://hrm-back-end.onrender.com/employee/employee-attendance?${queryParams}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    const records = res.data.attendance || [];
                    setAttendanceRecords(records);
                    setTotalRecords(res.data.totalRecords || 0);
                    saveToSessionStorage(cacheKey, {
                        records,
                        totalRecords: res.data.totalRecords,
                    });
                })
                .catch((err) => {
                    console.error("Error fetching attendance data:", err);
                    setAttendanceRecords([]);
                    setTotalRecords(0);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [token, selectedDate, filterStatus, currentPage, recordsPerPage, sortOrder]);

    // Fetch attendance records on component mount and when filters change
    useEffect(() => {
        fetchAttendanceData();
    }, [fetchAttendanceData]);

    const handlePrevPage = useCallback(() => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    }, [currentPage]);

    const handleNextPage = useCallback(() => {
        if (currentPage < Math.ceil(totalRecords / recordsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    }, [currentPage, totalRecords, recordsPerPage]);

    const handleSortByDate = () => {
        const sortedRecords = [...attendanceRecords].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

        setAttendanceRecords(sortedRecords);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Toggle sort order
    };

    const handlePrevDate = () => {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 1); // Go back one day
        setSelectedDate(prevDate.toISOString().split("T")[0]);
        setCurrentPage(1); // Reset to page 1
    };

    const handleNextDate = () => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1); // Go forward one day
        setSelectedDate(nextDate.toISOString().split("T")[0]);
        setCurrentPage(1); // Reset to page 1
    };

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value); // Update status filter
        setCurrentPage(1); // Reset to page 1
    };

    const formatToIST = (isoString) => {
        const utcDate = new Date(isoString);
        const hours = utcDate.getHours();
        const minutes = utcDate.getMinutes().toString().padStart(2, "0");
        const seconds = utcDate.getSeconds().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const istHours = hours % 12 || 12;

        return `${istHours}:${minutes}:${seconds} ${ampm}`;
    };

    const downloadExcel = () => {
        // Preprocess data to include only specific fields
        const processedData = attendanceRecords.map((record) => ({
            EmployeeFirstName: `${record.first_name} ${record.last_name}` || "Unknown",
            Status: record.status,
            TravelingStatus: record.travelingStatus || "-",
            WorkingLocation: record.workLocation || "-",
            PunchInTime: record.checkInTime
                ? formatToIST(record.checkInTime)
                : "-",
            PunchOutTime: record.checkOutTime
                ? formatToIST(record.checkOutTime)
                : "-",
        }));
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        XLSX.writeFile(workbook, `Attendance_${selectedDate}.xlsx`);
    };

    return (
        <div className="employee-list-container">
            <div className="header-container">
                <div className="download-button-div">
                    <button className="download-button" onClick={downloadExcel}><i className="fa-solid fa-download"></i>
                    </button></div>
                <div className="date-navigation">
                    <button className="prev-date-btn" onClick={handlePrevDate}>
                        Previous
                    </button>
                    <span className="selected-date">{selectedDate}</span>
                    <button className="next-date-btn" onClick={handleNextDate}>
                        Next
                    </button>
                </div>

                <div className="filter-item status-btn">
                    <label htmlFor="status">Status:</label>
                    <select
                        id="status"
                        value={filterStatus}
                        onChange={handleFilterChange}
                    >
                        <option value="All">All</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                    </select>
                </div>
            </div>

            <h2 className="employee-list-title">Attendance Records</h2>
            {loading ? (
                <p>Loading attendance records...</p>
            ) : attendanceRecords.length > 0 ? (
                <div className="employee-attendance-table">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th onClick={handleSortByDate} style={{ cursor: "pointer" }}>
                                    Employee Name
                                </th>
                                <th>Status</th>
                                <th>Traveling Status</th>
                                <th>Working Location</th>
                                <th>Punch In</th>
                                <th>Punch Out</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRecords.map((record, index) => (
                                <tr key={index}>
                                    <td>{`${record.first_name} ${record.last_name}` || "Unknown"}</td>
                                    <td>{record.status}</td>
                                    <td>{record.travelingStatus || "-"}</td>
                                    <td>{record.workLocation || "-"}</td>
                                    <td>{record.checkInTime ? formatToIST(record.checkInTime) : "-"}</td>
                                    <td>{record.checkOutTime ? formatToIST(record.checkOutTime) : "-"}</td>
                                    <td>Raise Request</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No attendance records found for {selectedDate}.</p>
            )}

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
    );
}

export default EmployeeAttendance;

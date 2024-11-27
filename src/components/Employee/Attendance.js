import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../../css/Employee/attendance.css";

function Attendance() {
  const employeeID = localStorage.getItem("employeeID");
  const token = localStorage.getItem("token");

  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
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
  const fetchAttendanceData = useCallback(
    (isToday = false) => {
      setLoading(true);

      // If fetching today's attendance, add today's date filter
      const queryParams = new URLSearchParams({
        employeeId: employeeID,
        ...(isToday
          ? { from: new Date().toISOString().split("T")[0] }
          : {
            status: filterStatus === "All" ? "" : filterStatus,
            ...(fromDate && { from: fromDate }),
            ...(toDate && { to: toDate }),
            page: currentPage,
            limit: recordsPerPage,
          }),
      }).toString();

      const cacheKey = isToday
        ? `today_attendance_${employeeID}`
        : `attendance_${employeeID}_${filterStatus}_${fromDate}_${toDate}_${currentPage}`;

      // Try fetching from sessionStorage
      const cachedData = fetchFromSessionStorage(cacheKey);

      if (cachedData) {
        console.log("Loaded data from sessionStorage:", cachedData);
        if (isToday) {
          setPunchInTime(cachedData.punchInTime || null);
          setPunchOutTime(cachedData.punchOutTime || null);
        } else {
          setAttendanceRecords(cachedData.records || []);
          setTotalRecords(cachedData.totalRecords || 0);
        }
        setLoading(false);
      } else {
        // If no cache, fetch from API
        axios
          .get(
            `https://hrm-back-end.onrender.com/employee/employee-attendance?${queryParams}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((res) => {
            if (isToday) {
              // Handle today's attendance
              const data = res.data.attendance[0] || {};
              setPunchInTime(data.checkInTime || null);
              setPunchOutTime(data.checkOutTime || null);
              saveToSessionStorage(cacheKey, {
                punchInTime: data.checkInTime,
                punchOutTime: data.checkOutTime,
              });
            } else {
              // Handle attendance records
              const records = res.data.attendance || [];
              setAttendanceRecords(records);
              setTotalRecords(res.data.totalRecords || 0);
              saveToSessionStorage(cacheKey, {
                records,
                totalRecords: res.data.totalRecords,
              });
            }
          })
          .catch((err) => {
            console.error("Error fetching attendance data:", err);
            if (!isToday) {
              setAttendanceRecords([]);
              setTotalRecords(0);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [employeeID, token, filterStatus, fromDate, toDate, currentPage, recordsPerPage]
  );

  // Fetch today's attendance on component mount
  useEffect(() => {
    fetchAttendanceData(true); // Fetch today's attendance
  }, [fetchAttendanceData]);

  // Fetch attendance records when filters or pagination change
  useEffect(() => {
    fetchAttendanceData(false); // Fetch filtered attendance
  }, [fetchAttendanceData]);



  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleDateChange = (type, value) => {
    if (type === "from") setFromDate(value);
    if (type === "to") setToDate(value);
    setCurrentPage(1); // Reset to page 1 when date changes
  };

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < Math.ceil(totalRecords / recordsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalRecords, recordsPerPage]);

  const formatToIST = (isoString) => {
    const utcDate = new Date(isoString);
    const hours = utcDate.getHours();
    const minutes = utcDate.getMinutes().toString().padStart(2, "0");
    const seconds = utcDate.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const istHours = hours % 12 || 12;

    return `${istHours}:${minutes}:${seconds} ${ampm}`;
  };

  const markAttendance = (type) => {
    let requestConfig;

    if (type === "in") {
      const currentTime = new Date().toISOString();
      requestConfig = {
        method: "patch",
        url: `https://hrm-back-end.onrender.com/employee/employee-attendance?employeeId=${employeeID}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          checkInTime: currentTime,
          status: "Present",
        },
      };
    } else if (type === "out") {
      const currentTime = new Date().toISOString();
      requestConfig = {
        method: "patch",
        url: `https://hrm-back-end.onrender.com/employee/employee-attendance?employeeId=${employeeID}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          checkOutTime: currentTime,
        },
      };
    } else {
      console.error("Invalid type for marking attendance.");
      return;
    }

    axios(requestConfig)
      .then((res) => {
        const updatedData = res.data.attendance;
        console.log(`Attendance ${type === "in" ? "in" : "out"} marked successfully.`);

        // Update session storage for attendance records
        const cacheKey = `attendance_${employeeID}_${filterStatus}_${fromDate}_${toDate}_${currentPage}`;
        const sessionData = fetchFromSessionStorage(cacheKey) || { records: [], totalRecords: 0 };

        if (type === "in") {
          // Update punch-in time in session
          sessionData.records = sessionData.records.map((record) =>
            record.date === updatedData.date
              ? { ...record, checkInTime: updatedData.checkInTime, status: "Present" }
              : record
          );
        } else if (type === "out") {
          // Update punch-out time in session
          sessionData.records = sessionData.records.map((record) =>
            record.date === updatedData.date
              ? { ...record, checkOutTime: updatedData.checkOutTime }
              : record
          );
        }

        saveToSessionStorage(cacheKey, sessionData);

        // Update table data state
        setAttendanceRecords(sessionData.records);
        setPunchInTime(updatedData.checkInTime || punchInTime);
        setPunchOutTime(updatedData.checkOutTime || punchOutTime);
      })
      .catch((err) => {
        console.error(`Error marking attendance (${type}):`, err);
      });
  };


  const markInTime = () => markAttendance("in");
  const markOutTime = () => markAttendance("out");

  return (
    <div className="employee-list-container">
      <div className="today-attendace-container">
        <h2 className="employee-list-title">Today's Attendance</h2>
        <div className="punch-time">
          <div className="punch-button">
            {punchInTime ? (
              <span className="punch-time-display">
                In Time: {formatToIST(punchInTime)}
              </span>
            ) : (
              <button className="punch-in" onClick={markInTime}>
                Mark In Now
              </button>
            )}
            {punchOutTime ? (
              <span className="punch-time-display">
                Out Time: {formatToIST(punchOutTime)}
              </span>
            ) : (
              <button className="punch-out" onClick={markOutTime}>
                Mark Out Now
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="date-filter-label-container">
        <label className="date-filter-label">
          From:
          <input
            className="form-input"
            type="date"
            value={fromDate}
            onChange={(e) => handleDateChange("to", e.target.value)}
          />
        </label>
        <label className="date-filter-label">
          To:
          <input
            className="form-input"
            type="date"
            value={toDate}
            onChange={(e) => handleDateChange("to", e.target.value)}
          />
        </label>
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
        <table className="employee-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.date.split("T")[0]}</td>
                <td>{record.status}</td>
                <td>
                  {record.checkInTime ? formatToIST(record.checkInTime) : "-"}
                </td>
                <td>
                  {record.checkOutTime ? formatToIST(record.checkOutTime) : "-"}
                </td>
                <td>Raise Request</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No attendance records found.</p>
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

export default Attendance;

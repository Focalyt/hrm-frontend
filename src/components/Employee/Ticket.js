import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../../css/Employee/attendance.css";
import { CiMenuFries } from "react-icons/ci";

function Ticket() {
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
  const [sortOrder, setSortOrder] = useState("asc");
  const [showPopup, setShowPopup] = useState(false);
  const [isTraveling, setIsTraveling] = useState(null);
  const [travelLocation, setTravelLocation] = useState("");

  // category Dropdown
  const [selectCategory, setSelectCategory] = useState('');
  const [selectSubCategory, setSelectSubCategory] = useState('');

  const category = ['Option 1', 'Option 2', 'Option 3'];
  const subCate = ['Option A', 'Option B', 'Option C'];

  const handleFirstChange = (event) => {
    setSelectCategory(event.target.value);
  };

  const handleSecondChange = (event) => {
    setSelectSubCategory(event.target.value);
  };

// pop function 
const [isFormVisible, setIsFormVisible] = useState(false);
const toggleFormVisibility = () => {
  setIsFormVisible(!isFormVisible);
};

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
            sortBy: "date", // Sort by column
            sortOrder: sortOrder, // Ascending or descending
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
            `${process.env.REACT_APP_BACKEND_URI}/employee/employee-attendance?${queryParams}`,
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
    [employeeID, token, filterStatus, fromDate, toDate, currentPage, recordsPerPage, sortOrder]
  );

  // Fetch today's attendance on component mount
  useEffect(() => {
    fetchAttendanceData(true); // Fetch today's attendance
  }, [fetchAttendanceData]);

  // Fetch attendance records when filters or pagination change
  useEffect(() => {
    fetchAttendanceData(false); // Fetch filtered attendance
  }, [fetchAttendanceData]);

  const handleTravelResponse = (response) => {
    setIsTraveling(response); // Set the response for travel
    if (!response) {
      markInTime(); // Proceed to punch in if not traveling
      setShowPopup(false);
    }
  };
  const showPopUp = (status) => {
    setShowPopup(status);
  }


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
  const handleSortByDate = () => {
    const sortedRecords = [...attendanceRecords].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setAttendanceRecords(sortedRecords);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Toggle sort order
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

  const markAttendance = (type) => {

    const currentTime = new Date().toISOString();
    let requestConfig = {
      method: type === "in" ? "post" : "patch",
      url: type === "in" ? `${process.env.REACT_APP_BACKEND_URI}/employee/employee-attendance` : `${process.env.REACT_APP_BACKEND_URI}/employee/employee-attendance?employeeId=${employeeID}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        ...(type === "in" && { checkInTime: currentTime, status: "Present",...(isTraveling && travelLocation ? {travelingStatus:"Yes", workLocation: travelLocation } : {travelingStatus:"No",workLocation: "Working Location"}), }),
        ...(type === "out" && { checkOutTime: currentTime }),
        employeeId: employeeID,
      },
    };

    axios(requestConfig)
      .then((res) => {
        const updatedData = res.data.attendance;

        console.log(`Attendance ${type === "in" ? "in" : "out"} marked successfully.`);
        sessionStorage.clear();
        console.log(`Session data cleared successfully.`);
        fetchAttendanceData(false);
        fetchAttendanceData(true);

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
        <div className="popUpBtn">
        <button onClick={toggleFormVisibility}> Create Ticket</button>
        {/* {isFormVisible && (<div  >

          <label>
        Category:
        <select value={selectCategory} onChange={handleFirstChange}>
          <option value="" disabled>Select an option</option>
          {category.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
         </label>

      <label>
        Sub Category :
        <select value={selectSubCategory} onChange={handleSecondChange}>
          <option value="" disabled>Select an option</option>
          {subCate.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label> Subject:
      <input type="text" value="" /> 
      </label>

      <label>
        Description:
        <textarea 
          value="" 
          placeholder="Type your message here..." 
          rows="5" 
          cols="30" 
        />
      </label>
        </div>)} */}
       
      {isFormVisible && (
        <div className="modal" onClick={toggleFormVisibility}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={toggleFormVisibility}>&times;</span>
           
           <div className="">
          <div className="cateForm">
            <label>
              Category:
              <select value={selectCategory} onChange={handleFirstChange}>
                <option value="" disabled>Select an option</option>
                {category.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sub Category:
              <select value={selectSubCategory} onChange={handleSecondChange}>
                <option value="" disabled>Select an option</option>
                {subCate.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="cateForm">
            <div className="cateForm1 ">
            <label>
              Subject:
              <input 
                type="text" 
                placeholder="Enter subject" 
              />
            </label>
            </div>
                </div>
                <div className="cateForm">
            <div className="cateForm1 ">
            <label>
              Description:
              <textarea
                placeholder="Type your message here..."
                rows="3"
                cols="60"
              />
            </label>
            </div>
            </div>
            </div>
            <div className="cateBtn">
            <button >Close</button>
              <button >Submit</button>
            </div>
          </div>
        </div>
      )}
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
              <th onClick={handleSortByDate} style={{ cursor: "pointer" }}>Date{sortOrder === "asc" ? "↑" : "↓"}</th>
              <th>Status</th>
              <th className="table-data">Traveling Status</th>
              <th className="table-data">Working Location</th>
              <th className="table-data">Punch In</th>
              <th className="table-data">Punch Out</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.date.split("T")[0]}</td>
                <td>{record.status}</td>
                <td className="table-data">{record.travelingStatus}</td>
                <td className="table-data">{record.workLocation}</td>
                <td className="table-data">
                  {record.checkInTime ? formatToIST(record.checkInTime) : "-"}
                </td>
                <td className="table-data">
                  {record.checkOutTime ? formatToIST(record.checkOutTime) : "-"}
                </td>
                <td>Raise Request</td>
              </tr>
            ))}
          </tbody>
        </table></div>
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

export default Ticket;

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../../css/Employee/attendance.css";
import { CiMenuFries } from "react-icons/ci";

function Ticket() {
  const employeeID = localStorage.getItem("employeeID");
  const token = localStorage.getItem("token");


  const [filterStatus, setFilterStatus] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showPopup, setShowPopup] = useState(false);
  const [isTraveling, setIsTraveling] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [subCategoryId, setSubCategoryId] = useState(null);

  // Fetch all employees
  useEffect(() => {


    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/employee/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    


    fetchCategories();


  }, [token]);
  useEffect(() => {
    if (categoryId) {
      const fetchSubCategories = async () => {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_BACKEND_URI}/employee/categories?categoryId=${categoryId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSubCategories(res.data.category.subCategories || []);
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          setSubCategories([]); // Reset subcategories if an error occurs
        }
      };
      fetchSubCategories();
    } else {
      setSubCategories([]); // Clear subcategories if no category is selected
    }
  }, [categoryId, token]);
  





  // pop function 
  const [isFormVisible, setIsFormVisible] = useState(false);
  const toggleFormVisibility = () => {
    setCategoryId(null);
  setSubCategoryId(null);
    setIsFormVisible(!isFormVisible);
  };

  const recordsPerPage = 10;

  // Save data to sessionStorage
  const saveToSessionStorage = (key, data) => {
    sessionStorage.setItem(key, JSON.stringify(data));
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


  return (
    <div className="employee-list-container">
      <button onClick={toggleFormVisibility}><i className="fa-solid fa-plus"></i> Create Ticket</button>
      {isFormVisible && (
        <div className="modal" onClick={toggleFormVisibility}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="close">
              <h3>Create Ticket</h3>
              <span className="closebtn" onClick={toggleFormVisibility}>&times;</span> </div>

            <div className="ticket-form">


              <div className="cateForm">

                <label>
                  Category:
                  <select value={categoryId|| ""} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="" disabled>Select an option</option>
                    {categories.map((record) => (
                      <option key={record._id} value={record._id}>
                        {record.category_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Sub Category:
                  <select
                    value={subCategoryId|| ""}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                    disabled={!categoryId}
                  >
                    <option value="" disabled>Select an option</option>
                    {subCategories.map((record) => (
                      <option key={record._id} value={record._id}>
                        {record.subCategoryName}
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
                  <label >
                    Description:
                    <textarea
                      placeholder="Type your message here..."
                      rows="3"
                      cols="60"
                      className="Description"
                    />
                  </label>
                </div>
              </div>

            </div>
            <div className="cateBtn">
              <button onClick={toggleFormVisibility} >Close</button>
              <button >Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* 

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

      </div> */}

      <h2 className="employee-list-title">Attendance Records</h2>

    </div>
  );
}

export default Ticket;

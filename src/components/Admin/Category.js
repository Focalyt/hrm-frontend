import React, { useEffect, useCallback, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import '../../css/Admin/category.css';

function Category() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [currentStatus, setCurrentStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRow, setEditingRow] = useState(null);
  const [editingRowData, setEditingRowData] = useState({});
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 4; // Number of records per page
  const token = localStorage.getItem("token");

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URI}/employee/categories?page=${currentPage}&limit=${recordsPerPage}`
        );

        if (res.data) {
          setCategories(Array.isArray(res.data.categories) ? res.data.categories : []);
          setTotalPages(res.data.totalPages || 1);
          setTotalRecords( res.data.totalRecords);
          
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]); // Default to empty on failure
      }
    };

    fetchCategories();
  }, [currentPage, currentStatus, editingRowData, editingRow]);

  // Add a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URI}/employee/categories`,
        { category_name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.category) {
        alert("Category added successfully");
        setNewCategory("");

        // Refetch the categories to refresh the pagination
        const categoryResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URI}/employee/categories?page=${currentPage}&limit=${recordsPerPage}`
        );

        if (categoryResponse.data) {
          setCategories(Array.isArray(categoryResponse.data.categories) ? categoryResponse.data.categories : []);
          setTotalPages(categoryResponse.data.totalPages || 1);
          setTotalRecords( categoryResponse.data.totalRecords);
        }
      } else {
        throw new Error("Invalid category data received from the server");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    }
  };



  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < Math.ceil(totalRecords / recordsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalRecords, recordsPerPage]);

  const handleStatusChange = async (catId, currentStatus) => {
    const updatedStatus = !currentStatus; // Separate _id from the rest of the updates
    console.log(!currentStatus)
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URI}/employee/categories/${catId}`,
        {status: updatedStatus}, // Pass the nested structure directly
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Status updated successfully!");
      setCurrentStatus(!currentStatus);

    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(`Error: ${errorMessage}`);
      console.error("Error updating employee:", error);
    }
  };

  const handleEditRow = (categoryId) => {
    setEditingRow(categoryId);

    
  };

  // Handle Save Row (PATCH + PUT APIs)
  const handleSaveRow = async (categoryId) => {
    try {
      // Call PATCH API to update subcategory name
      await axios.patch(
        `${process.env.REACT_APP_BACKEND_URI}/employee/categories/${categoryId}`,
        { category_name: editedCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      toast.success("Changes saved successfully!");
      setEditingRow(null);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    }
  };


  return (
    <div className="main-container">
      <div className="add-employee-container">
        <div className="top_bar_title">
          <span className="page-title">Category</span>
          <div className="breadcrumb">
            <a href="/admin">Home </a>
            <span className="separator">» </span>
            <span>Category</span>
          </div>
        </div>
      </div>

      <div className="box-container-main">
        <div className="box-container left-container">
          <div className="add-category-header">
            <span>Add Category</span>
          </div>
          <form onSubmit={handleAddCategory} className="category-label-box">
            <label className="category-label">
              Category:
              <input
                className="category-input"
                type="text"
                placeholder="Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              />
            </label>
            <button type="submit">Add</button>
          </form>
        </div>

        <div className="box-container right-container">
        <div className="add-category-header">
          <span className="all-category-title">All Categories</span>
          </div>
          <table className="employee-table">
            <thead>
              <tr>
                <th className="th-category">Category Name</th>
                <th className="th-status">Status</th>
                <th className="th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((record, index) => (
                  <tr key={index}>
                    <td>{editingRow === record._id ? (
                          <input
                            type="text"
                            defaultValue={record.category_name}
                            onChange={(e) => setEditedCategory(e.target.value)}
                          />
                        ) : (record.category_name || "Unnamed Category")}</td>
                    <td>
                      <label className="switch">
                        <input className="statuscheck" type="checkbox" onChange={() =>{
                            setCurrentStatus(record.status);
                            handleStatusChange(
                              record._id,
                              record.status)
                            }
                          } checked={record.status}/>
                        <span className="slider round"></span>
                        
                      </label>

                    </td>
                    <td>
                        {editingRow === record._id ? (
                          <><button
                            className="action-btn save-btn"
                            onClick={() =>
                            handleSaveRow(record._id)}>
                            Save
                          </button>
                            <button
                              className="action-btn save-btn"
                              onClick={() =>
                                setEditingRow(null)
                              }
                            >
                              cancel
                            </button></>
                        ) : (
                          <button
                            className="action-btn edit-btn"
                            onClick={() =>
                              handleEditRow(record._id,)
                            }
                          >
                            ✏️
                          </button>
                        )}
                      </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No categories found</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === Math.ceil(totalRecords / recordsPerPage)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Category;

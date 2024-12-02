import React, { useEffect, useState } from "react";
import axios from "axios";
import '../../css/Admin/sub-category.css';
import { toast } from "react-toastify";
import Select from "react-select";

function SubCategory() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [newSubCategory, setNewSubCategory] = useState("");
  const [currentStatus, setCurrentStatus] = useState(null);
  const [newAssignto, setNewAssignto] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editingRowData, setEditingRowData] = useState({});
  const [editingAssignTo, setEditingAssignTo] = useState([]); // For editable assign to
  const token = localStorage.getItem("token");
  const validUser = localStorage.getItem('email');

  // Fetch all employees
  useEffect(() => {
    const fetchEmployees = () => {

      axios.get(`${process.env.REACT_APP_BACKEND_URI}/employee/employee-list?email=${validUser}`, {

        headers: {
          Authorization: `Bearer ${token}` // Add the token in the Authorization header
        }
      })
        .then(response => {
          setEmployees(response.data);
          console.log(response.data)
        })
        .catch(error => console.error('Error fetching employees:', error));
    };

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

    fetchEmployees();
    fetchCategories();
  }, [token, validUser, editingRow, editingRowData, newSubCategory, currentStatus]);

  const handleAddSubCategory = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page

    // Prepare the data to be sent to the backend
    const subCategoryData = {
      subCategoryName: newSubCategory,
      assignto: newAssignto.map((assign) => ({
        employeeId: assign.value, // Extract employeeId from the selected options
      })),
    };

    try {
      // Send the data to the backend
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URI}/employee/categories/${categoryId}`, // Endpoint to add subcategory
        subCategoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token in the Authorization header
          },
        }
      );

      // Display success message and reset form
      toast.success("Subcategory added successfully!");
      setNewSubCategory(""); // Clear subcategory input
      setNewAssignto([]); // Clear selected employees
      setCategoryId(null); // Reset selected category

    } catch (error) {
      console.error("Error adding subcategory:", error);
      toast.error("Failed to add subcategory. Please try again.");
    }
  };


  const handleEditRow = (subCategoryId, subCategory) => {
    setEditingRow(subCategoryId);
    setEditingRowData(subCategory);

    // Preselect existing employees in the Assign To dropdown
    setEditingAssignTo(
      subCategory.assignto.map(assign => {
        const employee = employees.find(emp => emp._id === assign.employeeId);
        return employee
          ? { value: assign.employeeId, label: `${employee.first_name} ${employee.last_name} (${employee.employee_id})` }
          : { value: assign.employeeId, label: "Unknown" }; // Fallback for unknown employee IDs
      })
    );
  };

  // Handle Save Row (PATCH + PUT APIs)
  const handleSaveRow = async (categoryId, subCategoryId) => {
    try {
      // Call PATCH API to update subcategory name
      await axios.patch(
        `${process.env.REACT_APP_BACKEND_URI}/employee/categories/${categoryId}/${subCategoryId}`,
        { subCategoryName: editingRowData.subCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Call PUT API to replace assign to array
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URI}/employee/categories/${categoryId}/${subCategoryId}`,
        { assignto: editingAssignTo.map(emp => ({ employeeId: emp.value })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Changes saved successfully!");
      setEditingRow(null);
      setEditingAssignTo([]);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    }
  };

  const getEmployeeNames = (assignToIds) => {
    if (!assignToIds || !Array.isArray(assignToIds)) return "N/A"; // Return "N/A" if no IDs or invalid data

    // Map over assigned IDs and fetch employee details
    return assignToIds
      .map((assign) => {
        const employee = employees.find((emp) => emp._id === assign.employeeId); // Find employee by ID
        return employee
          ? `${employee.first_name} ${employee.last_name} (${employee.employee_id})` // Return full name and employee ID
          : "Unknown"; // Fallback if employee not found
      })
      .join(", "); // Join multiple employees with commas
  };

  const handleStatusChange = async (catId,subCatId, currentStatus) => {
    const updatedStatus = !currentStatus; // Separate _id from the rest of the updates
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URI}/employee/categories/${catId}/${subCatId}`,
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

  return (
    <div className="main-container">
      <div className="add-employee-container">
        <div className="top_bar_title">
          <span className="page-title">Subcategory</span>
          <div className="breadcrumb">
            <a href="/admin">Home </a>
            <span className="separator">» </span>
            <span>Sub Category</span>
          </div>
        </div>
      </div>




      <div className="box-container-main-subcat">
        <div className="box-container-subcat left-container-subcat">
          <div className="add-category-header">
            <span>Add Subcategory</span>
          </div>
          <form onSubmit={handleAddSubCategory} className="subcategory-label-box">
            <label className="form-label-subcat">
              Subcategory Name:
              <input
                className="category-input"
                type="text"
                placeholder="Subcategory"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                required
              />
            </label>
            <label className="form-label-subcat">
              Select Category:
              <select
                name="CategoryId"
                className="sub-cat-form-input"
                value={categoryId || ""}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((record) => (
                  <option key={record._id} value={record._id}>
                    {record.category_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label-subcat">
              Assign To
              <Select
                options={employees.map((emp) => ({
                  value: emp._id,
                  label: `${emp.first_name} ${emp.last_name} - ${emp.employee_id}`,
                }))}
                isMulti
                value={newAssignto}
                onChange={(selected) => setNewAssignto(selected)}
                placeholder="Select employees"
                styles={{
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 10, // Ensure the dropdown is always above other elements
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    maxWidth: "90%", // Limit the width of each selected item
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize:"10px"
                  }),
                  control: (provided) => ({
                    ...provided,
                    maxHeight: "80px", // Limit height for the selected items
                    overflowY: "auto", // Add scroll for overflowing content
                    fontSize:"10px"
                  })
                }}
              />
            </label>
            <button type="submit">Add</button>
          </form>
        </div>
        <div className="box-container-subcat right-container-subcat">
          <div className="add-category-header">
            <span className="all-category-title">All Subcategories</span>
          </div>
          <table className="employee-table">
            <thead>
              <tr>
                <th>Subcategory Name</th>
                <th>Category Name</th>
                <th>Assign To</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.flatMap((category) =>
                  category.subCategories.map((subCategory) =>
                  (
                    <tr key={subCategory._id}>
                      <td>
                        {editingRow === subCategory._id ? (
                          <input
                            type="text"
                            defaultValue={subCategory.subCategoryName}
                            onChange={(e) =>
                              setEditingRowData((prev) => ({
                                ...prev,
                                subCategoryName: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          subCategory.subCategoryName
                        )}
                      </td>
                      <td>{category.category_name}</td>
                      <td>
                        {editingRow === subCategory._id ? (
                          <Select

                            options={employees.map(emp => ({
                              value: emp._id,
                              label: `${emp.first_name} ${emp.last_name} (${emp.employee_id})`,
                            }))}
                            isMulti
                            value={editingAssignTo}
                            onChange={setEditingAssignTo}
                            placeholder="Select employees"
                          />
                        ) : (
                          getEmployeeNames(subCategory.assignto)
                        )}
                      </td>
                      <td>
                        <label className="switch">
                          <input className='statuscheck' onChange={() =>{
                            setCurrentStatus(subCategory.status);
                            handleStatusChange(
                              category._id,subCategory._id,
                              subCategory.status)
                            }
                          } type="checkbox" checked={subCategory.status} />
                          <span className="slider round"></span>
                        </label>
                      </td>
                      <td>
                        {editingRow === subCategory._id ? (
                          <><button
                            className="action-btn save-btn"
                            onClick={() =>
                            handleSaveRow(category._id, subCategory._id)}>
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
                              handleEditRow(subCategory._id, subCategory)
                            }
                          >
                            ✏️
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )
              ) : (
                <tr>
                  <td colSpan="5">No subcategories found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SubCategory;

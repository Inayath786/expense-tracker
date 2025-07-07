import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./main.css";
import Charts from "./charts.js";


function Main() {
  const [userInfo, setUserInfo] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
const [sortBy, setSortBy] = useState("");
const [sortOrder, setSortOrder] = useState("asc");
const [category, setCategory] = useState("");

const token = localStorage.getItem("token");

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

useEffect(() => {
  fetchData();
}, [userId, searchTerm, sortBy, sortOrder, category]);



const fetchData = async () => {
  try {
    if (!userId) {
      console.error("UserId not found!");
      setLoading(false);
      return;
    }

    const userRes = await axios.get(
      `http://localhost:5000/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setUserInfo(userRes.data);

    let query = [];

    if (category) query.push(`category=${encodeURIComponent(category)}`);
    if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);
    if (sortBy) query.push(`sortby=${sortBy}&order=${sortOrder}`);

    const queryString = query.length > 0 ? `?${query.join("&")}` : "";

    const expenseRes = await axios.get(
      `http://localhost:5000/expenses/${userId}${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setExpenses(expenseRes.data.Expenses);
    setLoading(false);
  } catch (err) {
    console.error("Error loading dashboard:", err);
    setLoading(false);
  }
};


  const handleExport = () => {
    window.open(`http://localhost:5000/export/${userId}`, "_blank");
  };

  const handleAddExpense = () => {
    navigate("/expense");
  };

  if (loading) return <p className="dashboard-message">Loading Dashboard...</p>;
  if (!userInfo) return <p className="dashboard-message error">Failed to load data</p>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Hello, {userInfo.Name}</h1>

      <div className="summary-box">
        <p><strong>Salary:</strong> ₹{userInfo.salary}</p>
        <p><strong>Total Spend:</strong> ₹{userInfo.TotalSpend}</p>
        <p><strong>Remaining:</strong> ₹{userInfo.Remaining}</p>
        <p><strong>Threshold:</strong> ₹{userInfo.threshold}</p>
        <p><strong>Required Spend:</strong> ₹{userInfo["Spend on requirment"]}</p>
        <p><strong>Non-Required Spend:</strong> ₹{userInfo["Spend on non requirment"]}</p>
      </div>

      {userInfo.Remaining < userInfo.threshold && (
        <div className="alert-box">
          ⚠️ You are spending more than your threshold!
        </div>
       

      )}
       <Charts expenses={expenses} />

      <div className="export-bar">
        <h2>Recent Expenses</h2>
        <button onClick={() => window.location.href = "/profile"}>Edit Profile</button>
        <button className="export-btn" onClick={handleExport}>
          Export CSV
        </button>
        <button
          className="export-btn"
          onClick={handleAddExpense}
          style={{ marginLeft: "10px" }}
        >
          Add Expense
        </button>
      </div>
      <div className="filters">
  <label>
    Search:
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search description"
    />
  </label>
  <label>
    Category:
    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
    >
      <option value="">All</option>
      <option value="Required">Required</option>
      <option value="Not Required">Not Required</option>
    </select>
  </label>
  <label>
    Sort By:
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
    >
      <option value="">None</option>
      <option value="amount">Amount</option>
      <option value="date">Date</option>
    </select>
  </label>
  <label>
    Order:
    <select
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value)}
    >
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
    </select>
  </label>
  <button onClick={fetchData}>Apply Filters</button>
</div><hr/>
<hr/>


      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount (₹)</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, idx) => (
            <tr key={idx}>
              <td>{new Date(exp.date).toLocaleDateString()}</td>
              <td>{exp.description}</td>
              <td>{exp.amount}</td>
              <td>{exp.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
  <button
    onClick={() => navigate("/admin")}
    style={{ marginLeft: "10px", padding: "8px 12px" }}
  >
    Admin Panel
  </button>


      


      {expenses.length === 0 && (
        <p className="dashboard-message">No expenses added yet.</p>
      )}
    </div>
  );
}

export default Main;

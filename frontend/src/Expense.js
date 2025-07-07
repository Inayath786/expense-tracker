import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Expense() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Required");

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/expenses", {
        user_id: userId,
        description,
        amount: parseFloat(amount),
        category,
      });

      alert("Expense added successfully!");
     navigate("/main", { replace: true });
window.location.reload();

    } catch (err) {
      console.error(err?.response?.data?.message || err.message);
      alert(err?.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add New Expense</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <br /><br />
        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        <br /><br />
        <label>
          Category:
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="Required">Required</option>
            <option value="Not Required">Not Required</option>
          </select>
        </label>
        <br /><br />
        <button type="submit">Save Expense</button>
      </form>
    </div>
  );
}

export default Expense;

import axios from "axios";
import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";





function Form(){
    const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [salary, setSalary] = useState("");
  const [threshold, setThreshold] = useState("");
  const navigate=useNavigate()
//   const [role, setRole] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      let token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/user",
        {
          name,
          age,
          email,
          password,
          salary,
          threshold,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);

localStorage.setItem("userId", res.data.user_id);

navigate("/main");

    } catch (err) {
      console.log(err?.response?.data?.message || err.message);
      alert(err?.response?.data?.message || "Something went wrong!");
    }
  };


    return(
        <>
        <h1>Enter the details in the Form</h1>
        <form onSubmit={handleLogin}>
            <label>Enter Name:<input type="text" placeholder="Enter your name" value={name} onChange={(e)=>{setName(e.target.value)}}></input></label><br/>
            <label>Enter Age:<input type="number" placeholder="Enter your age" value={age} onChange={(e)=>{setAge(e.target.value)}}></input></label><br/>
            <label>Enter Email:<input type="text" placeholder="Enter your email" value={email} onChange={(e)=>{setEmail(e.target.value)}}></input></label><br/>
            <label>Enter Password:<input type="text" placeholder="Enter your Password" value={password} onChange={(e)=>{setPassword(e.target.value)}}></input></label><br/>
            <label>Enter Your Salary:<input type="number" placeholder="Enter your current salary" value={salary} onChange={(e)=>{setSalary(e.target.value)}}></input></label><br/>
            <label>Enter Your Threshold Limit:<input type="Number" placeholder="Enter your threshold limit" value={threshold} onChange={(e)=>{setThreshold(e.target.value)}}></input></label> <br/>     
            {/* <label>Enter your Role:<input type="text" placeholder="Enter your age" value={role} onChange={(e)=>{setRole(e.target.value)}}></input></label><br/> */}
            <button type="submit">Submit</button>

        </form>
        </>
    )
}

export default Form;
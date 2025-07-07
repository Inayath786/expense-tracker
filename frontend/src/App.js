import Login from "./login";
import Form from "./form";
import Main from "./main";
import Expense from "./Expense";
import Profile from "./Profile";
import AdminPanel from "./AdminPanel";
import {BrowserRouter,Routes,Route} from "react-router-dom"

function App() {
  
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/main" element={<Main/>}></Route>
        <Route path="/form" element={<Form/>}></Route>
         <Route path="/expense" element={<Expense/>}></Route>
         <Route path="/profile" element={<Profile />} />
         <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      </BrowserRouter>
     
      
    </div>
  );
}

export default App;

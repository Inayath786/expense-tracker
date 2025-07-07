const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const User=require("./models/user.js")
const sendEmail = require("./email.js");
const ratelimit=require("express-rate-limit")
const redis=require("redis")
const bycrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const { Parser } = require("json2csv");
const client=redis.createClient({url: "redis://localhost:6379"})
const fs = require("fs");
const helmet = require("helmet");

const { auth } = require('express-oauth2-jwt-bearer');

const { body, validationResult } = require("express-validator");

client.connect().then(()=>{
    console.log("Connected to redis")
}).catch((err)=>{
     console.error("Error connecting to redis:", err.message);
    process.exit(1);
})



const app=express()
app.use(cors())
app.use(express.json())
app.use(helmet());

const limiter=ratelimit({
    windowMS:5*60*1000,
    max:40,
    message:{message:"Too many requests try after some time"}
})

app.use(limiter)

mongoose.connect("mongodb://localhost:27017/expenses",{
    useNewUrlParser:true
}).then(()=>{
    console.log("Connected to mongodb")
}).catch((err)=>{
    console.log("Error occured while connecting to Mongodb")
})


const authMiddleware = auth({
  issuerBaseURL: 'https://dev-tou1ra2km6d8kuzy.us.auth0.com',
  audience: 'zKjL7jcO3QiAYdevhSkQ8htYa4V9dL17',
});





function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userPermissions = req.auth?.permissions || [];
    const hasPermission = allowedRoles.some(role => userPermissions.includes(role));
    if (!hasPermission) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  };
}



// app.post("/login",async (req,res)=>{
//     const {name,password}=req.body
//     const user=await User.findOne({name})

//     if(!name){
//         res.status(400).json({message:"User not found"})
//     }

//     const isMatch=await bycrypt.compare(password,user.password)
//     if(!isMatch){
//         res.status(403).json({message:"Invalid credentials"})
//     }

//     const token=jwt.sign(
//       { id: user._id, role: user.role },
//     "SECRET_KEY",
//     { expiresIn: "1h" }
//     )

//     res.json({token})
// })

app.get("/user", async (req,res)=>{
    try{
        const cachedData=await client.get("users")

        if(cachedData){
            res.status(200).json({"Users":JSON.parse(cachedData)})
            console.log("Serving from redis")
            return;
        }
        const users=await User.find()

         await client.setEx("users",30,JSON.stringify(users))
        console.log(users)
        res.status(200).json(users)
    }catch(err){
    res.status(500).json({message:err.message})
}

})

app.get("/export/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.expenses.length === 0) {
      return res.status(400).json({ message: "No expenses found" });
    }

    // Convert expenses array → CSV
    const fields = ["description", "amount", "category", "date"];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(user.expenses);

    // Download as file
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${user.name}_expenses.csv`
    );

    res.status(200).end(csv);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


app.get("/export-all", async (req, res) => {
  try {
    const users = await User.find();

    const rows = [];

    users.forEach(user => {
      user.expenses.forEach(exp => {
        rows.push({
          name: user.name,
          description: exp.description,
          amount: exp.amount,
          category: exp.category,
          date: exp.date,
        });
      });
    });

    if (rows.length === 0) {
      return res.status(400).json({ message: "No expenses found." });
    }

    const fields = ["name", "description", "amount", "category", "date"];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=all_expenses.csv"
    );

    res.status(200).end(csv);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


app.post("/user", [
    body("name").notEmpty().withMessage("Name is required"),
    body("age").isInt({ min: 1 }).withMessage("Age must be a positive number"),
    body("email").notEmpty().withMessage("Email should not be empty"),
    body("salary").isNumeric().withMessage("Salary must be a number"),
    body("threshold").isNumeric().withMessage("Threshold must be a number"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
   async (req,res)=>{
    try{

         const errors = validationResult(req);

    // 2. If errors exist, send response
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {name,age,email,password,salary,threshold,role }=req.body

    const hashedpassword=await bycrypt.hash(password,10)

    const user=await User.create({
        name,age,email,password:hashedpassword,salary,threshold,
        
        expenses:[],
        role:role || "user"
    })
    res.status(201).json({message:"User created successfully",user_id:user._id})
}catch(err){
    res.status(500).json({message:err.message})
}
})

app.post("/expenses", async (req,res)=>{
    try{
    const {user_id,description,amount,category}=req.body
    const user=await User.findById(user_id)

    if(!user){
        res.status(404).json({message:"User not found "})
        return;
    }

    const newExpense={
        description,amount: Number(amount),category,
        date:new Date()
    }

    user.expenses.push(newExpense)

    await user.save()
    res.status(201).json({message:"Expenses added into user data"})
}catch(err){
   res.status(500).json({message:err.message})
}
})

app.get("/user/:id", async (req,res)=>{
    try{
    const id=req.params.id
    const user=await User.findById(id)

    if(!user){
        res.status(404).json({message:"User not found"})
        return;
    }

    let totalspend=0;
    let reqspend=0;
    let notreqspend=0;

    user.expenses.forEach(exp => {
        totalspend+=exp.amount
        if(exp.category === "Required"){
            reqspend+=exp.amount
        }
        else if(exp.category === "Not Required"){
            notreqspend+=exp.amount
        }

    });

    const remaining=user.salary-totalspend

    if(remaining<user.threshold){
        console.log("Warning you are spending more than you expected")
          await sendEmail(
    "inayatharifa@gmail.com",        // replace with user's actual email
    "⚠️ Expense Tracker Alert",
    `Dear ${user.name},

Your remaining balance has dropped below your threshold.

Current Balance: ${remaining}

Please review your expenses carefully!

- Expense Tracker`
  );
    }
    res.status(200).json({
        "Name":user.name,
        "salary":user.salary,
        threshold:user.threshold,
        "TotalSpend":totalspend,
        "Spend on requirment":reqspend,
        "Spend on non requirment":notreqspend,
        "Remaining":remaining
    })
}catch(err){
   res.status(500).json({message:err.message})
}
})

app.get("/expenses/:id", async (req,res)=>{
    try{
    const id=req.params.id
    const user=await User.findById(id)

    if(!user){
        res.status(400).json({message:"User not found"})
        return;
    }

    let expenses=user.expenses

    if(req.query.category){
        expenses=expenses.filter(
            (exp)=>
                exp.category === req.query.category
            
        )
    }

    if(req.query.sortby){
        const sortKey=req.query.sortby
        const order=req.query.order === "desc" ? -1 : 1;

        expenses=expenses.sort((a,b)=>{
            if(a[sortKey]<b[sortKey]){
                return -1 * order
            }
             if(a[sortKey]>b[sortKey]){
                return 1 * order
            }
        })

    }

    if(req.query.search){
        const keyword=req.query.search.toLowerCase()

        expenses=expenses.filter(
            (exp)=>
                exp.description.toLowerCase().includes(keyword)
            
        )
    }


    res.status(200).json({"Expenses":expenses})
}catch(err){
    res.status(500).json({message:err.message})
}
})

app.put("/update/:id", async (req,res)=>{
    try{
    const id=req.params.id
    const {name,salary,threshold}=req.body

    const user=await User.findById(id)
    
     if(!user){
        res.status(400).json({message:"User not found"})
        return;
    }

    if(name !== undefined){
        user.name=name
    }
    if(salary !== undefined){
        user.salary=salary
    }
    if(threshold !==undefined){
        user.threshold = threshold
    }
await user.save();
    res.status(200).json({message:"User updated"})
}catch(err){
    res.status(500).json({message:err.message})
}
})


app.get("/health", async (req,res)=>{
    try{
        const mongostate=mongoose.connection.readyState === 1 ? "up" : "down"

        let redisState="down"
        try{
            let pong=await client.ping()
            if(pong === "PONG"){
                redisState="up"
            }
        }catch(err){
            redisState="down"
        }
        res.status(200).json({
            status:"OK",
            "Mongodb":mongostate,
            "redis":redisState
        })
    }catch(err){
        next(err)
    }
})


app.get("/test-helmet", (req, res) => {
  res.send("Helmet Test");
});



app.use((err,req,res,next)=>{
    console.log(err)
    res.status(500).json({message:err.message})
})

app.listen(5000,()=>{
    console.log("Server started at 5000")
})
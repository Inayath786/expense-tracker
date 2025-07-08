const mongoose=require("mongoose")

const ExpenseSchema=new mongoose.Schema({
    description:String,
    amount:Number,
    category:{
        type:String,
        enum:["Required","Not Required"]
    },
    data:{
        type:Date,
        default:Date.now()
    }
})


const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:4
    },
    age:{
        type:Number,
        required:true,
        max:100
    },
    email:{
        type:String,
        required:true
    },
    salary:{
        type:Number,
        required:true
    },
    threshold:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    expenses:[ExpenseSchema],
    role:{
        type:String,
        enum:["user","admin"],
        default:true
    }
})

module.exports=mongoose.model("User",UserSchema)
const express = require('express');
const cors = require('cors');

const port=process.env.PORT||5000;
const app=express()

// middleware...
app.use(cors());
app.use(express.json())
// mongoDb...




// Basic...
app.get('/',(req,res)=>{
    res.send('Bike resell server is running')
})

app.listen(port,()=>{
console.log(`Bike resell is running on ${port}`)
})
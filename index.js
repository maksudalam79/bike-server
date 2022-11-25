const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const port=process.env.PORT||5000;
require('dotenv').config()
const app=express()

// middleware...
app.use(cors());
app.use(express.json())
// mongoDb...


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_password}@cluster0.5ofrmjz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// main...
function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send("Unauthorized access");
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      req.decoded = decoded;
      next();
    });
  }
  





async function run(){
    try{
        const bikeCategoriesCollection=client.db('bikeResell').collection('bikeCategories')
        const buyerCollection=client.db('bikeResell').collection('buyer')
        const usersCollection=client.db('bikeResell').collection('users')
      

        app.get('/bikeCategories',async(req,res)=>{
            const query={};
            const Categories=await bikeCategoriesCollection.find(query).toArray();
            res.send(Categories)
        })
       
        app.get('/bikeCategories/:id',async(req,res)=>{
            const id=req.params.id
            console.log(id)
          const query={_id:ObjectID(id)}
          console.log(query)
            const category=await bikeCategoriesCollection.findOne(query)
            res.send(category)
        })
        app.post('/buyer',async(req,res)=>{
            const buyer=req.body
            const result=await buyerCollection.insertOne(buyer)
            res.send(result)
        })
        app.get('/buyer',verifyJwt,async(req,res)=>{
            const email=req.query.email
            const decoded = req.decoded.email;
      if (email !== decoded) {
        return res.status(403).send({ message: "Forbidden access" });
      }

            const query={email:email}
            const buyer=await buyerCollection.find(query).toArray()
            res.send(buyer) 
        })
app.get('/jwt',async(req,res)=>{
    const email=req.query.email
    const query={email:email}
    const user=await usersCollection.findOne(query)
    if(user){
        const token=jwt.sign({email}, process.env.ACCESS_TOKEN)
        return res.send({accessToken:token})
    }
    res.status(403).send({accessToken:''})
})


        app.post('/users',async(req,res)=>{
            const user=req.body
            const result=await usersCollection.insertOne(user)
            res.send(result)
    })
    app.get('/users',async(req,res)=>{
const query={}
const users=await usersCollection.find(query).toArray()
res.send(users)
    })
    app.put("/users/admin/:id", verifyJwt, async (req, res) => {
        const decodedEmail=req.decoded.email
        const query={email:decodedEmail}
        const user=await usersCollection.findOne(query)
        if(user?.role!=="admin"){
            return res.status(403).send({message:'forbidden access'})
        }
        const id = req.params.id;
        const filter = {
          _id:ObjectId(id),
        };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await usersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      });
      app.get("/users/admin/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email };
const user = await usersCollection.findOne(query);
        res.send({ isAdmin: user?.role === "admin" });
      });
  
  


    }
    finally{

    }

}
run().catch(console.log)





// Basic...
app.get('/',(req,res)=>{
    res.send('Bike resell server is running')
})

app.listen(port,()=>{
console.log(`Bike resell is running on ${port}`)
})
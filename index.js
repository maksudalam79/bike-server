const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectID } = require('bson');
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
        app.get('/buyer',async(req,res)=>{
            const email=req.query.email
            const query={email:email}
            const buyer=await buyerCollection.find(query).toArray()
            res.send(buyer) 
        })
        app.post('/users',async(req,res)=>{
            const users=req.body
            const result=await usersCollection.insertOne(users)
            res.send(result)
    })


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
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

        app.get('/bikeCategories',async(req,res)=>{
            const query={};
            const Categories=await bikeCategoriesCollection.find(query).toArray();
            res.send(Categories)
        })
        app.get('/bikeCategories/:id',async(req,res)=>{
            const id=req.params.id
            console.log(id)
            const query={_id:ObjectID(id)};
            const category=await bikeCategoriesCollection.findOne(query)
            res.send(category)
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
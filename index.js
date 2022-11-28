const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const app = express();

// middleware...
app.use(cors());
app.use(express.json());
// mongoDb...

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_password}@cluster0.5ofrmjz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

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

async function run() {
  try {
    const bikeCategoriesCollection = client
      .db("bikeResell")
      .collection("bikeCategories");
    const productsCollection = client
      .db("bikeResell")
      .collection("bikeProduct");
    const buyerCollection = client.db("bikeResell").collection("buyer");
    const usersCollection = client.db("bikeResell").collection("users");
    const wishListCollection = client.db("bikeResell").collection("wishList");
    const reportCollection = client.db("bikeResell").collection("report");
    const paymentCollection = client.db("bikeResell").collection("payment");

    app.get("/bikeCategories", async (req, res) => {
      const query = {};
      const Categories = await bikeCategoriesCollection.find(query).toArray();
      res.send(Categories);
    });
    app.get("/bikeProduct", async (req, res) => {
      const query = {};
      const allProduct = await productsCollection.find(query).toArray();
      res.send(allProduct);
    });
    app.delete("/bikeProduct/:id", async (req, res) => {
      const id=req.params.id
      const query = {_id:ObjectId(id)};
      const allProduct = await productsCollection.deleteOne(query)
      console.log(allProduct)
      res.send(allProduct);
    });

    app.get("/bikeProduct/:category", async (req, res) => {
      const id = req.params.category;
      const query = { category: id };
      if (id == query) {
        res.send(Categories);
      }
      const Categories = await productsCollection.find(query).toArray();
      res.send(Categories);
    });

    app.post("/wishList", async (req, res) => {
      const wish = req.body;
      const result = await wishListCollection.insertOne(wish);
      res.send(result);
    });

    app.get("/wistList",async(req,res)=>{
     const query={}
      const result=await wishListCollection.find(query).toArray()
      res.send(result)
    })

    app.post("/report", async (req, res) => {
      const report = req.body;
      const result = await reportCollection.insertOne(report);
      res.send(result);
    });

    app.get("/report",async(req,res)=>{
      const query={}
       const result=await reportCollection.find(query).toArray()
       res.send(result)
     })

     app.delete("/report/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = {_id: ObjectId(id) };
      const report=await reportCollection.deleteOne(query);
      console.log(report)
      res.send(report);
    });

    app.post("/bikeProduct", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.get("/bikeCategories/:category", async (req, res) => {
      const id = req.params.category;
      console.log(id);
      const query = { category: id };
      console.log(query);
      const result = await bikeCategoriesCollection.findOne(query);
      res.send(result);
    });
    app.post("/buyer", async (req, res) => {
      const buyer = req.body;
      const result = await buyerCollection.insertOne(buyer);
      res.send(result);
    });
    app.get("/buyer/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await buyerCollection.findOne(query);
      res.send(result);
    });
    app.get("/buyer", verifyJwt, async (req, res) => {
      const email = req.query?.email;
      console.log(email);
      const decoded = req.decoded?.email;
      if (email == decoded) {
        return res.status(403).send({ message: "Forbidden access" });
      }

      const query = { email: email };
      const buyer = await buyerCollection.find(query).toArray();
      res.send(buyer);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const buying = req.body;
      const price = buying.price;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "BDT",
        amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
    app.post("/payment", async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);
      const id = payment.buyingId;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const updateResult = await buyerCollection.updateOne(filter, updateDoc);
      res.send({ result });
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      console.log(query);
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "7d",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const users = await usersCollection.deleteOne(query);
      res.send(users);
    });
    app.get("/users/:role", async (req, res) => {
      const email = req.params.role;
      console.log(email);
      const query = { role: email };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/users/admin/:id", verifyJwt, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
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
      const email = req.params?.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role == "admin" });
    });
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params?.email;
      console.log(email);
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role == "seller" });
    });
    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params?.email;
      console.log(email);
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.role == "Buyer" });
    });
  } finally {
  }
}
run().catch(console.log);

// Basic...
app.get("/", (req, res) => {
  res.send("Bike resell server is running");
});

app.listen(port, () => {
  console.log(`Bike resell is running on ${port}`);
});

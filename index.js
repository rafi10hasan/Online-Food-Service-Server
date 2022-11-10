const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1xnwouw.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
  try {
   
    const servicesCollection = client.db("cloudkitchen").collection("services");
    const reviewsCollection = client.db("cloudkitchen").collection("reviews");

    app.post('/jwt', (req, res) =>{
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
        res.send({token})
    })  

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //review get ....................................
    app.get("/reviews",verifyJWT, async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //filtering review

    app.get("/reviews/:id",verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.findOne(query);
      res.send(result);
    });

    // this for update review 
    app.put('/reviews/:id',verifyJWT, async(req, res)=>{
        const id = req.params.id;
        const updateReview = req.body;
        const filter = {_id: ObjectId(id)};
        const options = {upsert: true};
        const updateDoc = {
            $set:{
                name: updateReview.name,
                image: updateReview.image,
                rating: updateReview.rating,
                reviews: updateReview.reviews,
                // id: updateReview.id,
                email: updateReview.email

            }

        }
        const result = await reviewsCollection.updateOne(filter, updateDoc, options)
        res.send(result)
        
    })

    



  //----------------------------------------------
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });

    app.post("/services", async (req, res) => {
      const newitems = req.body;
      console.log("send data ", newitems);
      const result = await servicesCollection.insertOne(newitems);
      res.send(result);
    });

    app.post("/reviews",verifyJWT, async (req, res) => {
      const newitems = req.body;
      console.log("send data ", newitems);
      const result = await reviewsCollection.insertOne(newitems);
      res.send(result);
    });

    //delet review
    app.delete("/reviews/:id",verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("cloud kitchen server is is running");
});

app.listen(port, () => {
  console.log(`cloud kitchen server is running ${port}`);
});

// kitchenDbUser
// T1oJAJvu2XP4GCvo






























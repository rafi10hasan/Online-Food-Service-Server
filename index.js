const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());


console.log(process.env.DB_USER)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1xnwouw.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
    try{
          await client.connect();
          const servicesCollection=client.db("cloudkitchen").collection("services"); 

            app.get('/services', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        });

        app.post('/services', async (req, res)=>{
            const newitems = req.body;
            console.log('send data ', newitems);
            const result = await servicesCollection.insertOne(newitems)
            res.send(result)
        })
          
    }

    finally{

    }

    
}
run().catch(err=>console.error(err));


app.get('/', (req, res) => {
    res.send('cloud kitchen server is running')
})

app.listen(port, () => {
    console.log(`cloud kitchen server running on ${port}`);
})


// kitchenDbUser
// T1oJAJvu2XP4GCvo
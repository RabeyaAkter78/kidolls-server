const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.port || 5000;

// midleware:
app.use(cors());
app.use(express.json());
// console.log(process.env.DB_PASSWORD);

// mongodb S

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hwapsgs.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db("toysDB")
        const toysCollection = database.collection("toys");

        app.get("/myToys", async (req, res) => {
            const cursor = toysCollection.find();
            const result = await cursor.toArray([]);
            res.send(result);
        })
        app.get("/myToys/:text", async (req, res) => {
            console.log(req.params.text);
            if (req.params.text == "regular" || req.params.text == "sports" || req.params.text == "Truck") {
                const cursor = toysCollection.find({ category: req.params.text });
                const result = await cursor.toArray([]);
                res.send(result);
                console.log(result);
            }
        })

        app.post("/addAToy", async (req, res) => {
            const toys = req.body;
            if (!toys) {
                return res.status(404).send({ message: "invalid request" })
            }
            const result = await toysCollection.insertOne(toys);
            console.log(toys);
            res.send(result)
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// mongodb e 
app.get('/', (req, res) => {
    res.send('kidoz is running');
})

app.listen(port, () => {
    console.log(`kidoz is running on port: ${port}`);

})
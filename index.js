const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // await client.connect();

        const database = client.db("toysDB")
        const toysCollection = database.collection("toys");

        // indexing start
        // const indexKeys = { name: 1, category: 1 };
        // const indexOptions = { name: "nameCategory" };

        // const result = await toysCollection.createIndex(indexKeys, indexOptions);

        app.get('/searchToys/:text', async (req, res) => {
            const searchText = req.params.text;
            const result = await toysCollection.find({
                $or: [
                    { name: { $regex: searchText, $options: "i" } },
                    { category: { $regex: searchText, $options: "i" } }
                ],
            }).toArray();
            res.send(result);

        })

        // indexing end

        app.get("/allToys", async (req, res) => {
            const result = await toysCollection.find()
                .limit(20)
                .sort({ createdAt: -1 })
                .toArray([]);
            res.send(result);
        })

        app.get("/myToys", async (req, res) => {
            const email = req.query.email;
            console.log(email)
            const result = await toysCollection.find({ email: email })
                .sort({ createdAt: -1 })
                .toArray()
                ;
            res.send(result);
        })


        app.get("/categorysToys", async (req, res) => {
            const activeCategory = req.query.activeCategory;
            console.log(activeCategory);

            if (activeCategory == "regular" || activeCategory == "sports" || activeCategory == "Truck") {
                const cursor = toysCollection.find({ category: activeCategory });
                const result = await cursor.toArray([]);
                res.send(result);
                console.log(result);
            }
        })


        app.get('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: {
                    quantity: 1,
                    price: 1,
                    description: 1,
                    photo: 1
                }
            }
            const result = await toysCollection.findOne(query, options);
            console.log(result)
            res.send(result);
        })


        app.get('/allToyDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query);
            res.send(result)
        })



        app.post("/addAToy", async (req, res) => {
            const toys = req.body;
            toys.createdAt = new Date();
            if (!toys) {
                return res.status(404).send({ message: "invalid request" })
            }
            const result = await toysCollection.insertOne(toys);
            console.log(toys);
            res.send(result)
        })

        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            console.log('plz delete from database', id);
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result);

        })


        app.patch("/updateData/:id", async (req, res) => {
            const data = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    price: data.price,
                    quantity: data.quantity,
                    description: data.description
                }
            }

            const result = await toysCollection.updateOne(query, updatedDoc);
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
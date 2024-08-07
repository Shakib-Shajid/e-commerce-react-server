const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pvn5rcy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // ...............................................................................................

        const productCollection = client.db('ecommerceDB').collection('products');
        const cartCollection = client.db('ecommerceDB').collection('carts');

        // auth related query
        app.post('/jwt', async(req, res)=>{
            const user = req.body;
            // console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn : '1h'})
            
            
            res
            .cookie('token', token, {
                httpOnly:  true,
                secure: false,
                // sameSite: 'none'
            })           
            .send({success: true});
        })


        // services related query
        app.get('/products', async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result);
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        
        // send product in carts
        app.post('/carts', async (req, res) => {
            const post = req.body;
            const result = await cartCollection.insertOne(post);
            res.send(result);
        })


        // show by email in cart
        app.get('/carts', async (req, res) => {
            console.log('token', req.cookies.token)
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        })

        // delete product
        app.delete('/carts/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })




        // ...............................................................................................
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }    
    
    
    
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('E-Commerce server is running')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})
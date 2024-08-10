// const express = require('express');
// const app = express();
// const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
// require('dotenv').config();
// const port = process.env.PORT || 5000;
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// // middleware
// app.use(cors({
//     origin: ['http://localhost:5173'],
//     credentials: true
// }));
// app.use(express.json());
// app.use(cookieParser());


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pvn5rcy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// // middleware
// const logger = async (req, res, next) => {
//     console.log('called: ', req.host, req.originalUrl)
//     next();
// }

// async function run() {
//     try {
//         // Connect the client to the server	(optional starting in v4.7)
//         await client.connect();
//         // ...............................................................................................

//         const productCollection = client.db('ecommerceDB').collection('products');
//         const cartCollection = client.db('ecommerceDB').collection('carts');

//         // auth related query
//         app.post('/jwt', async (req, res) => {
//             const user = req.body;
//             // console.log(user);
//             const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })


//             res
//                 .cookie('token', token, {
//                     httpOnly: true,
//                     secure: false,
//                     sameSite: 'none'
//                 })
//                 .send({ success: true });
//         })

//         // .........................................
//         const verifyToken = (req, res, next) => {
//             const token = req.cookie?.token;

//             console.log('value of token in middleware', token);

//             if (!token) {
//                 return res.status(401).send({ message: 'Not Authtorized' })
//             }

//             jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//                 if (err) {
//                     console.log(err)
//                     return res.status(401).send({ message: 'unauthorized' })
//                 }
//                 console.log("value in token", decoded);
//                 req.user = decoded;
//                 next();

//             })
//         }
//         // .........................................



//         // services related query
//         app.get('/products', logger, async (req, res) => {
//             const result = await productCollection.find().toArray();
//             res.send(result);
//         })

//         app.get('/product/:id', async (req, res) => {
//             const id = req.params.id;
//             const query = { _id: new ObjectId(id) }
//             const result = await productCollection.findOne(query);
//             res.send(result);
//         })


//         // send product in carts
//         app.post('/carts', async (req, res) => {
//             const post = req.body;
//             const result = await cartCollection.insertOne(post);
//             res.send(result);
//         })


//         // show by email in cart
//         app.get('/carts',verifyToken,  async (req, res) => {
//             // console.log(req.query.email);
//             console.log('token', req.cookies.token)
//             // console.log("user in valid token", req.user)
//             let query = {};
//             if (req.query?.email) {
//                 query = { email: req.query.email }
//             }
//             const result = await cartCollection.find(query).toArray();
//             res.send(result);
//         })

//         // delete product
//         app.delete('/carts/:id', async (req, res) => {
//             const id = req.params.id;
//             const query = { _id: new ObjectId(id) };
//             const result = await cartCollection.deleteOne(query);
//             res.send(result);
//         })




//         // ...............................................................................................
//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     }



//     finally {
//         // Ensures that the client will close when you finish/error
//         // await client.close();
//     }
// }
// run().catch(console.dir);


// app.get('/', (req, res) => {
//     res.send('E-Commerce server is running')
// })

// app.listen(port, () => {
//     console.log(`Server is running on port: ${port}`)
// })

const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
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

// Middleware
const logger = (req, res, next) => {
    console.log('called: ', req.host, req.originalUrl);
    next();
};

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    // console.log("token in the middle ware", token)
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.user = decoded;
        next();
    })
}


async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();

        const productCollection = client.db('ecommerceDB').collection('products');
        const cartCollection = client.db('ecommerceDB').collection('carts');

        // Auth related route
        app.post('/jwt', logger, async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }); // Increased expiration time for testing

            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none'
                })
                .send({ success: true });
        });

        app.post('/logout', async (req, res) => {
            const user = req.body;
            console.log("log out", user);
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })

        // .........................................................

        // Services related routes (logger)
        app.get('/products', async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result);
        });

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result);
        });

        // Add product to cart
        app.post('/carts', async (req, res) => {
            const post = req.body;
            const result = await cartCollection.insertOne(post);
            res.send(result);
        });

        // Show cart items by email, (verifyToken)
        app.get('/carts', logger, verifyToken, async (req, res) => {
            console.log("user: ", req.user);
            if(req.user.email !== req.query.email){
                return res.status(403).send({message: "forbidden access"})
            }
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email };
            }
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        });


        app.get('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { name: 1, price: 1, img: 1 }
            };
            const result = await cartCollection.findOne(query, options);
            res.send(result);
        })

        // Delete product from cart
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('E-Commerce server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

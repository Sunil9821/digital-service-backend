require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const port = process.env.PORT || 3200;
// const router = require('./route');
const app = express();

app.use(bodyParser.json());
app.use(cors(
    {origin: ['http://localhost:4200']}
))
// app.use('', router);
app.get('/', (req,res)=>{
    res.send('Welcome To The Development....')
})



app.listen(port, ()=>{
    console.log('listening on port '+port);
})
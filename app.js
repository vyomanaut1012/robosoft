const express = require('express');
const app = express();
require('dotenv').config();
const os = require('os');
const hostname = os.hostname();

const cors = require('cors');

const PORT = process.env.PORT || 4444;

if (!process.env.FRONTEND) {
  throw new Error('FRONTEND URL not defined in environment variables');
}

app.use(cors({
  origin: process.env.FRONTEND,
  methods: ["GET", "POST", "PUT"],
  credentials: true,
}));

app.use(express.json());

const routesPath = require('./src/routes/routes.js');
app.use('/', routesPath);

const { databaseConnection } = require('./src/configuration/database/database.js');
databaseConnection();

const { databaseUpdateConnection } = require('./src/configuration/database/databaseUpdate.js');
databaseUpdateConnection();

app.get('/', (req, res) => {
  console.log('welcome in docker');
  res.status(200).json({
    success: true,
    message: 'done'
  })
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} and hostname ${hostname}`);
});

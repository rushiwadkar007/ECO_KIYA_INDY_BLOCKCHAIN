const express = require("express");
const app = new express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const port = process.env.PORT || 3000;
const blockchainRoute = require("./routes/createConnectionRoute");
const schemaRoute = require('./routes/schemaRoute')
const credentialRoute = require('./routes/credentialsRoute');
const walletRoute = require("./routes/walletRoutes");

//middlewares
app.use(express.json({ limit: "5mb", extended: true }));
app.use(cors({
  origin: 'http://120.20.2.139'
}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json("Hello, World! Kiya-ECO INDY Blockchain is here...!");
});

// Define a route
app.use("/eco-blockchain-api/v1", blockchainRoute);
app.use("/credentials/v1", credentialRoute);
app.use("/eco-wallet-details/v1", walletRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

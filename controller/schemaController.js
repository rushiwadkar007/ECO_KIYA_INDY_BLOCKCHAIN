require("dotenv").config();

const axios = require("axios");

const blockchainURL = process.env.Indy_Blockchain_STEWARDURL;

const {
  createSchema,
  getSchema,
  createSchemaDef,
} = require("../endpoints/blockchainEndpoints");

// create schema structure. Issuer can create schema and anyone can create a schema definition out of it.
const createSchemaStructure = async (req, res) => {
  try {
    const { body } = req.body;
    const { conn_id, create_transaction_for_endorser } = req.query;
    const queryParams = `?conn_id=${conn_id}&create_transaction_for_endorser=${create_transaction_for_endorser}`;
    if (!body.referenceId) {
      return res
        .status(400)
        .json({ data: null, status: "Invalid reference ID" });
    }
    
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-credentials": true,
      "access-control-allow-methods": "PUT,GET,HEAD,POST,DELETE,OPTIONS",
      "access-control-allow-origin": "*",
    };
    try {
      const response = await axios.post(
        blockchainURL + createSchema + queryParams,
        {
          body: JSON.stringify(body), // Stringify the body object
          headers,
        }
      );
      console.log("Result of accept invitation is received", response.data);
      res.status(200).json({ data: response.data, status: "success" });
    } catch (error) {
      console.error("Error during API request:", error.message);
      return res.status(400).json({
        data: null,
        error: "Error occurred during executing API request.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      data: null,
      error: error.message, // Use error.message to get the error message
    });
  }
};

// Get schema detials
const getSchemaDetails = async (req, res) => {
  try {
    const { schema_id } = req.query;

    try {
      await axios
        .get(blockchainURL + getSchema + `/${schema_id}`)
        .then((result) => {
          res.status(200).json({
            data: result.data,
            status: "success",
          });
        })
        .catch((error) => {
          res.status(400).json({
            data: null,
            status: "NOT FOUND!",
            error: error,
          });
        });
    } catch (error) {
      res.status(404).json({
        data: null,
        error: error,
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error,
    });
  }
};

// Create schema definition which verfies schema structure and gives a unique id to the definition.
const createSchemaDefinition = async (req, res) => {
  try {
    const { body } = req.body;
    const { conn_id, create_transaction_for_endorser } = req.query;
    const queryParams = `?conn_id=${conn_id}&create_transaction_for_endorser=${create_transaction_for_endorser}`;
    try {
      await axios
        .post(blockchainURL + createSchemaDef + queryParams, { headers, body })
        .then((result) => {
          res.status(200).json({
            data: result.data,
            status: "success",
          });
        })
        .catch((error) => {
          res.status(404).json({
            data: null,
            error: error,
          });
        });
    } catch (error) {
      res.status(404).json({
        data: "Not Found",
        error: error,
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error,
    });
  }
};

module.exports = {
  createSchemaStructure,
  getSchemaDetails,
  createSchemaDefinition,
};

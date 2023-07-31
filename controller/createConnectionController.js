require("dotenv").config();

const axios = require("axios");

const nodemailer = require('nodemailer');

const {sendInvitation} = require('../notifications/emailInvitation');

const blockchainURL = process.env.Indy_Blockchain_STEWARDURL;



const {
  createConnRequest,
  receiveConnRequest,
  acceptConnRequest,
} = require("../endpoints/blockchainEndpoints");
const { query } = require("express");

// Issuer or Holder creates a connection request.
const createConnectionRequest = async (req, res) => {
  try {
    const postData = req.body.body;
    const queryParams = `?alias=${req.query.alias}&auto_accept=${req.query.auto_accept}&multi_use=${req.query.multi_use}&public=${req.query.public}`;

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-credentials": true,
      "access-control-allow-methods": "PUT,GET,HEAD,POST,DELETE,OPTIONS",
      "access-control-allow-origin": "*",
    };

    await axios
      .post(blockchainURL + createConnRequest + queryParams, {
        postData,
        headers,
      })
      .then((result) => {
        res.status(200).send({ data: result.data, status: "success" });
      })
      .catch((error) => {
        res.status(404).json({
          data: null,
          error: error,
        });
      });
  } catch (error) {
    res.status(500).json({
      data: null,
      status: "Server Error",
    });
  }
};

// Connection is accepted through the API
const acceptConnectionRequest = async (req, res) => {
  try {
    const { conn_id, mediation_id, my_endpoint, my_label } = req.query;
    const queryParams = `?mediation_id=${mediation_id}&my_endpoint=${my_endpoint}&my_label=${my_label}`;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-credentials": true,
      "access-control-allow-methods": "PUT,GET,HEAD,POST,DELETE,OPTIONS",
      "access-control-allow-origin": "*",
    };
    try {
      const response = await axios.post(
        blockchainURL + `${conn_id}` + acceptConnRequest + queryParams,
        {
          headers
        }
      );
      res.status(200).json({ data: response.data, status: "success" });
    } catch (error) {
      res.status(400).json({
        data: null,
        error: "Error occurred during API request.",
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error,
    });
  }
};

// Connection is received 
const receiveConnectionRequest = async (req, res) => {
  try {
    const postData = req.body;

    const queryParams = `?alias=${req.query.alias}&auto_accept=${req.query.auto_accept}&multi_use=${req.query.mediation_id}`;

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-credentials": true,
      "access-control-allow-methods": "PUT,GET,HEAD,POST,DELETE,OPTIONS",
      "access-control-allow-origin": "*",
    };

    try {
      const response = await axios.post(
        blockchainURL + receiveConnRequest + queryParams,
        {
          postData,
          headers,
        }
      );
      res.status(200).json({ data: response.data, status: "success" });
    } catch (error) {
      res.status(400).json({
        data: null,
        error: "Error occurred during API request.",
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      error: "Server Error",
    });
  }
};

// Fetch connection details that is already established.
const fetchConnectionMetadata = async (req, res) => {
  try {
    const { conn_id, key } = req.query;
    const queryParams = `?key=${key}`;
    try {
      const response = await axios.get(
        blockchainURL + `${conn_id}/metadata` + queryParams
      );
      res.status(200).json({ data: response.data, status: "success" });
    } catch (error) {
      res.status(400).json({
        data: null,
        error: "Error occurred during API request.",
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error,
    });
  }
};

const sendInvitationObjectAndURL = async(req, res) =>{
  try{
    const {fromEmail, toEmail, invitationObject} = req.body;

    const messageId = await sendInvitation(fromEmail, toEmail, invitationObject);

    res.status(200).json({
      data: messageId,
      message: "email sent successfully!",
    });
  }catch(error){
    res.status(500).json({
      data: null,
      error: error
    })
  }
}

module.exports = {
  createConnectionRequest,
  receiveConnectionRequest,
  acceptConnectionRequest,
  fetchConnectionMetadata,
  sendInvitationObjectAndURL
};

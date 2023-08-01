var express = require("express");

const router = require("express").Router();

var bodyParser = require("body-parser");

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

const {
  sendProposal,
  sendOffer,
  sendRequest,
  issueCredentials,
  approveCredentials,
  getCredentialRequests,
  getCredOffers,
  getCredIssued,
  getCredReceivedRequests,
} = require("../controller/credentialsController");

router.post("/sendProposal", urlencodedParser, sendProposal);

router.post("/sendOffer", urlencodedParser, sendOffer);

router.get("/getCredOffers", getCredOffers);

router.post("/sendRequest", urlencodedParser, sendRequest);

router.post("/issueCredentials", urlencodedParser, issueCredentials);

router.get("/getCredReuests", getCredentialRequests);

router.get("/getReceivedRequest", getCredReceivedRequests);

router.get("/getCredIssued", getCredIssued);

router.post("/approveCredentials", urlencodedParser, approveCredentials);

module.exports = router;
 
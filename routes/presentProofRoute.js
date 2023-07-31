const router = require("express").Router();

var express = require("express");

var bodyParser = require("body-parser");

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var {
  getCredentialProofSentRequests,
  getCredentialProofReceivedRequests,
} = require("../controller/proofRequests");

router.get("/getCredentialProofSentRequests", getCredentialProofSentRequests);

router.get(
  "/getCredentialProofReceivedRequests",
  getCredentialProofReceivedRequests
);

module.exports = router;

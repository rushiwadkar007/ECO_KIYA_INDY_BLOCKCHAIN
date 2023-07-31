const router = require("express").Router();

var express = require('express');

var bodyParser = require('body-parser');

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

const { createConnectionRequest, receiveConnectionRequest, acceptConnectionRequest, fetchConnectionMetadata} = require("../controller/createConnectionController");

router.post("/connection/createConnectionRequest", urlencodedParser, createConnectionRequest);

router.post("/connection/receiveConnectionRequest", urlencodedParser, receiveConnectionRequest);

router.post("/connection/acceptConnectionRequest", urlencodedParser, acceptConnectionRequest);

router.get("/connection/fetchConnectionMetadata", fetchConnectionMetadata);

module.exports = router;
const router = require("express").Router();

var express = require('express');

var bodyParser = require('body-parser');

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

const {walletDetails, didDetails} = require("../controller/walletController");

router.get("/walletDetails", walletDetails);

router.get("/didData", didDetails);

module.exports = router;
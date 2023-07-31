const router = require("express").Router();

var express = require('express');

var bodyParser = require('body-parser');

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

const { createSchemaStructure, getSchemaDetails, createSchemaDefinition } = require("../controller/schemaController");

router.post("/createSchema", urlencodedParser, createSchemaStructure);

router.post("/createSchemaDefinition", urlencodedParser, createSchemaDefinition);

router.get("/getSchema", getSchemaDetails);

module.exports = router;
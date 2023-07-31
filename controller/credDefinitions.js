require("dotenv").config();

const axios = require("axios");

const blockchainURL = process.env.Indy_Blockchain_STEWARDURL;

const holderBlockchainURL = process.env.Indy_Blockchain_HOLDERURL;

const getCredDefList = async(req,res) =>{
    try{

    }
    catch(error){
        res.status(500).json({
            data: null,
            error: error
        })
    }
}

module.exports = {getCredDefList}
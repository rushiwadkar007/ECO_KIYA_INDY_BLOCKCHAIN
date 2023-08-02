require("dotenv").config();

const axios = require("axios");

const blockchainURL = process.env.Indy_Blockchain_STEWARDURL;

const blockchainHolderURL = process.env.Indy_Blockchain_HOLDERURL;
// state, role, connection_id
const walletDetails = async (req, res) => {
  try {
    const { referenceNO, schemaID, credDefID, roleType } = req.query;

    try {
      const credentialsData = await axios.get(
        blockchainHolderURL + `/credentials`
      );
      if (credentialsData.data.results.length > 0) {
        const filteredData = credentialsData.data.results.map((item, index) => {
          console.log("credentialsData", item);
          if (item.attrs.RefNumber === referenceNO && !referenceNO) {
            return item;
          } else if (item.schemaID === schemaID && !schemaID) {
            return item;
          } else if (item.cred_def_id === credDefID && !credDefID) {
            return item;
          } else if (item.attrs.Type === roleType && !roleType) {
            return item;
          }
        });

        const fData = filteredData.filter((item) => {
          if (item !== null) {
            return item;
          }
        });

        res.status(200).json({
          credData: fData,
          status: "Wallet Data Rendered",
        });
      } else {
        return res.status(400).json({
          data: null,
          status: "NOT FOUND!",
        });
      }
    } catch (error) {
      res.status(404).json({
        Data: "NOT FOUND",
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

const didDetails = async (req, res) => {
  try {
    const { did } = req.query;
    const didData = await axios.get(blockchainHolderURL + `/wallet/did`);

    if (didData.data.results.length > 0) {
      const filteredData = didData.data.results.map((item, index) => {
        if (item.did === did && did !== null && did !== "") {
          return item;
        }
        else if(did === ""){
            return item
        }
      });
      const fData = filteredData.filter((item) => {
        if (item !== null || item !== undefined) {
          return item;
        }
      });
      
      res.status(200).json({
        credData: fData,
        status: "Wallet DIDs Rendered",
      });
    } else {
      return res.status(400).json({
        data: null,
        status: "NOT FOUND!",
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error,
    });
  }
};

module.exports = { walletDetails, didDetails };

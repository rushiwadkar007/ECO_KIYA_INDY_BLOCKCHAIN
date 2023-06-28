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

          if (item.attrs.RefNumber === referenceNO && referenceNO !== null) {
            return item;
          } else if (item.schemaID === schemaID && schemaID !== null) {
            return item;
          } else if (item.cred_def_id === credDefID && credDefID !== null) {
            return item;
          } else if (item.attrs.Type === roleType && roleType !== null) {
            return item;
          }
        });

        res.status(200).json({
          credData: filteredData,
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

module.exports = { walletDetails };

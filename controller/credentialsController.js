require("dotenv").config();

const axios = require("axios");

const blockchainURL = process.env.Indy_Blockchain_STEWARDURL;

const holderBlockchainURL = process.env.Indy_Blockchain_HOLDERURL;

const {
  sendProposalHolder,
  sendOfferIssuer,
  sendRequestHolder,
  issueCreds,
} = require("../endpoints/blockchainEndpoints");

const sendProposal = async (req, res) => {
  try {
    const { attributes, referenceNo, roleType } = req.body;
    try {
      const connectiondataResp = await axios.get(
        holderBlockchainURL + `/connections?alias=${referenceNo}`
      );

      const conn_id = connectiondataResp.data["results"][0].connection_id;
      console.log("conn_id", conn_id);
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "access-control-allow-credentials": true,
        "access-control-allow-methods": "PUT,GET,HEAD,POST,DELETE,OPTIONS",
        "access-control-allow-origin": "*",
      };

      const proposalBody = {

        auto_remove: false,

        comment: `This credential proposal has been proposed by Reference ID  ${referenceNo}`,

        connection_id: `${conn_id}`,

        credential_preview: {
          "@type": "issue-credential/2.0/credential-preview",

          attributes: [
            {
              name: "RefNumber",

              value: `${referenceNo}`,
            },

            {
              name: "TreeData",

              value: attributes,
            },

            {
              name: "Name",

              value: "ECO TRUST DATA",
            },

            {
              name: "Type",

              value: roleType,
            },
          ],
        },

        filter: {
          indy: {
            cred_def_id: "6QpgFLwwgo7ffnQiKGNbxi:3:CL:160:Eco Trust Data-1",

            issuer_did: "6QpgFLwwgo7ffnQiKGNbxi",

            schema_id: "6QpgFLwwgo7ffnQiKGNbxi:2:Eco-Trust-Data:1.0",

            schema_issuer_did: "6QpgFLwwgo7ffnQiKGNbxi",

            schema_name: "Eco-Trust-Data",

            schema_version: "1.0",
          },
        },

        trace: false,
      };

      console.log("holderBlockchainURL + sendProposalHolder", holderBlockchainURL + sendProposalHolder);

      const sendProposalResp = await axios.post(
        holderBlockchainURL + sendProposalHolder,
        { proposalBody, headers }
      );

      console.log("sendProposal Response ", sendProposalResp);
    } catch (error) {
      res.status(404).json({
        data: null,
        status: `data not found + ${error}`,
      });
    }

    // try {
    //     console.log(blockchainURL + `/connections?alias=${referenceNo}`);
    //   const conn_Data = {};
    //   const connectiondataResp = await axios
    //     .get(blockchainURL + `/connections?alias=${referenceNo}`)
    //     .then(async (res) => {
    //       conn_Data = res.results
    //         .filter(async (item) => {
    //             console.log("item of conn on basis of alias", item)
    //           if (item.their_label === referenceNo) {
    //             return item;
    //           }
    //         })
    //         // .catch((error) => {
    //         //   res.status(404).json({
    //         //     data: null,
    //         //     status: `data not found! : ${error}`,
    //         //   });
    //         // });
    //         console.log("conn_Data", conn_Data);

    //       await axios
    //         .post(holderBlockchainURL + sendProposalHolder, { proposalBody, headers })
    //         .then((result) => {
    //           res.status(200).json({
    //             data: result.data,
    //             status: "success",
    //           });
    //         })
    //         .catch((error) => {
    //           res.status(400).json({
    //             data: null,
    //             error: error,
    //           });
    //         });
    //     })
    //     .catch((error) => {
    //       res.status(500).json({
    //         status: "failed",
    //         error: error,
    //       });
    //     });
    // } catch (error) {
    //   res.status(400).json({
    //     data: null,
    //     error: error,
    //   });
    // }
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error,
    });
  }
};

const sendOffer = async (req, res) => {
  try {
    const { body } = req.body;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-credentials": true,
      "access-control-allow-methods": "PUT,GET,HEAD,POST,DELETE,OPTIONS",
      "access-control-allow-origin": "*",
    };
    try {
      await axios
        .post(blockchainURL + sendOfferIssuer, { body, headers })
        .then((result) => {
          res.status(200).json({
            data: result.data,
            status: "success",
          });
        })
        .catch((error) => {
          res.status(400).json({
            data: null,
            error: error,
          });
        });
    } catch (error) {
      res.status(400).json({
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

const sendRequest = async (req, res) => {
  try {
    const { body } = req.body;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-credentials": true,
      "access-control-allow-methods": "PUT,GET,HEAD,POST,DELETE,OPTIONS",
      "access-control-allow-origin": "*",
    };
    try {
      await axios
        .post(blockchainURL + sendRequestHolder, { body, headers })
        .then((result) => {
          res.status(200).json({
            data: result.data,
            status: "success",
          });
        })
        .catch((error) => {
          res.status(400).json({
            data: null,
            error: error,
          });
        });
    } catch (error) {
      res.status(400).json({
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

const issueCredentials = async (req, res) => {
  try {
    const { body } = req.body;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-credentials": true,
      "access-control-allow-methods": "PUT,GET,HEAD,POST,DELETE,OPTIONS",
      "access-control-allow-origin": "*",
    };
    try {
      await axios
        .post(blockchainURL + issueCreds + `/${req.query.cred_ex_id}/issue`, {
          body,
          headers,
        })
        .then((result) => {
          res.status(200).json({
            data: result.data,
            status: "success",
          });
        })
        .catch((error) => {
          res.status(400).json({
            data: null,
            error: error,
          });
        });
    } catch (error) {
      res.status(400).json({
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

module.exports = { sendProposal, sendOffer, sendRequest, issueCredentials };

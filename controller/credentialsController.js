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
        holderBlockchainURL + `/connections`
      );

      // const conn_id = connectiondataResp.data["results"][0].connection_id;

      const conn_id = "0b6d25bf-1ae0-4fdd-ba06-c4f5e37fbf30";

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      // const proposalBody = {

      //   auto_remove: true,

      //   comment: `This credential proposal has been proposed by Reference ID  ${referenceNo}`,

      //   connection_id: `0b6d25bf-1ae0-4fdd-ba06-c4f5e37fbf30`,

      //   credential_preview: {
      //     "@type": "issue-credential/2.0/credential-preview",

      //     attributes: [
      //       {
      //         name: "RefNumber",

      //         value: `${referenceNo}`,
      //       },

      //       {
      //         name: "TreeData",

      //         value: attributes,
      //       },

      //       {
      //         name: "Name",

      //         value: "ECO TRUST DATA",
      //       },

      //       {
      //         name: "Type",

      //         value: roleType,
      //       },
      //     ],
      //   },
      //     "indy": {
      //         "cred_def_id": "TLASnc1X3bknwHcadpxP39:3:CL:147:university",
      //         "issuer_did": "3EcM8j9RTNLQMbwQ1K8Dy3",
      //         "schema_id": "6QpgFLwwgo7ffnQiKGNbxi:2:Eco-Trust-Data:1.0",
      //         "schema_issuer_did": "3EcM8j9RTNLQMbwQ1K8Dy3",
      //         "schema_name": "Eco-Trust-Data",
      //         "schema_version": "1.0"
      //     },

      //   trace: false,
      // };

      const proposalBody = {
        "auto_remove": true,
        "comment": "ECO Credentials Generation Request",
        "connection_id": "0b6d25bf-1ae0-4fdd-ba06-c4f5e37fbf30",
        "credential_preview": {
            "@type": "issue-credential/2.0/credential-preview",
            "attributes": [
                {
                    "name": "RefNumber",
                    "value": req.body.referenceNo
                },
                {
                    "name": "TreeData",
                    "value": req.body.attributes
                },
                {
                    "name": "Type",
                    "value": req.body.roleType
                },
                {
                    "name": "Name",
                    "value": req.body.name
                }
            ]
        },
        "filter": {
            "indy": {
                "cred_def_id": "6QpgFLwwgo7ffnQiKGNbxi:3:CL:160:Eco Trust Data-1",
                "issuer_did": "3EcM8j9RTNLQMbwQ1K8Dy3",
                "schema_id": "6QpgFLwwgo7ffnQiKGNbxi:2:Eco-Trust-Data:1.0",
                "schema_issuer_did": "3EcM8j9RTNLQMbwQ1K8Dy3",
                "schema_name": "Eco-Trust-Data",
                "schema_version": "1.0"
            }
        },
        "trace": false
      }

      console.log(
        "holderBlockchainURL + sendProposalHolder",
        holderBlockchainURL + sendProposalHolder
      );

      await axios
        .post(
          "http://172.20.2.139:8092/issue-credential-2.0/send-proposal",
          proposalBody,
          { headers }
        )
        .then(async (result) => {
          console.log("response object", result["data"]);
          res.status(200).send({
            data: result["data"],
            status: "Credentials Generation Proposal Accepted.",
          });
        })
        .catch((error) => {
          console.log("response error ");
        });
      // res.status(200).json({
      //   status: "Credentials Generation Proposal Accepted."
      // });
      // console.log("sendProposal Response ", sendProposalResp);
    } catch (error) {
      res.status(404).json({
        data: null,
        status: `data not found + ${error}`,
      });
    }
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

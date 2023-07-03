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
    try {
      // const connectiondataResp = await axios.get(
      //   holderBlockchainURL + `/connections`
      // );

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      const proposalBody = {
        auto_remove: true,
        comment: "ECO Credentials Generation Request",
        connection_id: "0b6d25bf-1ae0-4fdd-ba06-c4f5e37fbf30",
        credential_preview: {
          "@type": "issue-credential/2.0/credential-preview",
          attributes: [
            {
              name: "RefNumber",
              value: req.body.referenceNo,
            },
            {
              name: "TreeData",
              value: req.body.attributes,
            },
            {
              name: "Type",
              value: req.body.roleType,
            },
            {
              name: "Name",
              value: req.body.name,
            },
          ],
        },
        filter: {
          indy: {
            cred_def_id: "6QpgFLwwgo7ffnQiKGNbxi:3:CL:160:Eco Trust Data-1",
            issuer_did: "3EcM8j9RTNLQMbwQ1K8Dy3",
            schema_id: "6QpgFLwwgo7ffnQiKGNbxi:2:Eco-Trust-Data:1.0",
            schema_issuer_did: "3EcM8j9RTNLQMbwQ1K8Dy3",
            schema_name: "Eco-Trust-Data",
            schema_version: "1.0",
          },
        },
        trace: false,
      };

      await axios
        .post(
          "http://172.20.2.139:8092/issue-credential-2.0/send-proposal",
          proposalBody,
          { headers }
        )
        .then(async (result) => {
          res.status(200).send({
            data: result["data"],
            status: "Credentials Generation Proposal Accepted.",
          });
        })
        .catch((error) => {
          res.status(500).send({
            error: error,
            status: "Credentials Generation Proposal is not Accepted.",
          });
        });
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

const getCredentialRequests = async (req, res) => {
  try {
    console.log(`${blockchainURL}${issueCreds}`);
    try {
      const requests = await axios.get(blockchainURL + issueCreds);

      const credRequests = requests.data.results.filter((item) => {
        if (item.cred_ex_record.state === "proposal-received") {
          return item.cred_ex_record.created_at;
        }
      });

      const latestRequests = credRequests.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return (
          new Date(b.cred_ex_record.created_at) -
          new Date(a.cred_ex_record.created_at)
        );
      });

      res.status(200).json({
        data: latestRequests,
        status: "Data Found!",
      });
    } catch (error) {
      res.status(404).json({
        data: null,
        error: error,
      });
    }
  } catch (error) {}
};

module.exports = {
  sendProposal,
  sendOffer,
  sendRequest,
  issueCredentials,
  getCredentialRequests,
};

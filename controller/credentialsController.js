require("dotenv").config();

const axios = require("axios");

const crypto = require("crypto");

const blockchainURL = process.env.Indy_Blockchain_STEWARDURL;
const holderBlockchainURL = process.env.Indy_Blockchain_HOLDERURL;
const {
  sendProposalHolder,
  sendOfferIssuer,
  sendRequestHolder,
  issueCreds,
  approveCred,
} = require("../endpoints/blockchainEndpoints");

const sendProposal = async (req, res) => {
  try {
    try {
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      const proposalBody = {
        auto_remove: true,
        comment: "ECO Credentials Generation Request",
        connection_id: "5c79140e-d712-4e38-9f29-f24891608d87",
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
            issuer_did: "6QpgFLwwgo7ffnQiKGNbxi",
            schema_id: "6QpgFLwwgo7ffnQiKGNbxi:2:Eco-Trust-Data:1.0",
            schema_issuer_did: "6QpgFLwwgo7ffnQiKGNbxi",
          },
        },
        trace: false,
      };

      const schemas = await axios.get(
        "http://172.20.2.139:8089/schemas/created"
      );

      const credentials = await axios.get(
        "http://172.20.2.139:8092/credentials"
      );
      const requests = await axios.get(
        holderBlockchainURL + issueCreds + `?state=offer-received`
      );
      // console.log("requests...", item.cred_ex_record.cred_offer.credential_preview.attributes[1].value);
      var treeDataHash = crypto
        .createHash("md5")
        .update(req.body.attributes.split(" ").join(""))
        .digest("hex");
      
      const hashOfferReceivedData = await requests.data.results.filter(
        (item, index) => {
          // console.log("item hashOfferReceivedData ", item.cred_ex_record.cred_offer.credential_preview.attributes[1].value.split(" ").join(""));
          let matchHash = crypto
            .createHash("md5")
            .update(item.cred_ex_record.cred_offer.credential_preview.attributes[1].value.split(" ").join(""))
            .digest("hex");
          if (matchHash === treeDataHash) {
            return true;
          }
        }
      );
      const hashMatchedData = await credentials.data.results.filter(
        (item, index) => {
          let matchHash = crypto
            .createHash("md5")
            .update(item.attrs.TreeData.split(" ").join(""))
            .digest("hex");
          if (matchHash === treeDataHash) {
            return true;
          }
        }
      );
      console.log("ecoSchemaData", hashMatchedData.length > 0 || hashOfferReceivedData.length > 0);
      if (hashMatchedData.length > 0 || hashOfferReceivedData.length > 0) {
        const ecoSchemaData = await schemas.data.schema_ids.map(
          (item, index) => {
            if (item.match(/\b(6QpgFLwwgo7ffnQiKGNbxi:2:Eco-Trust-Data)\b/g)) {
              console.log("item", item, index);
              return item;
            }
          }
        );
        
        const filteredEcoSchema = ecoSchemaData.filter(function (val) {
          return val !== undefined;
        });

        let schemaVersion =
          Number(
            filteredEcoSchema[filteredEcoSchema.length - 1].substring(42)
          ) + 2;
        let schemaBody = {
          attributes: ["RefNumber", "TreeData", "Type", "Name"],
          schema_name: `Eco-Trust-Data-${filteredEcoSchema.length}`,
          schema_version: `${filteredEcoSchema.length.toString()}.0`,
        };
        await axios
          .post("http://172.20.2.139:8089/schemas", schemaBody, { headers })
          .then(async (result) => {
            const schemaDefBody = {
              schema_id: result.data.schema_id,
              support_revocation: false,
              tag: `Eco Trust Data2-${result.data.schema.name}`,
            };
            await axios
              .post(
                "http://172.20.2.139:8089/credential-definitions",
                schemaDefBody,
                { headers }
              )
              .then(async (result) => {
                const propBody = {
                  auto_remove: true,
                  comment: "ECO Credentials Generation Request",
                  connection_id: "5c79140e-d712-4e38-9f29-f24891608d87",
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
                      cred_def_id: result["data"].sent.credential_definition_id,
                      issuer_did: "6QpgFLwwgo7ffnQiKGNbxi",
                      schema_id: schemaDefBody.schema_id,
                      schema_issuer_did: "6QpgFLwwgo7ffnQiKGNbxi",
                    },
                  },
                  trace: false,
                };
                await axios
                  .post(
                    "http://172.20.2.139:8089/issue-credential-2.0/send-offer",
                    propBody,
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
                      status:
                        "Credentials Generation Proposal is not Accepted.",
                    });
                  });
              })
              .catch((error) => {
                res.status(500).send({
                  error: error,
                  status: "Credential Def Not Created",
                });
              });
          })
          .catch((error) => {
            res.status(500).send({
              error: error,
              status: "Schema Creation failed!",
            })
          });
      } else {
        await axios
          .post(
            "http://172.20.2.139:8089/issue-credential-2.0/send-offer",
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
      }
    } catch (error) {
      res.status(404).json({
        data: null,
        status: `${error}`,
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

function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

const getCredentialRequests = async (req, res) => {
  try {
    const { fromDate, toDate, refNO } = req.query;
    try {
      const requests = await axios.get(
        blockchainURL + issueCreds + `?state=offer-sent`
      );

      const latestRequests = requests.data.results.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return (
          new Date(b.cred_ex_record.created_at) -
          new Date(a.cred_ex_record.created_at)
        );
      });
      let pageNumber = req.query.pageNumber;
      // condition 1 - Data based on date range.
      if (fromDate && toDate && fromDate !== "" && toDate !== "") {
        let d1 = fromDate.split("/");
        let d2 = toDate.split("/");
        var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]); // -1 because months are from 0 to 11
        var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
        const rangeData = latestRequests.filter((item, index) => {
          let date = new Date(item.cred_ex_record.created_at);
          const yyyy = date.getFullYear();
          let mm = date.getMonth() + 1;
          let dd = date.getDate();
          let d = `${dd}/${mm}/${yyyy}`;
          let d3 = d.split("/");
          let check = new Date(d3[2], parseInt(d3[1]) - 1, d3[0]);
          if (check >= from && check <= to) {
            return item;
          }
        });
        if (latestRequests.length < 10) {
          rangePageSize = 5;
        } else {
          rangePageSize = latestRequests.length / 10;
        }
        const credRangeData = await paginate(
          rangeData,
          rangePageSize,
          pageNumber
        );
        const paginatedRangeCreds =
          credRangeData.length !== 0
            ? credRangeData
            : `Total credential requests ${credData.latestRequests.length} are rendered!`;

        if (refNO) {
          const refNoData = credRangeData.filter((item) => {
            if (
              item.cred_ex_record.cred_offer.credential_preview.attributes[0][
                "value"
              ] === refNO
            ) {
              return item;
            }
          });
          res.status(200).json({
            data: refNoData,
            status: "Data Found!",
          });
        } else {
          res.status(200).json({
            data: paginatedRangeCreds,
            status: "Data Found!",
          });
        }
      }
      //condition 2 - Data based latest data
      else {
        let pageSize;
        if (latestRequests.length < 10) {
          pageSize = 5;
        } else {
          pageSize = latestRequests.length / 10;
        }
        const credData = await paginate(latestRequests, pageSize, pageNumber);
        const paginatedCreds =
          credData.length !== 0
            ? credData
            : `Total credential requests ${credData.latestRequests.length} are rendered!`;

        if (refNO) {
          const refNoData = paginatedCreds.filter((item) => {
            if (
              item.cred_ex_record.cred_offer.credential_preview.attributes[0][
                "value"
              ] === refNO
            ) {
              return item;
            }
          });
          res.status(200).json({
            data: refNoData,
            status: "Data Found!",
          });
        } else {
          res.status(200).json({
            data: paginatedCreds,
            status: "Data Found!",
          });
        }
      }
    } catch (error) {
      res.status(404).json({
        data: [],
        status: "Max Data limit reached!",
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error,
    });
  }
};

const getCredOffers = async (req, res) => {
  try {
    const { fromDate, toDate, refNO } = req.query;
    try {
      const requests = await axios.get(
        holderBlockchainURL + issueCreds + `?state=offer-received`
      );
      const latestRequests = requests.data.results.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return (
          new Date(b.cred_ex_record.created_at) -
          new Date(a.cred_ex_record.created_at)
        );
      });
      let pageNumber = req.query.pageNumber;
      // condition 1 - Data based on date range.
      if (fromDate && toDate && fromDate !== "" && toDate !== "") {
        let d1 = fromDate.split("/");
        let d2 = toDate.split("/");
        var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]); // -1 because months are from 0 to 11
        var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
        const rangeData = requests.data.results.filter((item, index) => {
          let date = new Date(item.cred_ex_record.created_at);
          const yyyy = date.getFullYear();
          let mm = date.getMonth() + 1;
          let dd = date.getDate();
          let d = `${dd}/${mm}/${yyyy}`;
          let d3 = d.split("/");
          let check = new Date(d3[2], parseInt(d3[1]) - 1, d3[0]);
          if (check >= from && check <= to) {
            return item;
          }
        });

        let rangePageSize;
        if (latestRequests.length < 10) {
          rangePageSize = 5;
        } else {
          rangePageSize = latestRequests.length / 10;
        }
        const credRangeData = await paginate(
          rangeData,
          rangePageSize,
          pageNumber
        );
        const paginatedRangeCreds =
          credRangeData.length !== 0
            ? credRangeData
            : `Total credential requests ${credData.latestRequests.length} are rendered!`;

        if (refNO) {
          const refNoData = credRangeData.filter((item) => {
            if (
              item.cred_ex_record.cred_offer.credential_preview.attributes[0][
                "value"
              ] === refNO
            ) {
              return item;
            }
          });
          res.status(200).json({
            data: refNoData,
            status: "Data Found!",
          });
        } else {
          res.status(200).json({
            data: paginatedRangeCreds,
            status: "Data Found!",
          });
        }
      }
      //condition 2 - Data based latest data
      else {
        let pageSize;
        if (latestRequests.length < 10) {
          pageSize = 5;
        } else {
          pageSize = latestRequests.length / 10;
        }
        const credData = await paginate(latestRequests, pageSize, pageNumber);
        const paginatedCreds =
          credData.length !== 0
            ? credData
            : `Total credential requests ${credData.latestRequests.length} are rendered!`;

        if (refNO) {
          const refNoData = paginatedCreds.filter((item) => {
            if (
              item.cred_ex_record.cred_offer.credential_preview.attributes[0][
                "value"
              ] === refNO
            ) {
              return item;
            }
          });
          res.status(200).json({
            data: refNoData,
            status: "Data Found!",
          });
        } else {
          res.status(200).json({
            data: paginatedCreds,
            status: "Data Found!",
          });
        }
      }
    } catch (error) {
      res.status(404).json({
        data: [],
        status: "Max Data limit reached!",
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error,
    });
  }
};

const getCredReceivedRequests = async (req, res) => {
  try {
    const { fromDate, toDate, refNO } = req.query;
    try {
      const requests = await axios.get(
        blockchainURL + issueCreds + `?state=request-received`
      );

      const latestRequests = requests.data.results.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return (
          new Date(b.cred_ex_record.created_at) -
          new Date(a.cred_ex_record.created_at)
        );
      });
      let pageNumber = req.query.pageNumber;
      // condition 1 - Data based on date range.
      if (fromDate && toDate && fromDate !== "" && toDate !== "") {
        let d1 = fromDate.split("/");
        let d2 = toDate.split("/");
        var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]); // -1 because months are from 0 to 11
        var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
        const rangeData = latestRequests.filter((item, index) => {
          let date = new Date(item.cred_ex_record.created_at);
          const yyyy = date.getFullYear();
          let mm = date.getMonth() + 1;
          let dd = date.getDate();
          let d = `${dd}/${mm}/${yyyy}`;
          let d3 = d.split("/");
          let check = new Date(d3[2], parseInt(d3[1]) - 1, d3[0]);
          if (check >= from && check <= to) {
            return item;
          }
        });
        if (latestRequests.length < 10) {
          rangePageSize = 5;
        } else {
          rangePageSize = latestRequests.length / 10;
        }
        const credRangeData = await paginate(
          rangeData,
          rangePageSize,
          pageNumber
        );
        const paginatedRangeCreds =
          credRangeData.length !== 0
            ? credRangeData
            : `Total credential requests ${credData.latestRequests.length} are rendered!`;

        if (refNO) {
          const refNoData = credRangeData.filter((item) => {
            if (
              item.cred_ex_record.cred_offer.credential_preview.attributes[0][
                "value"
              ] === refNO
            ) {
              return item;
            }
          });
          res.status(200).json({
            data: refNoData,
            status: "Data Found!",
          });
        } else {
          res.status(200).json({
            data: paginatedRangeCreds,
            status: "Data Found!",
          });
        }
      }
      //condition 2 - Data based latest data
      else {
        let pageSize;
        if (latestRequests.length < 10) {
          pageSize = 5;
        } else {
          pageSize = latestRequests.length / 10;
        }
        const credData = await paginate(latestRequests, pageSize, pageNumber);
        const paginatedCreds =
          credData.length !== 0
            ? credData
            : `Total credential requests ${credData.latestRequests.length} are rendered!`;

        if (refNO) {
          const refNoData = paginatedCreds.filter((item) => {
            if (
              item.cred_ex_record.cred_offer.credential_preview.attributes[0][
                "value"
              ] === refNO
            ) {
              return item;
            }
          });
          res.status(200).json({
            data: refNoData,
            status: "Data Found!",
          });
        } else {
          res.status(200).json({
            data: paginatedCreds,
            status: "Data Found!",
          });
        }
      }
    } catch (error) {
      res.status(404).json({
        data: [],
        status: "Max Data limit reached!",
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error,
    });
  }
};

const getCredIssued = async (req, res) => {
  try {
    const { fromDate, toDate, refNO } = req.query;
    try {
      const requests = await axios.get(
        holderBlockchainURL + issueCreds + `?state=credential-received`
      );
      console.log("requests", requests);
      if(requests.data.results.length === 0) {return res.status(404).json({ status: "Data not Found!"})}
      const latestRequests = requests.data.results.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return (
          new Date(b.cred_ex_record.updated_at) -
          new Date(a.cred_ex_record.updated_at)
        );
      });
      let pageNumber = req.query.pageNumber;
      if (fromDate && toDate && fromDate !== "" && toDate !== "") {
        let d1 = fromDate.split("/");
        let d2 = toDate.split("/");
        var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]); // -1 because months are from 0 to 11
        var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
        const rangeData = latestRequests.filter((item, index) => {
          let date = new Date(item.cred_ex_record.created_at);
          const yyyy = date.getFullYear();
          let mm = date.getMonth() + 1;
          let dd = date.getDate();
          let d = `${dd}/${mm}/${yyyy}`;
          let d3 = d.split("/");
          let check = new Date(d3[2], parseInt(d3[1]) - 1, d3[0]);
          if (check >= from && check <= to) {
            return item;
          }
        });
        if (latestRequests.length < 10) {
          rangePageSize = 5;
        } else {
          rangePageSize = latestRequests.length / 10;
        }
        const credRangeData = await paginate(
          rangeData,
          rangePageSize,
          pageNumber
        );
        const paginatedRangeCreds =
          credRangeData.length !== 0
            ? credRangeData
            : `Total credential requests ${credData.latestRequests.length} are rendered!`;

        if (refNO) {
          const refNoData = credRangeData.filter((item) => {
            if (
              item.cred_ex_record.cred_offer.credential_preview.attributes[0][
                "value"
              ] === refNO
            ) {
              return item;
            }
          });
          res.status(200).json({
            data: refNoData,
            status: "Data Found!",
          });
        } else {
          res.status(200).json({
            data: paginatedRangeCreds,
            status: "Data Found!",
          });
        }
      }
      //condition 2 - Data based latest data
      else {
        let pageSize;
        if (latestRequests.length < 10) {
          pageSize = 5;
        } else {
          pageSize = latestRequests.length / 10;
        }
        const credData = await paginate(latestRequests, pageSize, pageNumber);
        const paginatedCreds =
          credData.length !== 0
            ? credData
            : `Total credential requests ${credData.latestRequests.length} are rendered!`;
        let refNoData;
        if (refNO) {
          refNoData = paginatedCreds.filter((item) => {
            if (
              item.cred_ex_record.cred_offer.credential_preview.attributes[0][
                "value"
              ] === refNO
            ) {
              return item;
            }
          });
          res.status(200).json({
            data: refNoData.length > 0 ? refNoData : paginatedCreds,
          });
        } else {
          res.status(200).json({
            data: paginatedCreds,
          });
        }
      }
    } catch (error) {
      res.status(404).send({
        data: [],
        status: "Max Data limit reached!",
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error,
    });
  }
};

const approveCredentials = async (req, res) => {
  try {
    const postData = req.body;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    try {
      const requests = await axios.post(
        blockchainURL +
          `/issue-credential-2.0/records/${req.body.cred_ex_id}` +
          approveCred,
        postData,
        {
          headers,
        }
      );
      res.status(200).json({
        data: requests.data,
        status: "Credential Issued!",
      });
    } catch (error) {
      res.status(404).json({
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
module.exports = {
  sendProposal,
  sendOffer,
  sendRequest,
  issueCredentials,
  getCredentialRequests,
  getCredOffers,
  getCredReceivedRequests,
  getCredIssued,
  approveCredentials,
};

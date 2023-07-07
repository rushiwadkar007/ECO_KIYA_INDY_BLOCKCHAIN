require("dotenv").config();

const axios = require("axios");

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
        connection_id: "ff8cb58a-fe61-4b1d-b6b8-6d548b3f3478",
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
          if (check > from && check < to) {
            return item;
          }
        });
        const rangePageSize = rangeData.length / 5;
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
            return item;
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
            return item;
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
        const rangeData = latestRequests.filter((item, index) => {
          let date = new Date(item.cred_ex_record.created_at);
          const yyyy = date.getFullYear();
          let mm = date.getMonth() + 1;
          let dd = date.getDate();
          let d = `${dd}/${mm}/${yyyy}`;
          let d3 = d.split("/");
          let check = new Date(d3[2], parseInt(d3[1]) - 1, d3[0]);
          if (check > from && check < to) {
            return item;
          }
        });
        const rangePageSize = rangeData.length / 5;
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
            return item;
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
            return item;
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
          if (check > from && check < to) {
            return item;
          }
        });
        const rangePageSize = rangeData.length / 5;
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
            return item;
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
            return item;
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
          if (check > from && check < to) {
            return item;
          }
        });
        const rangePageSize = rangeData.length / 5;
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
            return item;
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
            return item;
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
      requests;
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
    console.log(
      blockchainURL +
        `/issue-credential-2.0/records/${req.body.cred_ex_id}` +
        approveCred
    );
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
      console.log('requests ',requests);
      res.status(200).json({
        data:requests.data,
        status: "Credential Issued!"
      })
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

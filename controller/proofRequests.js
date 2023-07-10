require("dotenv").config();

const axios = require("axios");

const blockchainURL = process.env.Indy_Blockchain_STEWARDURL;

const holderBlockchainURL = process.env.Indy_Blockchain_HOLDERURL;

const verifierBlockchainURL = process.env.Indy_Blockchain_VERIFIERURL;

const { proofRequests } = require("../endpoints/blockchainEndpoints");

function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

const getCredentialProofSentRequests = async (req, res) => {
  try {
    const { fromDate, toDate, refNO } = req.query;
    console.log(verifierBlockchainURL + proofRequests + `?state=request-sent`);
    try {
      const requests = await axios.get(
        verifierBlockchainURL + proofRequests + `?state=request-sent`
      );      
      console.log("requests", requests.data.results);
      const latestRequests = requests.data.results.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return (
          new Date(b.created_at) -
          new Date(a.created_at)
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
          let date = new Date(item.created_at);
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
        console.log("rangeData", rangeData);
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

const getCredentialProofReceivedRequests = async (req, res) => {
    try {
      const { fromDate, toDate, refNO } = req.query;
      console.log(verifierBlockchainURL + proofRequests + `?state=request-received`);
      try {
        const requests = await axios.get(
          verifierBlockchainURL + proofRequests + `?state=request-received`
        );      
        console.log("requests", requests.data.results);
        const latestRequests = requests.data.results.sort(function (a, b) {
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return (
            new Date(b.created_at) -
            new Date(a.created_at)
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
            let date = new Date(item.created_at);
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
          console.log("rangeData", rangeData);
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

module.exports = {getCredentialProofSentRequests, getCredentialProofReceivedRequests}

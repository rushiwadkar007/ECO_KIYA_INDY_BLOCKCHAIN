// Create Connection
const createConnRequest = `/out-of-band/create-invitation`;
const receiveConnRequest = `/out-of-band/receive-invitation`;
const fetchConnectionMetadata = `/connections/fetchMetadata`;
const acceptConnRequest = `/connections/accept-invitation`;
// Schema Creation
const createSchema = `/schemas`;
const getSchema = `/schemas`;

// Schema Definition
const createSchemaDef = `/credential-definitions`;

// Issue-Credential and Credential Exchange
const sendProposalHolder = `/issue-credential-2.0/send-proposal`;
const sendOfferIssuer = `/issue-credential-2.0/send-offer`;
const sendRequestHolder = `/issue-credential-2.0/send-request`;
const issueCreds = `/issue-credential-2.0/records`;
const approveCred = `/issue`;
const storeCredentials = `/issue-credential-2.0/store-credentials`;
const proofRequests = `/present-proof-2.0/records`;

// Credential Revocation APIs

// Credential Proof Presentation

// wallet APIs

// Ledger APIs
module.exports = {
  createConnRequest,
  createSchemaDef,
  getSchema,
  approveCred,
  proofRequests,
  receiveConnRequest,
  acceptConnRequest,
  fetchConnectionMetadata,
  createSchema,
  sendProposalHolder,
  sendOfferIssuer,
  sendRequestHolder,
  issueCreds,
  storeCredentials,
};

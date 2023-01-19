import { canisterId } from "src/declarations/website";

export const environment = {
    production: true,
    identityUrl: 'https://identity.ic0.app/#authorize',
    websiteCanisterUrl: `http://${canisterId}.ic0.app`,
    envName: 'PROD'
};

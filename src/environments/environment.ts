import { canisterId as IICanisterId } from '../declarations/internet_identity';
import { canisterId as websiteCanisterId } from "src/declarations/website";

export const environment = {
    production: false,
    identityUrl: `http://${IICanisterId}.localhost:4943/#authorize`,
    websiteCanisterUrl: `http://${websiteCanisterId}.localhost:4943/`,
    envName: 'DEV'
};

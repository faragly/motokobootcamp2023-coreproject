import { canisterId } from '../declarations/internet_identity';

export const environment = {
    production: false,
    identityUrl: `http://${canisterId}.localhost:4943/#authorize`,
    envName: 'DEV'
};

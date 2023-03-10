const path = require('path');
const webpack = require('webpack');

let localCanisters, prodCanisters, canisters;

const network = process.env.DFX_NETWORK || (process.env.NODE_ENV === 'production' ? 'ic' : 'local');

function initCanisterIds() {
    try {
        localCanisters = require(path.resolve('.dfx', 'local', 'canister_ids.json'));
    } catch (error) {
        console.log('No local canister_ids.json found. Continuing production');
    }

    try {
        prodCanisters = require(path.resolve('canister_ids.json'));
    } catch (error) {
        console.log('No production canister_ids.json found. Continuing with local');
    }

    canisters = network === 'local' ? localCanisters : prodCanisters;

    for (const canister in canisters) {
        if (canisters.hasOwnProperty(canister)) {
            process.env[canister.toUpperCase() + '_CANISTER_ID'] = canisters[canister][network];
        }
    }
}

initCanisterIds();

const canister_ids = {
    DAO_CANISTER_ID: canisters['dao'],
    INTERNET_IDENTITY_CANISTER_ID: canisters['internet_identity'],
    WEBSITE_CANISTER_ID: canisters['website'],
    MBT_LEDGER_CANISTER_ID: canisters['mbt_ledger']
};

module.exports = {
    node: { global: true },
    resolve: {
        fallback: {
            assert: require.resolve('assert'),
            stream: require.resolve('stream-browserify')
        }
    },
    plugins: [
        new webpack.EnvironmentPlugin(canister_ids),
        new webpack.ProvidePlugin({
            Buffer: [require.resolve('buffer'), 'Buffer'],
            process: require.resolve('process/browser')
        })
    ]
};

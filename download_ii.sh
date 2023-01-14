#!/bin/bash

II_RELEASE=release-2022-12-01
mkdir -p src/backend/internet_identity
cd src/backend/internet_identity
curl -sSL "https://github.com/dfinity/internet-identity/releases/download/$II_RELEASE/internet_identity_dev.wasm" -o internet_identity.wasm
curl -sSL "https://github.com/dfinity/internet-identity/releases/download/$II_RELEASE/internet_identity.did" -o internet_identity.did
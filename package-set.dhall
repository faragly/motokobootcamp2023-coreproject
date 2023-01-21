let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.7.5-20230118/package-set.dhall sha256:3898b1cb55eddc69be8edf5c5edae6c4e12032382ae762dcda42fee30cd9cc5b
let aviate-labs = https://github.com/aviate-labs/package-set/releases/download/v0.1.8/package-set.dhall sha256:9ab42c1f732299dc8c1f631d39ea6a2551414bf6efc8bbde4e11e36ebc6d7edd

let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let additions =
  [
    { name = "base"
    , repo = "https://github.com/dfinity/motoko-base"
    , version = "f602517f9e397e7ed404ad1b07e90d0562fc458a" -- Motoko 0.7.5 + timers
    , dependencies = [] : List Text
    },
  ] : List Package

in  upstream # aviate-labs # additions

let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.7.3-20221102/package-set.dhall sha256:9c989bdc496cf03b7d2b976d5bf547cfc6125f8d9bb2ed784815191bd518a7b9
let aviate-labs = https://github.com/aviate-labs/package-set/releases/download/v0.1.8/package-set.dhall sha256:9ab42c1f732299dc8c1f631d39ea6a2551414bf6efc8bbde4e11e36ebc6d7edd

let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let additions =
  [
    { name = "base"
    , repo = "https://github.com/dfinity/motoko-base"
    , version = "b2e6e5841d55858f883c12707e530bf1f75699c5"
    , dependencies = [] : List Text
    },
    { name = "io"
    , repo = "https://github.com/aviate-labs/io.mo"
    , version = "v0.3.1"
    , dependencies = [ "base" ]
    },
    { name = "rand"
    , repo = "https://github.com/aviate-labs/rand.mo"
    , version = "v0.2.2"
    , dependencies = [ "base", "encoding", "io" ]
    },
    { name = "uuid"
    , repo = "https://github.com/aviate-labs/uuid.mo"
    , version = "main"
    , dependencies = [ "base", "encoding", "io" ]
    }
  ] : List Package

in  upstream # aviate-labs # additions

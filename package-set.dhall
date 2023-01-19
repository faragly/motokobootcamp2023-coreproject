let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.7.5-20230118/package-set.dhall sha256:3898b1cb55eddc69be8edf5c5edae6c4e12032382ae762dcda42fee30cd9cc5b
let aviate-labs = https://github.com/aviate-labs/package-set/releases/download/v0.1.8/package-set.dhall sha256:9ab42c1f732299dc8c1f631d39ea6a2551414bf6efc8bbde4e11e36ebc6d7edd

let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let additions =
  [
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
    },
    { name = "crypto"
    , repo = "https://github.com/aviate-labs/crypto.mo"
    , version = "main"
    , dependencies = [ "base", "encoding" ]
    }
  ] : List Package

in  upstream # aviate-labs # additions

import Text "mo:base/Text";
import Principal "mo:base/Principal";
import CertifiedData "mo:base/CertifiedData";
import Base64 "mo:encoding/Base64";
import DAO "canister:dao";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import HTTP "../dao/types/http.types";
import Types "types";
import Utils "utils";

// Data certification uses the implementation from https://github.com/nomeata/motoko-certified-http.
// A small refactoring was made and a third-party base64 library was connected
// Thanks to nomeata and di-wu!

actor Website {
    type HttpRequest = HTTP.HttpRequest;
    type HttpResponse = HTTP.HttpResponse;
    type HeaderField = HTTP.HeaderField;
    type HashTree = Types.HashTree;

    stable var text : Text = "Hello, world!";
    let headers : [HeaderField] = [("content-type", "text/plain")];

    public query func http_request(req : HttpRequest) : async HttpResponse {
        switch (req) {
            case ({ method = "GET"; url = "/" }) {
                let headersBuffer = Buffer.fromArray<HeaderField>(headers);
                headersBuffer.add(certificationHeader());
                {
                    body = Text.encodeUtf8(text);
                    headers = Buffer.toArray(headersBuffer);
                    status_code = 200;
                    streaming_strategy = null;
                };
            };
            case _ {
               {
                    status_code = 404;
                    headers;
                    body = "404 Not found.\n This canister only serves /.\n";
                    streaming_strategy = null;
                }
            };
        };
    };

    public shared({ caller }) func setText(newText : Text) : async () {
        assert Principal.equal(caller, Principal.fromActor(DAO));
        text := newText;
        updateAssetHash();
    };

    func updateAssetHash() {
        CertifiedData.set(Utils.hashTree(assetTree()));
    };

    func certificationHeader() : HeaderField {
        let cert = switch (CertifiedData.getCertificate()) {
            case (?c) c;
            case null {
                // unfortunately, we cannot do
                //   throw Error.reject("getCertificate failed. Call this as a query call!")
                // here, because this function isn’t async, but we can’t make it async
                // because it is called from a query (and it would do the wrong thing) :-(
                //
                // So just return erronous data instead
                "getCertificate failed. Call this as a query call!" : Blob
            }
        };

        let bytes = Blob.toArray(cert);
        let encodedCert : Text = Utils.arrayToText(Base64.StdEncoding.encode(bytes));
        let tree = Utils.cborTree(assetTree());
        let encodedTree : Text = Utils.arrayToText(Base64.StdEncoding.encode(tree));

        ("ic-certificate", "certificate=:" # encodedCert # ":, " # "tree=:" # encodedTree # ":");
    };

    func assetTree() : HashTree {
        #labeled ("http_assets",
            #labeled ("/",
                #leaf (Utils.h(Text.encodeUtf8(text)))
            )
        );
    };

    system func postupgrade() {
        updateAssetHash();
    };
}
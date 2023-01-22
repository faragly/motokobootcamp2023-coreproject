import Array "mo:base/Array";
import Char "mo:base/Char";
import Iter "mo:base/Iter";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import SHA256 "mo:crypto/SHA/SHA256";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Types "types";

module {
    type Hash = Types.Hash;
    type HashTree = Types.HashTree;
    
    public func arrayToText(xs : [Nat8]) : Text {
        Text.fromIter(Iter.fromArray(
            Array.map<Nat8, Char>(
                xs,
                func (n : Nat8) : Char {
                    Char.fromNat32(Nat32.fromNat(Nat8.toNat(n)))
                },
            ),
        ));
    };

    /*
    Helpers for hashing one, two or three blobs:
    These can hopefully be simplified once https://github.com/dfinity-lab/motoko/issues/966 is resolved.
    */

    public func h(b1 : Blob) : Blob {
        let d = SHA256.New();
        d.write(Blob.toArray(b1));
        Blob.fromArray(d.sum([]));
    };

    public func h2(b1 : Blob, b2 : Blob) : Blob {
        let d = SHA256.New();
        d.write(Blob.toArray(b1));
        d.write(Blob.toArray(b2));
        Blob.fromArray(d.sum([]));
    };

    public func h3(b1 : Blob, b2 : Blob, b3 : Blob) : Blob {
        let d = SHA256.New();
        d.write(Blob.toArray(b1));
        d.write(Blob.toArray(b2));
        d.write(Blob.toArray(b3));
        Blob.fromArray(d.sum([]));
    };

    /*
    The root hash of a HashTree. This is the algorithm `reconstruct` described in
    https://sdk.dfinity.org/docs/interface-spec/index.html#_certificate
    */

    public func hashTree(t : HashTree) : Hash {
        switch (t) {
            case (#empty) h("\11ic-hashtree-empty");
            case (#fork(t1,t2)) h3("\10ic-hashtree-fork", hashTree(t1), hashTree(t2));
            case (#labeled(l,t)) h3("\13ic-hashtree-labeled", l, hashTree(t));
            case (#leaf(v)) h2("\10ic-hashtree-leaf", v);
            case (#pruned(h)) h;
        }
    };


    /*
    The CBOR encoding of a HashTree, according to
    https://sdk.dfinity.org/docs/interface-spec/index.html#certification-encoding
    This data structure needs only very few features of CBOR, so instead of writing
    a full-fledged CBOR encoding library, I just directly write out the bytes for the
    few construct we need here.
    */

    public func cborTree(tree : HashTree) : [Nat8] {
        let buf = Buffer.Buffer<Nat8>(100);

        // CBOR self-describing tag
        buf.add(0xD9);
        buf.add(0xD9);
        buf.add(0xF7);

        func add_blob(b: Blob) {
            // Only works for blobs with less than 256 bytes
            buf.add(0x58);
            buf.add(Nat8.fromNat(b.size()));
            for (c in Blob.toArray(b).vals()) {
                buf.add(c);
            };
        };

        func go(t : HashTree) {
            switch (t) {
                case (#empty)         { buf.add(0x81); buf.add(0x00); };
                case (#fork(t1, t2))  { buf.add(0x83); buf.add(0x01); go(t1); go (t2); };
                case (#labeled(l, t)) { buf.add(0x83); buf.add(0x02); add_blob(l); go (t); };
                case (#leaf(v))       { buf.add(0x82); buf.add(0x03); add_blob(v); };
                case (#pruned(h))     { buf.add(0x82); buf.add(0x04); add_blob(h); }
            }
        };

        go(tree);

        Buffer.toArray<Nat8>(buf);
    };
}
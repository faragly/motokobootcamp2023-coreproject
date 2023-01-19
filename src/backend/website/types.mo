module {
    public type Hash = Blob;
    type Key = Blob;
    type Value = Blob;

    public type HashTree = {
        #empty;
        #pruned : Hash;
        #fork : (HashTree, HashTree);
        #labeled : (Key, HashTree);
        #leaf : Value;
    };
}
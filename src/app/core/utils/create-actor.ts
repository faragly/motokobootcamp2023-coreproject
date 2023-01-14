import { Actor, ActorSubclass, Identity } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { createAgent } from "@dfinity/utils";
import { from, map, Observable } from "rxjs";
import { environment } from "src/environments/environment";

export function createActor<T>({
    identity,
    canisterId,
    idlFactory
}: {
    identity: Identity;
    canisterId: string | Principal;
    idlFactory: IDL.InterfaceFactory;
}): Observable<ActorSubclass<T>> {
    return from(createAgent({ identity, fetchRootKey: !environment.production })).pipe(map(agent =>
        Actor.createActor<T>(idlFactory, {
            agent,
            canisterId
        })
    ));
};
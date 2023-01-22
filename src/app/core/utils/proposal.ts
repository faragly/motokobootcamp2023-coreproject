import { IDL } from "@dfinity/candid";
import { fromNullable } from "@dfinity/utils";
import { keys, head, isNull, isUndefined } from "lodash";
import { ModifyParamsPayload, ProposalPayload as ProposalPayloadRaw, ProposalState as ProposalStateRaw } from "src/declarations/dao/dao.did";
import { ProposalState, ProposalPayload } from "../models";

export const toProposalState = (state: ProposalStateRaw): ProposalState => {
    return head(keys(state)) as ProposalState;
};

const knownCandidTypes = [
    {
        type: [
            IDL.Record({
                proposalCreateThreshold: IDL.Opt(IDL.Nat),
                proposalAcceptThreshold: IDL.Opt(IDL.Nat),
                proposalVoteThreshold: IDL.Opt(IDL.Nat),
            })
        ],
        cb: (type: [ModifyParamsPayload]): string => {
            let output = '( record { ';
            for (const [key, value] of Object.entries(type[0])) {
                const v = fromNullable(value);
                output += `${key} = ${isUndefined(v) ? 'null; ' : 'opt ' + v + '; '}`
            }
            return output + '} )';
        }
    },
    {
        type: [IDL.Text],
        cb: (type: string) => `("${type}")`
    }
];

const decodeCandidBlob = (type: IDL.Type<any>[], data: ArrayBuffer, cb: (v: any) => string) => {
    try {
        let decoded = IDL.decode(type, data);
        return cb(decoded);
    } catch(err) {
        return null;
    }
};

export const convertProposalPayload = (payload: ProposalPayloadRaw): ProposalPayload => {
    let decoded = null;

    for(let i = 0; i < knownCandidTypes.length; i++) {
        decoded = decodeCandidBlob(knownCandidTypes[i].type, Buffer.from(payload.data), knownCandidTypes[i].cb);
        if (!isNull(decoded)) {
            break;
        }
    }
    
    return {
        canisterId: payload.canisterId.toText(),
        method: payload.method,
        data: decoded ?? ''
    };
};
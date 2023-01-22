import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type List = [] | [[Principal, List]];
export interface ModifyParamsPayload {
  'proposalCreateThreshold' : [] | [Tokens],
  'proposalAcceptThreshold' : [] | [Tokens],
  'proposalVoteThreshold' : [] | [Tokens],
}
export interface Params {
  'proposalCreateThreshold' : Tokens,
  'proposalAcceptThreshold' : Tokens,
  'proposalVoteThreshold' : Tokens,
}
export interface Proposal {
  'id' : bigint,
  'owner' : Principal,
  'votesYes' : Tokens,
  'createdAt' : Time,
  'voters' : List,
  'state' : ProposalState,
  'votesNo' : Tokens,
  'payload' : ProposalPayload__1,
}
export interface ProposalPayload {
  'method' : string,
  'data' : Uint8Array | number[],
  'canisterId' : Principal,
}
export interface ProposalPayload__1 {
  'method' : string,
  'data' : Uint8Array | number[],
  'canisterId' : Principal,
}
export type ProposalState = { 'open' : null } |
  { 'rejected' : null } |
  { 'executing' : null } |
  { 'accepted' : null } |
  { 'failed' : string } |
  { 'succeeded' : null };
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Time = bigint;
export type Tokens = bigint;
export type Vote = { 'no' : null } |
  { 'yes' : null };
export interface VoteArgs { 'vote' : Vote, 'proposalId' : bigint }
export interface _SERVICE {
  'getAllProposals' : ActorMethod<[], Array<Proposal>>,
  'getParameters' : ActorMethod<[], Params>,
  'getProposal' : ActorMethod<[bigint], [] | [Proposal]>,
  'modifyParameters' : ActorMethod<[ModifyParamsPayload], undefined>,
  'submitProposal' : ActorMethod<[ProposalPayload], undefined>,
  'vote' : ActorMethod<[VoteArgs], Result>,
}

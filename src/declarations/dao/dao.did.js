export const idlFactory = ({ IDL }) => {
  const List = IDL.Rec();
  const Tokens = IDL.Nat;
  const Time = IDL.Int;
  List.fill(IDL.Opt(IDL.Tuple(IDL.Principal, List)));
  const ProposalState = IDL.Variant({
    'open' : IDL.Null,
    'rejected' : IDL.Null,
    'executing' : IDL.Null,
    'accepted' : IDL.Null,
    'failed' : IDL.Text,
    'succeeded' : IDL.Null,
  });
  const ProposalPayload__1 = IDL.Record({
    'method' : IDL.Text,
    'data' : IDL.Vec(IDL.Nat8),
    'canisterId' : IDL.Principal,
  });
  const Proposal = IDL.Record({
    'id' : IDL.Nat,
    'owner' : IDL.Principal,
    'votesYes' : Tokens,
    'createdAt' : Time,
    'voters' : List,
    'state' : ProposalState,
    'votesNo' : Tokens,
    'payload' : ProposalPayload__1,
  });
  const Params = IDL.Record({
    'proposalCreateThreshold' : Tokens,
    'proposalAcceptThreshold' : Tokens,
    'proposalVoteThreshold' : Tokens,
  });
  const ModifyParamsPayload = IDL.Record({
    'proposalCreateThreshold' : IDL.Opt(Tokens),
    'proposalAcceptThreshold' : IDL.Opt(Tokens),
    'proposalVoteThreshold' : IDL.Opt(Tokens),
  });
  const ProposalPayload = IDL.Record({
    'method' : IDL.Text,
    'data' : IDL.Vec(IDL.Nat8),
    'canisterId' : IDL.Principal,
  });
  const Vote = IDL.Variant({ 'no' : IDL.Null, 'yes' : IDL.Null });
  const VoteArgs = IDL.Record({ 'vote' : Vote, 'proposalId' : IDL.Nat });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  return IDL.Service({
    'getAllProposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'getParameters' : IDL.Func([], [Params], ['query']),
    'getProposal' : IDL.Func([IDL.Nat], [IDL.Opt(Proposal)], ['query']),
    'modifyParameters' : IDL.Func([ModifyParamsPayload], [], []),
    'submitProposal' : IDL.Func([ProposalPayload], [], []),
    'vote' : IDL.Func([VoteArgs], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };

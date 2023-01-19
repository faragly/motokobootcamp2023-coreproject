export const idlFactory = ({ IDL }) => {
  const Proposal = IDL.Record({});
  return IDL.Service({
    'account_balance' : IDL.Func([], [IDL.Nat], []),
    'get_all_proposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };

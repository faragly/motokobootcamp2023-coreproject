import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type Proposal = {};
export interface _SERVICE {
  'account_balance' : ActorMethod<[], bigint>,
  'get_all_proposals' : ActorMethod<[], Array<Proposal>>,
}

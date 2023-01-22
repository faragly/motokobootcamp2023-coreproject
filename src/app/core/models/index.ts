export type ProposalState = 'open' | 'rejected' | 'executing' | 'accepted' | 'failed' | 'succeeded';

export type Vote = { id: number, vote: 'yes' | 'no' };

export type ProposalPayload = {
    canisterId: string;
    method: string;
    data: string;
};

export type Proposal = {
    id: number;
    // voters: string[];
    owner: string;
    votesYes: number;
    votesNo: number;
    createdAt: Date;
    state: ProposalState;
    payload: ProposalPayload;
};
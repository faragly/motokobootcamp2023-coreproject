import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { AsyncSubject, BehaviorSubject, combineLatest, filter, map, Observable, shareReplay, startWith, switchMap, takeUntil } from 'rxjs';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import { arrayBufferToUint8Array } from '@dfinity/utils';
import { compact, defaults, get, has, pick } from 'lodash';

import { canisterId as websiteCanisterId } from 'src/declarations/website';
import { ModifyParamsPayload, ProposalPayload } from 'src/declarations/dao/dao.did';
import { canisterId as daoCanisterId } from 'src/declarations/dao';
import { ProposalsService } from '../core/services/proposals.service';
import { AUTH_RX_STATE } from '../core/stores/auth';

type ParameterOption = { value: keyof ModifyParamsPayload; label: string; disabled: boolean };

@Component({
  selector: 'app-create-proposal',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatSelectModule, MatFormFieldModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './create-proposal.component.html',
  styleUrls: ['./create-proposal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateProposalComponent implements OnInit, OnDestroy {
  private authState = inject(AUTH_RX_STATE);
  private destroyed: AsyncSubject<void> = new AsyncSubject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private proposalsService = inject(ProposalsService);
  private fb = inject(FormBuilder);
  textControl = new FormControl('', [Validators.required])
  loading$ = this.proposalsService.select('loading', 'submit');
  parameters: BehaviorSubject<ParameterOption[]> = new BehaviorSubject<ParameterOption[]>([
    { value: 'proposalCreateThreshold', label: 'Proposal create threshold', disabled: false },
    { value: 'proposalVoteThreshold', label: 'Proposal vote threshold', disabled: false },
    { value: 'proposalAcceptThreshold', label: 'Proposal accept threshold', disabled: false }
  ]);
  daoParamsForm = this.fb.group({
    params: this.fb.array([this.createParameter()], Validators.required)
  });
  parameters$: Observable<ParameterOption[]> = combineLatest([
    this.parameters.asObservable(),
    this.daoParamsForm.valueChanges.pipe(map(value => compact(value.params?.map(({ parameter }) => parameter))), startWith([])),
  ]).pipe(map(([params, selected]) => params.map(item => ({ ...item, disabled: (selected as string[]).includes(item.value) }))), shareReplay(1));
  get params(): FormArray {
    return this.daoParamsForm.get('params') as FormArray;
  }

  createParameter(): FormGroup {
    return this.fb.group({
      parameter: [null, Validators.required],
      value: [null, Validators.required]
    })
  }

  addParameter() {
    this.params.push(this.createParameter());
  }

  deleteParameter(index: number) {
    this.params.removeAt(index);
  }

  handleSubmitDAOParamsProposal() {
    const data = arrayBufferToUint8Array(IDL.encode(
      [IDL.Record({
        proposalCreateThreshold: IDL.Opt(IDL.Nat),
        proposalAcceptThreshold: IDL.Opt(IDL.Nat),
        proposalVoteThreshold: IDL.Opt(IDL.Nat),
      })],
      [
        defaults(this.daoParamsForm.value.params?.reduce((result, { parameter, value }) => {
          result[parameter] = [BigInt(value)];
          return result;
        }, {}), {
          proposalCreateThreshold: [],
          proposalAcceptThreshold: [],
          proposalVoteThreshold: [],
        })
      ]
    ));
    const payload: ProposalPayload = {
      method: 'modifyParameters',
      canisterId: Principal.fromText(daoCanisterId),
      data
    };

    this.proposalsService.submit(payload);
  }

  handleSubmitWebsiteProposal() {
    const text = this.textControl.value;
    if (text) {
      const data = arrayBufferToUint8Array(IDL.encode([IDL.Text], [text]));
      const payload: ProposalPayload = {
        method: 'setText',
        canisterId: Principal.fromText(websiteCanisterId),
        data
      };
      this.proposalsService.submit(payload);
    }
  }

  ngOnInit(): void {
    this.authState
      .select('isAuthenticated')
      .pipe(
        filter(isAuthenticated => !isAuthenticated),
        switchMap(() => this.route.queryParams),
        takeUntil(this.destroyed)
      )
      .subscribe(queryParams => {
        const url = has(queryParams, 'redirect') ? get(queryParams, 'redirect') : '/';
        this.router.navigate([url], { queryParams: pick(queryParams, ['internetIdentityUrl', 'canisterId']) });
      });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}

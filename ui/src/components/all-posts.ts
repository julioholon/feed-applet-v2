/* eslint-disable import/extensions */
import { LitElement, html } from 'lit';
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { state, customElement, property } from 'lit/decorators.js';
import { AppAgentClient, AgentPubKey, EntryHash, ActionHash, Record, NewEntryAction } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { Task } from '@lit-labs/task';
import { feedStoreContext } from "../contexts";
import { FeedStore } from "../feed-store";
import '@material/mwc-circular-progress';

import { PostsSignal } from '../types';

import { PostDetail } from './post-detail';

@customElement('all-posts')
export class AllPosts extends ScopedElementsMixin(LitElement) {

  @consume({ context: feedStoreContext, subscribe: true })
  public  feedStore!: FeedStore
  
  @state()
  signaledHashes: Array<ActionHash> = [];
  
  _fetchPosts = new Task(this, ([]) =>
    this.feedStore.fetchAllPosts() as Promise<Array<Record>>
    , () => []);
  
  firstUpdated() {
    // DISABLED FOR NOW
    // this.client.on('signal', signal => {
    //   if (signal.zome_name !== 'posts') return; 
    //   const payload = signal.payload as PostsSignal;
    //   if (payload.type !== 'EntryCreated') return;
    //   if (payload.app_entry.type !== 'Post') return;
    //   this.signaledHashes = [payload.action.hashed.hash, ...this.signaledHashes];
    // });
  }

  static get scopedElements() {
    return {
        'post-detail': PostDetail,
    }
  }

  renderList(hashes: Array<ActionHash>) {
    if (hashes.length === 0) return html`<span>No posts found.</span>`;
    
    return html`
      <div style="display: flex; flex-direction: column">
        ${hashes.map(hash => 
          html`<post-detail .postHash=${hash} style="margin-bottom: 16px;" @post-deleted=${() => { this._fetchPosts.run(); this.signaledHashes = []; } }></post-detail>`
        )}
      </div>
    `;
  }

  render() {
    return this._fetchPosts.render({
      pending: () => html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`,
      complete: (records) => this.renderList([...this.signaledHashes, ...records.map(r => r.signed_action.hashed.hash)]),
      error: (e: any) => html`<span>Error fetching the posts: ${e.data?.data}.</span>`
    });
  }
}

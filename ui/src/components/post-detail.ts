/* eslint-disable import/extensions */
import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { EntryHash, Record, ActionHash, AppAgentClient } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { Task } from '@lit-labs/task';
import { decode } from '@msgpack/msgpack';
import '@material/mwc-circular-progress';
import { IconButton, Snackbar } from '@scoped-elements/material-web';
import { IconButtonToggle } from '@material/mwc-icon-button-toggle';
import { FeedStore } from "../feed-store";
import { feedStoreContext } from "../contexts";

import { EditPost } from './edit-post';

import { Post } from '../types';

@customElement('post-detail')
export class PostDetail extends ScopedElementsMixin(LitElement) {
  @consume({ context: feedStoreContext, subscribe: true })
  public  feedStore!: FeedStore

  @property({
    hasChanged: (newVal: ActionHash, oldVal: ActionHash) => newVal?.toString() !== oldVal?.toString()
  })
  postHash!: ActionHash;

  _fetchRecord = new Task(this, ([postHash]) => this.feedStore.getPost(postHash), () => [this.postHash]);

  @state()
  _editing = false;

  async favorite() {
    try {
      // call sensemaker store to create assessment
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById('errors') as Snackbar;
      errorSnackbar.labelText = `Error assessing the post: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  async deletePost() {
    try {
      await this.feedStore.deletePost(this.postHash);
      this.dispatchEvent(new CustomEvent('post-deleted', {
        bubbles: true,
        composed: true,
        detail: {
          postHash: this.postHash
        }
      }));
      this._fetchRecord.run();
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById('errors') as Snackbar;
      errorSnackbar.labelText = `Error deleting the post: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  static get scopedElements() {
    return {
        'mwc-icon-button': IconButton,
        'mwc-icon-button-toggle': IconButtonToggle,
        'mwc-snackbar': Snackbar,
        'edit-post': EditPost,
    }
  }

  renderDetail(record: Record) {
    const post = decode((record.entry as any).Present.entry) as Post;

    return html`
      <mwc-snackbar id="errors" leading>
      </mwc-snackbar>

      <div style="display: flex; flex-direction: column">
      	<div style="display: flex; flex-direction: row">
          <mwc-icon-button style="margin-left: 8px" icon="edit" @click=${() => { this._editing = true; } }></mwc-icon-button>
          <mwc-icon-button style="margin-left: 8px" icon="delete" @click=${() => this.deletePost()}></mwc-icon-button>
          <mwc-icon-button-toggle style="margin-left: 8px" onIcon="favorite" offIcon="favorite_border"></mwc-icon-button-toggle>
          <mwc-icon-button-toggle style="margin-left: 8px" onIcon="heart_broken" offIcon="heart_broken_outlined"></mwc-icon-button-toggle>
        </div>
        <div style="display: flex; flex-direction: row; margin-bottom: 16px">
 	      <span style="white-space: pre-line">${ post.text }</span>
        </div>

      </div>
    `;
  }
  
  renderPost(maybeRecord: Record | undefined) {
    if (!maybeRecord) return html`<span>The requested post was not found.</span>`;
    
    if (this._editing) {
    	return html`<edit-post
    	  .originalPostHash=${this.postHash}
    	  .currentRecord=${maybeRecord}
    	  @post-updated=${async () => {
    	    this._editing = false;
    	    await this._fetchRecord.run();
    	  } }
    	  @edit-canceled=${() => { this._editing = false; } }
    	  style="display: flex; flex: 1;"
    	></edit-post>`;
    }

    return this.renderDetail(maybeRecord);
  }

  render() {
    return this._fetchRecord.render({
      pending: () => html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`,
      complete: (maybeRecord) => this.renderPost(maybeRecord),
      error: (e: any) => html`<span>Error fetching the post: ${e.data.data}</span>`
    });
  }
}

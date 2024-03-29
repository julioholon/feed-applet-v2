import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { ActionHash, EntryHash, AgentPubKey, Record, AppAgentClient } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { decode } from '@msgpack/msgpack';
import { TextArea, Button, Snackbar } from '@scoped-elements/material-web';
import { FeedStore } from "../feed-store";
import { feedStoreContext } from "../contexts";

import { Post } from '../types';

@customElement('edit-post')
export class EditPost extends ScopedElementsMixin(LitElement) {
  @consume({ context: feedStoreContext, subscribe: true })
  public  feedStore!: FeedStore
  
  @property({
      hasChanged: (newVal: ActionHash, oldVal: ActionHash) => newVal?.toString() !== oldVal?.toString()
  })
  originalPostHash!: ActionHash;

  
  @property()
  currentRecord!: Record;
 
  get currentPost() {
    return decode((this.currentRecord.entry as any).Present.entry) as Post;
  }
 
  @state()
  _text!: string;


  isPostValid() {
    return true && this._text !== undefined;
  }
  
  connectedCallback() {
    super.connectedCallback();
    this._text = this.currentPost.text;
  }

  async updatePost() {
    const post: Post = { 
      text: this._text!,
    };

    try {
      const payload = {
        original_post_hash: this.originalPostHash,
        previous_post_hash: this.currentRecord.signed_action.hashed.hash,
        updated_post: post
      };
      const updateRecord: Record = await this.feedStore.updatePost(payload);
  
      this.dispatchEvent(new CustomEvent('post-updated', {
        composed: true,
        bubbles: true,
        detail: {
          originalPostHash: this.originalPostHash,
          previousPostHash: this.currentRecord.signed_action.hashed.hash,
          updatedPostHash: updateRecord.signed_action.hashed.hash
        }
      }));
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById('update-error') as Snackbar;
      errorSnackbar.labelText = `Error updating the post: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  static get scopedElements() {
    return {
        'mwc-textarea': TextArea,
        'mwc-button': Button,
        'mwc-snackbar': Snackbar,
    }
  }
  
  render() {
    return html`
      <mwc-snackbar id="update-error" leading>
      </mwc-snackbar>

      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Edit Post</span>
          <div style="margin-bottom: 16px">
          <mwc-textarea outlined label="What is on your mind?" .value=${ this._text } @input=${(e: CustomEvent) => { this._text = (e.target as any).value;} } required></mwc-textarea>    
          </div>



        <div style="display: flex; flex-direction: row">
          <mwc-button
            outlined
            label="Cancel"
            @click=${() => this.dispatchEvent(new CustomEvent('edit-canceled', {
              bubbles: true,
              composed: true
            }))}
            style="flex: 1; margin-right: 16px"
          ></mwc-button>
          <mwc-button 
            raised
            label="Save"
            .disabled=${!this.isPostValid()}
            @click=${() => this.updatePost()}
            style="flex: 1;"
          ></mwc-button>
        </div>
      </div>`;
  }
}

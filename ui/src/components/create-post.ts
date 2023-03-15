/* eslint-disable import/extensions */
import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { InstalledCell, ActionHash, Record, AgentPubKey, EntryHash, AppAgentClient } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { FeedStore } from "../feed-store";
import { TextArea, Button, Snackbar } from '@scoped-elements/material-web';
import { feedStoreContext } from "../contexts";
import { Post } from '../types';

@customElement('create-post')
export class CreatePost extends ScopedElementsMixin(LitElement) {

  @consume({ context: feedStoreContext, subscribe: true })
  public  feedStore!: FeedStore

  @state()
  _text: string | undefined;


  isPostValid() {
    return true && this._text !== undefined;
  }

  async createPost() {
    const post: Post = { 
        text: this._text!,
    };

    try {
      const record: Record = await this.feedStore.createPost(post);

      this.dispatchEvent(new CustomEvent('post-created', {
        composed: true,
        bubbles: true,
        detail: {
          postHash: record.signed_action.hashed.hash
        }
      }));
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById('create-error') as Snackbar;
      errorSnackbar.labelText = `Error creating the post: ${e.data?.data}`;
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
      <mwc-snackbar id="create-error" leading>
      </mwc-snackbar>

      <div style="display: flex; flex-direction: column">
          <div style="margin-bottom: 16px">
            <mwc-textarea outlined label="What is on your mind?"  @input=${(e: CustomEvent) => { this._text = (e.target as any).value;} } required></mwc-textarea>          
          </div>
            

        <mwc-button 
          raised
          label="Create Post"
          .disabled=${!this.isPostValid()}
          @click=${() => this.createPost()}
        ></mwc-button>
    </div>`;
  }
}

/* eslint-disable import/extensions */
import { LitElement, css, html } from 'lit';
import { get } from 'svelte/store';
import { property } from 'lit/decorators.js';
import { consume } from '@lit-labs/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';

import { SensemakerStore } from '@neighbourhoods/nh-launcher-applet';
import { ComputeContextInput } from '@neighbourhoods/sensemaker-lite-types';
import { feedStoreContext, sensemakerStoreContext } from './contexts';
import { FeedStore } from './feed-store';
import { AllPosts, CreatePost } from './index'


export class FeedApp extends ScopedElementsMixin(LitElement) {
  // set up the context providers for both stores so that they can be accessed by other components
  @consume({ context: feedStoreContext })
  @property()
  feedStore!: FeedStore;

  @consume({ context: sensemakerStoreContext })
  @property()
  sensemakerStore!: SensemakerStore;

  async firstUpdated() {
  }

  render() {
    return html`
      <main>
        <div class="home-page">
        <h1>Feed</h1>

        <div id="content"><all-posts></all-posts></div>
        <create-post></create-post>
        </div>
      </main>
    `;
  }

  // // this is an example function of computing a context, since your UI will likely be displaying various contexts
  // // this is an example from the todo applet
  // async computeContext(_e: CustomEvent) {
  //   const contextResultInput: ComputeContextInput = {
  //     resource_ehs: await this.feedStore.allFeedResourceEntryHashes(),
  //     context_eh: get(this.sensemakerStore.appletConfig()).cultural_contexts["most_important_tasks"],
  //     can_publish_result: false,
  //   }
  //   const contextResult = await this.sensemakerStore.computeContext("most_important_tasks", contextResultInput)
  // }

  static get scopedElements() {
    return {
      'all-posts': AllPosts,
      'create-post': CreatePost
    };
  }

  static styles = css`
    .home-page {
      display: flex;
      flex-direction: row;
    }  

    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--lit-element-background-color);
    }

    main {
      flex-grow: 1;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }
  `;
}

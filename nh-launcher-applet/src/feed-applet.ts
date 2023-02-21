import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { CircularProgress } from "@scoped-elements/material-web";
import { LitElement, html, css } from "lit";
import { AppletInfo, SensemakerStore } from "@neighbourhoods/nh-launcher-applet";
import { FeedApp, FeedStore } from "@neighbourhoods/feed-applet";
import appletConfig from './appletConfig';
import { AppAgentWebsocket, AppWebsocket, CellType, ProvisionedCell } from "@holochain/client";

const PROVIDER_ROLE_NAME = 'feed';

export class FeedApplet extends ScopedElementsMixin(LitElement) {
  @property()
  appletAppInfo!: AppletInfo[];

  @property()
  appWebsocket!: AppWebsocket;

  @property()
  sensemakerStore!: SensemakerStore;

  @property()
  feedStore!: FeedStore;

  @state()
  loaded = false;

  async firstUpdated() {
    try {
      const todoAppletInfo = this.appletAppInfo[0];
      const cellInfo = todoAppletInfo.appInfo.cell_info[PROVIDER_ROLE_NAME][0]
      const providerCell = (cellInfo as { [CellType.Provisioned]: ProvisionedCell }).provisioned;

      const maybeAppletConfig = await this.sensemakerStore.checkIfAppletConfigExists(appletConfig.name)
      if (!maybeAppletConfig) {
        await this.sensemakerStore.registerApplet(appletConfig)
      }

      const appWs = await AppWebsocket.connect(this.appWebsocket.client.socket.url)
      const appAgentWebsocket: AppAgentWebsocket = await AppAgentWebsocket.connect(appWs.client.socket.url, "provider");
      this.feedStore = new FeedStore(
        appAgentWebsocket,
        providerCell,
      );
      this.loaded = true;
    }
    catch (e) {
      console.log("error in first update", e)
    }
  }
  static styles = css`
    .completed {
      text-decoration-line: line-through;
      color: #777;
    }
  `;

  render() {
    if (!this.loaded)
      return html`<div
        style="display: flex; flex: 1; flex-direction: row; align-items: center; justify-content: center"
      >
        <mwc-circular-progress></mwc-circular-progress>
      </div>`;

    return html`
      <feed-app .sensemakerStore=${this.sensemakerStore} .feedStore=${this.feedStore}></feed-app>
    `;
  }

  static get scopedElements() {
    return {
      "mwc-circular-progress": CircularProgress,
      "feed-app": FeedApp,
    };
  }
}
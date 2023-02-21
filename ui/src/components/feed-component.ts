import { contextProvided } from "@lit-labs/context";
import { property } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html } from "lit";
import { feedStoreContext } from "../contexts";
import { FeedStore } from "../feed-store";

export class FeedComponent extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: feedStoreContext, subscribe: true })
    @property({attribute: false})
    public  feedStore!: FeedStore

    
    render() {
        return html`
            <div>
                <p1>this is a feed component!</p1>
            </div>
        `
    }
    
    static get scopedElements() {
        return {
        };
    }
}
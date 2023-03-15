/* eslint-disable import/extensions */
import { Writable, writable, get } from 'svelte/store';
import {
  AppAgentWebsocket,
  EntryHash,
  AgentPubKeyB64,
  Record,
  encodeHashToBase64,
  ProvisionedCell,
} from '@holochain/client';
import { FeedService } from './feed-service';
import { WrappedEntry, Post } from './types';

// the ProviderStore manages the Writable svelte/store object, like accessing and updating it
export class FeedStore {
  service: FeedService;

  #postData: Writable<Array<Record>> = writable([]);

  get myAgentPubKey(): AgentPubKeyB64 {
    return encodeHashToBase64(this.providerCell.cell_id[1]);
  }

  constructor(
    protected client: AppAgentWebsocket,
    protected providerCell: ProvisionedCell,
  ) {
    this.service = new FeedService(
      client,
      providerCell.cell_id
    );
  }

  async createPost(data: {}): Promise<Record> {
    return this.service.createPost(data);
  }

  async getPost(entryHash: EntryHash): Promise<Record | undefined> {
    return this.service.getPost(entryHash);
  }

  async updatePost(data: {}): Promise<Record> {
    return this.service.updatePost(data);
  }

  async deletePost(entryHash: EntryHash) {
    this.service.deletePost(entryHash);
  }

  async fetchAllPosts(): Promise<Array<Record> {
    const fetchedPosts = await this.service.fetchAllPosts();
    this.#postData.update(x => {
      return fetchedPosts;
    });
    return get(this.#postData);
  }

  allFeedResourceEntryHashes() {
    return this.service.fetchAllPosts()
  }
}

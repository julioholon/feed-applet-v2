import { EntryHash, AppAgentWebsocket, CellId, Record } from '@holochain/client';

const PROVIDER_ZOME_NAME = 'posts'

// the FeedService object handles the zome calls
export class FeedService {
  constructor(public cellClient: AppAgentWebsocket, public cellId: CellId) {}

  async fetchAllPosts(): Promise<{}> {
    return this.callZome('fetch_all_posts', null);
  }

  async createPost(data: {}): Promise<Record> {
    return this.callZome('create_post', data);
  }

  async getPost(entryHash: EntryHash): Promise<Record | undefined> {
    return this.callZome('get_post', entryHash);
  }

  async updatePost(data: {}): Promise<Record> {
    return this.callZome('update_post', data);
  }

  async deletePost(entryHash: EntryHash) {
    this.callZome('delete_post', entryHash);
  }

  private callZome(fnName: string, payload: any) {
    return this.cellClient.callZome({
      cell_id: this.cellId,
      zome_name: PROVIDER_ZOME_NAME,
      fn_name: fnName,
      payload,
      provenance: this.cellId[1],
    });
  }
}

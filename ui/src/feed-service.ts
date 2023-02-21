import { EntryHash, AppAgentWebsocket, CellId } from '@holochain/client';

const PROVIDER_ZOME_NAME = 'feed'

// the FeedService object handles the zome calls
export class FeedService {
  constructor(public cellClient: AppAgentWebsocket, public cellId: CellId) {}

  async createNewResource(input: string): Promise<null> {
    return this.callZome('create_new_resource', input);
  }
  async allFeedResourceEntryHashes(): Promise<Array<EntryHash>> {
    return this.callZome('all_feed_resource_entry_hashes', null);
  }
  async fetchAllResources(): Promise<{}> {
    return this.callZome('fetch_all_resources', null);
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

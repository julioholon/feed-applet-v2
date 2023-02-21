
import { AppBundleSource, Record } from "@holochain/client";
import { pause, runScenario, CallableCell } from "@holochain/tryorama";
import { decode } from '@msgpack/msgpack';
import pkg from 'tape-promise/tape';
const { test } = pkg;
import { feedHapp } from "./utils";


async function samplePost(cell: CallableCell, partialPost = {}) {
  return {
      ...{
  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
      ...partialPost
  };
}

export async function createPost(cell: CallableCell, post = {}): Promise<Record> {
  return cell.callZome({
    zome_name: "posts",
    fn_name: "create_post",
    payload: post || await samplePost(cell),
  });
}

export default () => test("feed CRUD scenario", async (t) => {
  await runScenario(async scenario => {

    const appBundleSource: AppBundleSource = { path: feedHapp };

    const [alice, bob] = await scenario.addPlayersWithApps([{ appBundleSource }, { appBundleSource }]);

    await scenario.shareAllAgents();

    const sample = await samplePost(alice.cells[0]);

    // Alice creates a Post
    const record: Record = await createPost(alice.cells[0], sample);
    t.ok(record); // 1

    const originalActionHash = record.signed_action.hashed.hash;

    // Wait for the created entry to be propagated to the other node.
    await pause(1200);

    // Bob gets the created Post
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "posts",
      fn_name: "get_post",
      payload: originalActionHash,
    });
    t.deepEqual(sample, decode((createReadOutput.entry as any).Present.entry) as any); // 2

    // Alice updates the Post
    let contentUpdate: any = await samplePost(alice.cells[0]);
    let updateInput = {
      original_post_hash: originalActionHash,
      previous_post_hash: originalActionHash,
      updated_post: contentUpdate,
    };

    let updatedRecord: Record = await alice.cells[0].callZome({
      zome_name: "posts",
      fn_name: "update_post",
      payload: updateInput,
    });
    t.ok(updatedRecord); // 3

    // Wait for the updated entry to be propagated to the other node.
    await pause(1200);

    // Bob gets the updated Post
    const readUpdatedOutput0: Record = await bob.cells[0].callZome({
      zome_name: "posts",
      fn_name: "get_post",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    t.deepEqual(contentUpdate, decode((readUpdatedOutput0.entry as any).Present.entry) as any); // 4

    // Alice deletes the updated Post
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "posts",
      fn_name: "delete_post",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    t.ok(deleteActionHash); // 5

    // Wait for the entry deletion to be propagated to the other node.
    await pause(1200);
        
    // Bob tries to get the deleted Post
    const readDeletedOutput = await bob.cells[0].callZome({
      zome_name: "posts",
      fn_name: "get_post",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    t.equal(readDeletedOutput, null); // 6
  });
});

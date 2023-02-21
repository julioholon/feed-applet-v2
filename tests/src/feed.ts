
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

export async function createPost(cell: CallableCell, post = undefined): Promise<Record> {
  return cell.callZome({
    zome_name: "posts",
    fn_name: "create_post",
    payload: post || await samplePost(cell),
  });
}

export default () => test("feed creation tests", async (t) => {
  await runScenario(async scenario => {

    const appBundleSource: AppBundleSource = { path: feedHapp };

    const [alice, bob] = await scenario.addPlayersWithApps([{ appBundleSource }, { appBundleSource }]);

    await scenario.shareAllAgents();

    // Alice creates a Post
    const record: Record = await createPost(alice.cells[0]);
    t.ok(record);
  });
});

import * as path from "path";
import { task } from "hardhat/config";
import {
  TASK_COMPILE,
  TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT,
} from "hardhat/builtin-tasks/task-names";
import { tsGenerator } from "ts-generator";
import { TypeChain } from "typechain/dist/TypeChain";
import "@nomiclabs/hardhat-ethers";

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://hardhat.org/config/ to learn more
export default {
  // This is a sample solc configuration that specifies which version of solc to use
  solidity: {
    version: "0.7.5",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};

task(TASK_COMPILE).setAction(async (_, runtime, runSuper) => {
  await runSuper();
  const artifacts = await runtime.artifacts.getArtifactPaths();
  const artifactsGlob = "{" + artifacts.join(",") + "}";
  await typeChain(artifactsGlob, ".");
  console.log(`Successfully generated Typechain artifacts!`);
});

task(TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT).setAction(
  async (_, __, runSuper) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const input = await runSuper();
    // eslint-disable-next-line
    input.settings.outputSelection["*"]["*"].push("storageLayout");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return input;
  }
);

async function typeChain(files: string, modulePath: string): Promise<void> {
  const outDir = "./contract-bindings";
  const cwd = process.cwd();
  await tsGenerator({ cwd }, [
    new TypeChain({
      cwd,
      rawConfig: {
        files,
        outDir: path.join(outDir, "ethers", modulePath),
        target: "ethers-v5",
      },
    }),
    new TypeChain({
      cwd,
      rawConfig: {
        files,
        outDir: path.join(outDir, "web3", modulePath),
        target: "web3-v1",
      },
    }),
  ]);
}

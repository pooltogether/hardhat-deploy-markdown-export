import { generate } from './generate'

// @ts-ignore
task("deploy-markdown-export", "Checks whether an address won a draw")
  .addParam("name", "The name of the deployment list")
  .addParam("outputFilepath", "The file to output to", "deployments.md")
  .addParam("npmPackageName", "The name of the npm package")
  .addParam("githubBaseUrl", "The base URL of the Github repo")
  .setAction(async (taskArgs: any) => {
    const { name, outputFilepath, npmPackageName, githubBaseUrl } = taskArgs
    await generate(name, outputFilepath, npmPackageName, githubBaseUrl)
  });

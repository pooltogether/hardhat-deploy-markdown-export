const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const find = require('find');
const glob = require('glob');

function formatAddressUrl(network: any, address: string) {
  const { chainId, name } = network;

  let url;
  if (chainId == 1) {
    url = `https://etherscan.io/address/${address}`;
  } else if (chainId == 56) {
    url = `https://bscscan.com/address/${address}`;
  } else if (chainId == 77) {
    url = `https://blockscout.com/poa/sokol/address/${address}`;
  } else if (chainId == 97) {
    url = `https://testnet.bscscan.com/address/${address}`;
  } else if (chainId == 100) {
    url = `https://blockscout.com/xdai/mainnet/address/${address}`;
  } else if (chainId == 137) {
    url = `https://explorer-mainnet.maticvigil.com/address/${address}`;
  } else if (chainId == 80001) {
    url = `https://explorer-mumbai.maticvigil.com/address/${address}`;
  } else if (chainId == 42220) {
    url = `https://explorer.celo.org/address/${address}`;
  } else if (chainId == 44787) {
    url = `https://alfajores-blockscout.celo-testnet.org/address/${address}`;
  } else if (chainId == 43113) {
    url = `https://testnet.snowtrace.io/address/${address}`;
  } else if (chainId == 43114) {
    url = `https://snowtrace.io/address/${address}`;
  } else if (chainId == 10) {
    url = `https://optimistic.etherscan.io/address/${address}`;
  } else if (chainId == 69) {
    url = `https://kovan-optimistic.etherscan.io/address/${address}`;
  } else {
    url = `https://${name}.etherscan.io/address/${address}`;
  }
  return url;
}

function formatDeployments(
  npmPackageName: string,
  network: any,
  githubBaseUrl: string,
  projectRoot: string
): Array<any> {
  const result: any[] = [];

  if (!projectRoot) {
    projectRoot = `./node_modules/${npmPackageName}`;
  }

  const hardhatNetworkName = network.hardhatNetworkName || network.name;

  const deploymentsDirectory = `${projectRoot}/deployments/${hardhatNetworkName}`;
  const deploymentsDirectoryWithChainId = `${projectRoot}/deployments/${hardhatNetworkName}_${network.chainId}`;

  let contractPaths;
  if (fs.existsSync(deploymentsDirectory)) {
    contractPaths = glob.sync(`${deploymentsDirectory}/*.json`);
  } else if (fs.existsSync(deploymentsDirectoryWithChainId)) {
    contractPaths = glob.sync(`${deploymentsDirectoryWithChainId}/*.json`);
  } else {
    return result;
  }

  for (let cpi = 0; cpi < contractPaths.length; cpi++) {
    const contractPath = contractPaths[cpi];

    const contract = JSON.parse(fs.readFileSync(contractPath));
    const contractName = path.basename(contractPath, '.json');

    console.log(chalk.dim(`Found contract ${contractName}...`));

    let contractLink;

    if (fs.existsSync(`${projectRoot}/contracts`)) {
      const solidityFilepaths = find.fileSync(
        `${contractName}.sol`,
        `${projectRoot}/contracts`
      );

      if (solidityFilepaths.length > 0) {
        const solidityFilePath = solidityFilepaths[0].split('/contracts')[1];
        contractLink = `[${contractName}](${githubBaseUrl}/contracts${solidityFilePath})`;
      } else {
        contractLink = contractName;
      }
    } else {
      // case where no contracts folder in package
      contractLink = contractName;
    }

    result.push(
      `| ${contractLink} | [${contract.address}](${formatAddressUrl(
        network,
        contract.address
      )}) | [Artifact](${githubBaseUrl +
        `/deployments/${hardhatNetworkName}/${path.basename(contractPath)}`}) |`
    );
  }

  return result;
}

function capitalizeFirstLetter(string: any) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const append = (out: any, str: any) => {
  fs.writeSync(out, str + '\n');
};

async function generateBlockchainNetworks(
  name: string,
  networkDeployments: Array<any>,
  outputFilePath: string
) {
  const outputFile = fs.openSync(outputFilePath, 'w');

  console.log(chalk.yellow(`Generating deployments for ${name}...`));

  append(outputFile, `---`);
  append(outputFile, `title: ${name}`);
  append(outputFile, `---`);
  append(outputFile, ``);
  append(outputFile, `# ${name}`);
  append(outputFile, ``);

  for (let ni = 0; ni < networkDeployments.length; ni++) {
    const { network, deployments } = networkDeployments[ni];

    if (deployments.length > 0) {
      console.log(chalk.yellow(`Generating network ${network.name}...`));
      append(outputFile, `## ${capitalizeFirstLetter(network.name)}`);
      append(outputFile, '');
      append(outputFile, `| Contract | Address | Artifact |`);
      append(outputFile, `| :--- | :--- | :--- |`);
      append(outputFile, deployments.join('\n'));
      append(outputFile, '');
      console.log(chalk.green(`Done ${name}!`));
    }
  }

  fs.closeSync(outputFile);
}

export async function generate(
  name: string,
  outputFilePath: string,
  npmPackageName: string,
  githubBaseUrl: string
) {
  console.log(chalk.dim(`Generating network files...`));

  const ethereumNetworks = [
    {
      chainId: '1',
      name: 'mainnet',
    },
    {
      chainId: '4',
      name: 'rinkeby',
    },
    {
      chainId: '42',
      name: 'kovan',
    },
  ];

  const xDaiNetworks = [
    {
      chainId: '100',
      name: 'xDai',
      hardhatNetworkName: 'xdai',
    },
    {
      chainId: '77',
      name: 'sokol',
      hardhatNetworkName: 'poaSokol',
    },
  ];

  const maticNetworks = [
    {
      chainId: 137,
      name: 'polygon',
    },
    {
      chainId: 137,
      name: 'matic',
    },
    {
      chainId: 80001,
      name: 'mumbai',
    },
  ];

  const binanceNetworks = [
    {
      chainId: 56,
      name: 'BSC',
      hardhatNetworkName: 'bsc',
    },
    {
      chainId: 97,
      name: 'BSC Testnet',
      hardhatNetworkName: 'bscTestnet',
    },
  ];

  const celoNetworks = [
    {
      chainId: 42220,
      name: 'Celo',
      hardhatNetworkName: 'celo',
    },
    {
      chainId: 44787,
      name: 'Alfajores',
      hardhatNetworkName: 'celoTestnet',
    },
  ];

  const avalancheNetworks = [
    {
      chainId: 43114,
      name: 'Avalanche',
      hardhatNetworkName: 'avalanche',
    },
    {
      chainId: 43113,
      name: 'Fuji',
      hardhatNetworkName: 'fuji',
    },
  ];

  const optimismNetworks = [
    {
      chainId: 10,
      name: 'Optimism',
      hardhatNetworkName: 'optimism',
    },
    {
      chainId: 69,
      name: 'Optimism Kovan',
      hardhatNetworkName: 'optimismkovan',
    },
  ];

  const allNetworks = [
    ...ethereumNetworks,
    ...xDaiNetworks,
    ...maticNetworks,
    ...binanceNetworks,
    ...celoNetworks,
    ...avalancheNetworks,
    ...optimismNetworks,
  ];

  function buildNetworkDeployments(
    npmPackageName: string,
    githubBaseUrl: string,
    projectRoot: string
  ) {
    return allNetworks.map(network => {
      return {
        network,
        deployments: formatDeployments(
          npmPackageName,
          network,
          githubBaseUrl,
          projectRoot
        ),
      };
    });
  }

  const networkDeployments = buildNetworkDeployments(
    npmPackageName,
    githubBaseUrl,
    '.'
  );

  await generateBlockchainNetworks(name, networkDeployments, outputFilePath);

  console.log(chalk.green(`Done!`));
}

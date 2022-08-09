import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import "@cronos-labs/hardhat-cronoscan";

require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const CRONOSCAN_API_KEY = process.env.CRONOSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      mining: {
        auto: false,
        interval: [15000, 30000],
      },
    },
    cronosTestnet: {
      url: "https://evm-t3.cronos.org/",
      chainId: 338,
      accounts: [PRIVATE_KEY],
      gasPrice: 5000000000000,
    },
    cronos: {
      url: "https://evm.cronos.org/",
      chainId: 25,
      accounts: [PRIVATE_KEY],
      gasPrice: 5000000000000,
    },
  },
  etherscan: {
    apiKey: {
      cronosTestnet: CRONOSCAN_API_KEY,
      cronos: CRONOSCAN_API_KEY,
    },
  },
};

export default config;

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    hardhat: {},
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
};

export default config;

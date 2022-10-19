![Checks](https://github.com/tellor-io/lens/workflows/Checks/badge.svg)

# Overview
Tellor Lens is a helper, read-only contract for easy access to Tellor data across the Master, Autopay, Oracle, and Governance contracts.

## Setting up and deploying

Install Dependencies
```
npm i
```
Compile Smart Contracts
```
npx hardhat compile
```
Test Smart Contracts
```
npx hardhat test
```

Deploy on Rinkeby
```
hardhat deploy --network rinkeby  --oracle-address 0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0
```


Deploy on Mainnet
```
hardhat deploy --network mainnet --oracle-address 0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0
```

For any strange errors
```
hardhat compile --force
```
![Checks](https://github.com/tellor-io/lens/workflows/Checks/badge.svg)

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
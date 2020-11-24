// SPDX-License-Identifier: MIT

// This file exists only so that the compile task creates the artifacts
// which are then used for the tests.

pragma solidity >=0.5.16;

import "tellorcore/contracts/libraries/TellorTransfer.sol";
import "tellorcore/contracts/libraries/TellorLibrary.sol";
import "tellorlegacy/contracts/oldContracts/libraries/OldTellorTransfer.sol";
import "tellorcore/contracts/TellorGetters.sol";
import "tellorcore/contracts/Tellor.sol";
import "tellorcore/contracts/TellorMaster.sol";

contract TellorTest is Tellor {
    constructor() public {
        tellor.uintVars[keccak256("stakeAmount")] = 500e18;
        tellor.uintVars[keccak256("disputeFee")] = 500e18;

        tellor.uintVars[keccak256("difficulty")] = 1;
        tellor.uintVars[keccak256("targetMiners")] = 100;

        // This is used when calculating the current reward so can't be zero.
        tellor.uintVars[keccak256("timeOfLastNewValue")] = now;

        // Set the initial request ids to mine.
        tellor.currentMiners[0].value = 1;
        tellor.currentMiners[1].value = 2;
        tellor.currentMiners[2].value = 3;
        tellor.currentMiners[3].value = 4;
        tellor.currentMiners[4].value = 5;
    }

    function setBalance(address _address, uint256 _amount) public {
        // `tellor` variable is inherited from the Tellor contract.
        tellor.uintVars[keccak256("total_supply")] += _amount;
        TellorTransfer.updateBalanceAtNow(
            tellor.balances[_address],
            _amount * 1e18
        );
    }

    // Library functions that take `storage` as an argument need to be reimplemented
    // `storage` argument can't be passed from an external call and
    // because of this not added to the generated ABI this requiring re-implementation.

    function balanceOf(address _address) public view returns (uint256) {
        return TellorTransfer.balanceOf(tellor, _address);
    }

    function getRequestUintVars(uint256 _requestId, bytes32 _data)
        external
        view
        returns (uint256)
    {
        return
            TellorGettersLibrary.getRequestUintVars(tellor, _requestId, _data);
    }

    function getUintVar(bytes32 _data) external view returns (uint256) {
        return TellorGettersLibrary.getUintVar(tellor, _data);
    }
}

// SPDX-License-Identifier: MIT

// This file exists only so that the compile task creates the artifacts
// which are then used for the tests.

pragma solidity >=0.5.16;

import "tellorcore/contracts/libraries/TellorTransfer.sol";
import "tellorlegacy/contracts/oldContracts/libraries/OldTellorTransfer.sol";
import "tellorcore/contracts/TellorGetters.sol";
import "tellorcore/contracts/Tellor.sol";
import "tellorcore/contracts/TellorMaster.sol";

contract TellorTest is Tellor {
    function setBalance(address _address, uint256 _amount) public {
        // `tellor` variable is inherited from the Tellor contract.
        tellor.uintVars[keccak256("total_supply")] += _amount;
        TellorTransfer.updateBalanceAtNow(tellor.balances[_address], _amount);
    }

    // Need to reimplement the balanceOf function as compiling doesn't create ABI for functions inside libraries.
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
}

// SPDX-License-Identifier: MIT

pragma solidity >=0.5.16;

import "tellorcore/contracts/TellorMaster.sol";

/**
 * @title Tellor Lens
 * @dev A contract to aggregate and simplify calls to the Tellor oracle.
 **/
contract Lens {
    TellorMaster public master;

    /*Constructor*/
    /**
     * @dev the constructor sets the storage address and owner
     * @param _master is the TellorMaster address
     */
    constructor(address payable _master) public {
        master = TellorMaster(_master);
    }

    /**
     * @param requestID is the ID for which the function returns the total tips.
     * @return Returns the current tips for a give request ID.
     */
    function totalTip(uint256 requestID) external view returns (uint256) {
        return master.getRequestUintVars(requestID, keccak256("totalTip"));
    }
}

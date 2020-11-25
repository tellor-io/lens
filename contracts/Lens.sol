// SPDX-License-Identifier: MIT

pragma solidity >=0.5.16;
pragma experimental ABIEncoderV2;

import "tellorcore/contracts/TellorMaster.sol";
import "usingtellor/contracts/UsingTellor.sol";
import "hardhat/console.sol";

/**
 * @title Tellor Lens
 * @dev A contract to aggregate and simplify calls to the Tellor oracle.
 **/
contract Lens is UsingTellor {
    TellorMaster public tellor;

    /*Constructor*/
    /**
     * @dev the constructor sets the storage address and owner
     * @param _master is the Tellor proxy contract address.
     */
    constructor(address payable _master) public UsingTellor(_master) {
        tellor = TellorMaster(_master);
    }

    /**
     * @param requestID is the ID for which the function returns the total tips.
     * @return Returns the current tips for a give request ID.
     */
    function totalTip(uint256 requestID) external view returns (uint256) {
        return tellor.getRequestUintVars(requestID, keccak256("totalTip"));
    }

    /**
     * @return Returns the timeOfLastNewValue variable.
        this variable is set when starting a new mining block.
     */
    function timeOfLastNewValue() external view returns (uint256) {
        return tellor.getUintVar(keccak256("timeOfLastNewValue"));
    }

    /**
     * @return Returns the current reward amount.
        TODO remove once https://github.com/tellor-io/TellorCore/issues/109 is implemented and deployed.
     */
    function currentReward() external view returns (uint256) {
        uint256 timeDiff = now -
            tellor.getUintVar(keccak256("timeOfLastNewValue"));
        uint256 rewardAmount = 1e18;

        uint256 rewardAccumulated = (timeDiff * rewardAmount) / 300; // 1TRB every 6 minutes.

        uint256 tip = tellor.getUintVar(keccak256("currentTotalTips")) / 10; // Half of the tips are burnt.
        return rewardAccumulated + tip;
    }

    struct value {
        uint256 timestamp;
        uint256 value;
    }

    /**
     * @param requestID is the ID for which the function returns the values for.
     * @param count is the number of last values to return.
     * @return Returns the last N values for a request ID.
     */
    function getLastNewValues(uint256 requestID, uint256 count)
        external
        view
        returns (value[] memory)
    {
        uint256 totalCount = tellor.getNewValueCountbyRequestId(requestID);
        value[] memory values = new value[](count);
        console.log(totalCount);

        for (uint256 i = 0; i < count; i++) {
            uint256 ts = tellor.getTimestampbyRequestIDandIndex(
                requestID,
                totalCount - i - 1
            );
            uint256 v = tellor.retrieveData(requestID, ts);
            values[i] = value({timestamp: ts, value: v});
        }

        return values;
    }
}

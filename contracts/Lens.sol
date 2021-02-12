// SPDX-License-Identifier: MIT

pragma solidity >=0.7.4;
pragma experimental ABIEncoderV2;

import "usingtellor/contracts/UsingTellor.sol";
import "hardhat/console.sol";

interface TellorMaster {
    function getUintVar(bytes32 _data) external view returns (uint256);

    function getNewValueCountbyRequestId(uint256 _requestId)
        external
        view
        returns (uint256);

    function getTimestampbyRequestIDandIndex(uint256 _requestID, uint256 _index)
        external
        view
        returns (uint256);

    function retrieveData(uint256 _requestId, uint256 _timestamp)
        external
        view
        returns (uint256);

    function getAddressVars(bytes32 _data) external view returns (address);

    function getRequestUintVars(uint256 _requestId, bytes32 _data)
        external
        view
        returns (uint256);
}

/**
 * @title Tellor Lens
 * @dev A contract to aggregate and simplify calls to the Tellor oracle.
 **/
contract Lens is UsingTellor {
    TellorMaster public master;

    struct DataID {
        uint256 id;
        string name;
        uint256 granularity;
    }

    struct value {
        uint256 id;
        string name;
        uint256 timestamp;
        uint256 value;
    }

    address private admin;

    DataID[] public DataIDs;

    constructor(address payable _master, DataID[] memory _DataIDs)
        UsingTellor(_master)
    {
        master = TellorMaster(_master);
        admin = msg.sender;

        // DataIDs = new DataID[](_DataIDs.length);

        for (uint256 i = 0; i < _DataIDs.length; i++) {
            DataIDs.push(_DataIDs[i]);
        }
    }

    modifier onlyAdmin {
        require(msg.sender == admin, "not an admin");
        _;
    }

    function setAdmin(address _admin) external onlyAdmin {
        admin = _admin;
    }

    function setDataIDs(DataID[] memory _DataIDs) external onlyAdmin {
        for (uint256 i = 0; i < _DataIDs.length; i++) {
            DataIDs[i] = _DataIDs[i];
        }
    }

    function setDataID(uint256 _id, DataID memory _DataID) external onlyAdmin {
        DataIDs[_id] = _DataID;
    }

    function pushDataID(DataID memory _DataID) external onlyAdmin {
        DataIDs.push(_DataID);
    }

    function DataIDS() external view returns (DataID[] memory) {
        return DataIDs;
    }

    /**
     * @return Returns the current reward amount.
     */
    function currentReward() external view returns (uint256) {
        uint256 timeDiff =
            block.timestamp -
                master.getUintVar(keccak256("timeOfLastNewValue"));
        uint256 rewardAmount = 1e18;

        uint256 rewardAccumulated = (timeDiff * rewardAmount) / 300; // 1TRB every 6 minutes.

        uint256 tip = master.getUintVar(keccak256("currentTotalTips")) / 10; // Half of the tips are burnt.
        return rewardAccumulated + tip;
    }

    /**
     * @param dataID is the ID for which the function returns the values for. When dataID is negative it returns the values for all dataIDs.
     * @param count is the number of last values to return.
     * @return Returns the last N values for a request ID.
     */
    function getLastValues(uint256 dataID, uint256 count)
        public
        view
        returns (value[] memory)
    {
        uint256 totalCount = master.getNewValueCountbyRequestId(dataID);
        if (count > totalCount) {
            count = totalCount;
        }
        value[] memory values = new value[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 ts =
                master.getTimestampbyRequestIDandIndex(
                    dataID,
                    totalCount - i - 1
                );
            uint256 v = master.retrieveData(dataID, ts);
            values[i] = value({
                id: dataID,
                name: DataIDs[dataID].name,
                timestamp: ts,
                value: v
            });
        }

        return values;
    }

    /**
     * @param count is the number of last values to return.
     * @return Returns the last N values for a data IDs.
     */
    function getAllLastValues(uint256 count)
        external
        view
        returns (value[] memory)
    {
        value[] memory values = new value[](count * DataIDs.length);
        for (uint256 i = 0; i < DataIDs.length; i++) {
            value[] memory v = getLastValues(DataIDs[i].id, count);
            for (uint256 ii = 0; ii < v.length; ii++) {
                values[i + ii] = v[ii];
            }
        }

        return values;
    }

    /**
     * @return Returns the contract deity that can do things at will.
     */
    function _deity() external view returns (address) {
        return master.getAddressVars(keccak256("_deity"));
    }

    /**
     * @return Returns the contract owner address.
     */
    function _owner() external view returns (address) {
        return master.getAddressVars(keccak256("_owner"));
    }

    /**
     * @return Returns the contract pending owner.
     */
    function pending_owner() external view returns (address) {
        return master.getAddressVars(keccak256("pending_owner"));
    }

    /**
     * @return Returns the contract address that executes all proxy calls.
     */
    function tellorContract() external view returns (address) {
        return master.getAddressVars(keccak256("tellorContract"));
    }

    /**
     * @param dataID is the ID for which the function returns the total tips.
     * @return Returns the current tips for a give request ID.
     */
    function totalTip(uint256 dataID) external view returns (uint256) {
        return master.getRequestUintVars(dataID, keccak256("totalTip"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the last time when a value was submitted.
     */
    function timeOfLastNewValue() external view returns (uint256) {
        return master.getUintVar(keccak256("timeOfLastNewValue"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the total number of requests from user thorugh the addTip function.
     */
    function requestCount() external view returns (uint256) {
        return master.getUintVar(keccak256("requestCount"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the total oracle blocks.
     */
    function _tBlock() external view returns (uint256) {
        return master.getUintVar(keccak256("_tBlock"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the current block difficulty.
     *
     */
    function difficulty() external view returns (uint256) {
        return master.getUintVar(keccak256("difficulty"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable is used to calculate the block difficulty based on
     * the time diff since the last oracle block.
     */
    function timeTarget() external view returns (uint256) {
        return master.getUintVar(keccak256("timeTarget"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the highest api/timestamp PayoutPool.
     */
    function currentTotalTips() external view returns (uint256) {
        return master.getUintVar(keccak256("currentTotalTips"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the number of miners who have mined this value so far.
     */
    function slotProgress() external view returns (uint256) {
        return master.getUintVar(keccak256("slotProgress"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the cost to dispute a mined value.
     */
    function disputeFee() external view returns (uint256) {
        return master.getUintVar(keccak256("disputeFee"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     */
    function disputeCount() external view returns (uint256) {
        return master.getUintVar(keccak256("disputeCount"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks stake amount required to become a miner.
     */
    function stakeAmount() external view returns (uint256) {
        return master.getUintVar(keccak256("stakeAmount"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the number of parties currently staked.
     */
    function stakerCount() external view returns (uint256) {
        return master.getUintVar(keccak256("stakerCount"));
    }
}

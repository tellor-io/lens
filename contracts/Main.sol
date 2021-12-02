// SPDX-License-Identifier: MIT
// solhint-disable-next-line compiler-version
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";

interface Oracle {

    //reporter, value, name for most recent query IDs

    function getCurrentValue(bytes32 _queryId) external view returns(bytes memory);

    function getReportTimestampByIndex(bytes32 _queryId, uint256 _index) external view returns(uint256);

    function getReporterByTimestamp(bytes32 _queryId, uint256 _timestamp) external view returns(address);

    function getValueByTimestamp(bytes32 _queryId, uint256 _timestamp) external view returns(bytes memory);

    //reporter, value, name for most recent query IDs (w/ ability to dispute)

    //event type, description, timestamp, hash on a user's address

    function getStakerInfo(address _sender) external view returns(uint256); //for reporter's status. (statuses pinned on tellor core discord)

    function getReportsSubmittedByAddress(address _reporter) external view returns(uint256);

    function getReporterLastTimestamp(address _reporter) external view returns(uint256);

    //get last values on a request id

    function getTimestampCountById(bytes32 _queryId) external view returns(uint256);

    function getTimeOfLastNewValue() external view returns(uint256);

    function getCurrentReward(bytes32 _queryId) external view returns (uint256, uint256);

    function getTipsById(bytes32 _queryId) external view returns (uint256);
}

interface Master {
    
    function getAddressVars(bytes32 _data) external view returns (address);

    function getRequestUintVars(uint256 _requestId, bytes32 _data) external view returns (uint256);

    function getUintVar(bytes32 _data) external view returns (uint256);

}

/**
 * @title Tellor Lens main contract
 * @dev Aggregate and simplify calls to the Tellor oracle.
 **/
contract Main {
    Oracle public oracle;
    Master public master;

    struct DataID {
        bytes32 id;
    }

    struct Value {
        DataID meta;
        uint256 timestamp;
        uint256 tip;
        bytes value;
    }

    address private admin;

    // DataID[] public dataIDs;
    // mapping(uint256 => uint256) public dataIDsMap;

    constructor(address payable _oracle, address payable _master) {
        oracle = Oracle(_oracle);
        master = Master(_master);
        admin = msg.sender;
    }

    modifier onlyAdmin {
        require(msg.sender == admin, "not an admin");
        _;
    }

    function setOracle(address _oracle) external onlyAdmin {
        oracle = Oracle(_oracle);
    }

    function setAdmin(address _admin) external onlyAdmin {
        admin = _admin;
    }

    // function replaceDataIDs(DataID[] memory _dataIDs) external onlyAdmin {
    //     delete dataIDs;
    //     for (uint256 i = 0; i < _dataIDs.length; i++) {
    //         dataIDs.push(_dataIDs[i]);
    //         dataIDsMap[_dataIDs[i].id] = i;
    //     }
    // }

    // function setDataID(uint256 _id, DataID memory _dataID) external onlyAdmin {
    //     dataIDs[_id] = _dataID;
    //     dataIDsMap[_dataID.id] = _id;
    // }

    // function pushDataID(DataID memory _dataID) external onlyAdmin {
    //     dataIDs.push(_dataID);
    //     dataIDsMap[_dataID.id] = dataIDs.length - 1;
    // }

    // function dataIDsAll() external view returns (DataID[] memory) {
    //     return dataIDs;
    // }

    /**
     * @return Returns the current reward amount.
     */
    function getCurrentReward(bytes32 _queryId) external view returns (uint256, uint256) {
        return oracle.getCurrentReward(_queryId);
    }

    /**
     * @param _queryId is the ID for which the function returns the values for. When queryId is negative it returns the values for all dataIDs.
     * @param _count is the number of last values to return.
     * @return Returns the last N values for a request ID.
     */
    function getLastValues(bytes32 _queryId, uint256 _count)
        public
        view
        returns (Value[] memory)
    {
        uint256 totalCount = oracle.getTimestampCountById(_queryId); //replaced
        if (_count > totalCount) {
            _count = totalCount;
        }
        Value[] memory values = new Value[](_count);
        for (uint256 i = 0; i < _count; i++) {
            uint256 ts =
                oracle.getReportTimestampByIndex( //replaced
                    _queryId,
                    totalCount - i - 1
                );
            bytes memory v = oracle.getValueByTimestamp(_queryId, ts); //replaced
            values[i] = Value({
                meta: DataID({
                    id: _queryId
                }),
                timestamp: ts,
                value: v,
                tip: oracle.getTipsById(_queryId) //replaced
            });
        }

        return values;
    }

    /**
     * @param count is the number of last values to return.
     * @return Returns the last N values for a data IDs.
     */
    // function getLastValuesAll(uint256 count)
    //     external
    //     view
    //     returns (Value[] memory)
    // {
    //     Value[] memory values = new Value[](count * dataIDs.length);
    //     uint256 pos = 0;
    //     for (uint256 i = 0; i < dataIDs.length; i++) {
    //         Value[] memory v = getLastValues(dataIDs[i].id, count);
    //         for (uint256 ii = 0; ii < v.length; ii++) {
    //             values[pos] = v[ii];
    //             pos++;
    //         }
    //     }
    //     return values;
    // }

    /**
     * @return Returns the contract deity that can do things at will.
     */
    function deity() external view returns (address) {
        return master.getAddressVars(keccak256("_DEITY"));
    }

    /**
     * @return Returns the contract owner address.
     */
    function owner() external view returns (address) {
        return master.getAddressVars(keccak256("_OWNER"));
    }

    /**
     * @return Returns the contract pending owner.
     */
    function pendingOwner() external view returns (address) {
        return master.getAddressVars(keccak256("_PENDING_OWNER"));
    }

    /**
     * @return Returns the contract address that executes all proxy calls.
     */
    function tellorContract() external view returns (address) {
        return master.getAddressVars(keccak256("_TELLOR_CONTRACT"));
    }

    /**
     * @param _dataID is the ID for which the function returns the total tips.
     * @return Returns the current tips for a give request ID.
     */
    function totalTip(uint256 _dataID) public view returns (uint256) {
        return master.getRequestUintVars(_dataID, keccak256("_TOTAL_TIP"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the last time when a value was submitted.
     */
    function timeOfLastValue() external view returns (uint256) {
        return master.getUintVar(keccak256("_TIME_OF_LAST_NEW_VALUE"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the total number of requests from user thorugh the addTip function.
     */
    function requestCount() external view returns (uint256) {
        return master.getUintVar(keccak256("_REQUEST_COUNT"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the total oracle blocks.
     */
    function tBlock() external view returns (uint256) {
        return master.getUintVar(keccak256("_T_BLOCK"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the current block difficulty.
     *
     */
    function difficulty() external view returns (uint256) {
        return master.getUintVar(keccak256("_DIFFICULTY"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable is used to calculate the block difficulty based on
     * the time diff since the last master block.
     */
    function timeTarget() external view returns (uint256) {
        return master.getUintVar(keccak256("_TIME_TARGET"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the highest api/timestamp PayoutPool.
     */
    function currentTotalTips() external view returns (uint256) {
        return master.getUintVar(keccak256("_CURRENT_TOTAL_TIPS"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the number of miners who have mined this value so far.
     */
    function slotProgress() external view returns (uint256) {
        return master.getUintVar(keccak256("_SLOT_PROGRESS"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the cost to dispute a mined value.
     */
    function disputeFee() external view returns (uint256) {
        return master.getUintVar(keccak256("_DISPUTE_FEE"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     */
    function disputeCount() external view returns (uint256) {
        return master.getUintVar(keccak256("_DISPUTE_COUNT"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks stake amount required to become a miner.
     */
    function stakeAmount() external view returns (uint256) {
        return master.getUintVar(keccak256("_STAKE_AMOUNT"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the number of parties currently staked.
     */
    function stakeCount() external view returns (uint256) {
        return master.getUintVar(keccak256("_STAKE_AMOUNT"));
    }
}

// SPDX-License-Identifier: MIT
// solhint-disable-next-line compiler-version
pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

// import "hardhat/console.sol";
import "../contracts/interfaces/iTellor.sol";

/**
 * @title Tellor Lens main contract
 * @dev Aggregate and simplify calls to the Tellor oracle.
 **/
contract Main {
    ITellor public oracle; //TellorFlex
    ITellor public master; //Tellor360
    ITellor public governance;
    ITellor public autopay;

    struct DataID {
        bytes32 id;
    }

    struct Value {
        DataID meta;
        uint256 timestamp;
        uint256 tip;
        bytes value;
    }

    constructor(
        address payable _oracle,
        address payable _master,
        address payable _governance,
        address payable _autopay
    ) {
        oracle = ITellor(_oracle);
        master = ITellor(_master);
        governance = ITellor(_governance);
        autopay = ITellor(_autopay);
    }

    /**
     * @param _queryId bytes32 hash of queryId.
     * @return Returns the current reward amount.
     */
    function getCurrentReward(bytes32 _queryId)
        external
        view
        returns (uint256, uint256)
    {
        uint256 _timeDiff = block.timestamp - oracle.timeOfLastNewValue();
        uint256 _reward = (_timeDiff * oracle.timeBasedReward()) / 300; //.5 TRB per 5 minutes (should we make this upgradeable)
        if (oracle.getTotalTimeBasedRewardsBalance() < _reward) {
            _reward = oracle.getTotalTimeBasedRewardsBalance();
        }
        return (autopay.getCurrentTip(_queryId), _reward);
    }

    /**
     * @param _queryId is the ID for which the function returns the values for.
     * @param _count is the number of last values to return.
     * @return Returns the last N values for a request ID.
     */
    function getLastValues(bytes32 _queryId, uint256 _count)
        public
        view
        returns (Value[] memory)
    {
        uint256 totalCount = oracle.getNewValueCountbyQueryId(_queryId); //replaced
        if (_count > totalCount) {
            _count = totalCount;
        }
        Value[] memory values = new Value[](_count);
        for (uint256 i = 0; i < _count; i++) {
            uint256 ts = oracle.getTimestampbyQueryIdandIndex( //replaced
                _queryId,
                totalCount - i - 1
            );
            bytes memory v = oracle.retrieveData(_queryId, ts); //replaced
            values[i] = Value({
                meta: DataID({id: _queryId}),
                timestamp: ts,
                value: v,
                tip: autopay.getCurrentTip(_queryId) //replaced
            });
        }

        return values;
    }

    /**
     * @param _count is the number of last values to return.
     * @param _queryIds is a bytes32 array of queryIds.
     * @return Returns the last N values for a specified queryIds.
     */
    function getLastValuesAll(uint256 _count, bytes32[] memory _queryIds)
        external
        view
        returns (Value[] memory)
    {
        Value[] memory values = new Value[](_count * _queryIds.length);
        uint256 pos = 0;
        for (uint256 i = 0; i < _queryIds.length; i++) {
            Value[] memory v = getLastValues(_queryIds[i], _count);
            for (uint256 ii = 0; ii < v.length; ii++) {
                values[pos] = v[ii];
                pos++;
            }
        }
        return values;
    }

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
     * @param _queryId is the ID for which the function returns the total tips.
     * @return Returns the current tips for a give query ID.
     */
    function totalTip(bytes32 _queryId) public view returns (uint256) {
        return autopay.getCurrentTip(_queryId);
    }

    /**
     * @return Returns the last time a value was submitted by a reporter.
     */
    function timeOfLastValue() external view returns (uint256) {
        return oracle.timeOfLastNewValue();
    }

    /**
     * @param _user address of the user we want to find out totalTip amount.
     * @return Returns the total number of tips from a user.
     */
    function totalTipsByUser(address _user) external view returns (uint256) {
        return autopay.getTipsByAddress(_user);
    }

    /**
     * @return Returns the total amount of tips in the Oracle contract.
     */
    function tipsInContract() external view returns (uint256) {
        return oracle.getTotalTimeBasedRewardsBalance();
    }

    /**
     * @return Returns the current dispute fee amount.
     */
    function disputeFee() external view returns (uint256) {
        return governance.getDisputeFee();
    }

    /**
     * @return Returns a variable that tracks the stake amount required to become a reporter.
     */
    function stakeAmount() external view returns (uint256) {
        return oracle.stakeAmount();
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the number of parties currently staked.
     */
    function stakeCount() external view returns (uint256) {
        return oracle.totalStakers();
    }
}

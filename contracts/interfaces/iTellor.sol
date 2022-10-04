// SPDX-License-Identifier: MIT
pragma solidity >=0.8.3;

interface ITellor{
    //Controller
    function addresses(bytes32) external view returns(address);
    function uints(bytes32) external view returns(uint256);
    function burn(uint256 _amount) external;
    function changeDeity(address _newDeity) external;
    function changeOwner(address _newOwner) external;
    function changeUint(bytes32 _target, uint256 _amount) external;
    function migrate() external;
    function mint(address _reciever, uint256 _amount) external;
    function init() external;
    function getAllDisputeVars(uint256 _disputeId) external view returns (bytes32,bool,bool,bool,address,address,address,uint256[9] memory,int256);
    function getDisputeIdByDisputeHash(bytes32 _hash) external view returns (uint256);
    function getDisputeUintVars(uint256 _disputeId, bytes32 _data) external view returns(uint256);
    function getLastNewValueById(uint256 _requestId) external view returns (uint256, bool);
    function retrieveData(uint256 _requestId, uint256 _timestamp) external view returns (uint256);
    function getNewValueCountbyRequestId(uint256 _requestId) external view returns (uint256);
    function getAddressVars(bytes32 _data) external view returns (address);
    function getUintVar(bytes32 _data) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function decimals() external pure returns (uint8);
    function isMigrated(address _addy) external view returns (bool);
    function allowance(address _user, address _spender) external view  returns (uint256);
    function allowedToTrade(address _user, uint256 _amount) external view returns (bool);
    function approve(address _spender, uint256 _amount) external returns (bool);
    function approveAndTransferFrom(address _from, address _to, uint256 _amount) external returns(bool);
    function balanceOfAt(address _user, uint256 _blockNumber)external view returns (uint256);   
    function changeStakingStatus(address _reporter, uint _status) external;
    function getStakerInfo(address _staker) external view returns (uint256, uint256);
    function getTimestampbyRequestIDandIndex(uint256 _requestId, uint256 _index) external view returns (uint256);
    function getNewCurrentVariables()external view returns (bytes32 _c,uint256[5] memory _r,uint256 _d,uint256 _t);
    function getNewValueCountbyQueryId(bytes32 _queryId) external view returns(uint256);
    function getTimestampbyQueryIdandIndex(bytes32 _queryId, uint256 _index) external view returns(uint256);
    function requestStakingWithdraw() external;
    function retrieveData(bytes32 _queryId, uint256 _timestamp) external view returns(bytes memory);
    function slashReporter(address _reporter, address _disputer) external;
    function withdrawStake() external;
    //Governance
    enum VoteResult {FAILED,PASSED,INVALID}
    function beginDispute(bytes32 _queryId,uint256 _timestamp) external;
    function delegate(address _delegate) external;
    function delegateOfAt(address _user, uint256 _blockNumber) external view returns (address);
    function didVote(uint256 _disputeId, address _voter) external view returns(bool);
    function executeVote(uint256 _disputeId) external;
    function governance() external view returns (address);
    function isFunctionApproved(bytes4 _func) external view returns(bool);
    function isApprovedGovernanceContract(address _contract) external returns (bool);
    function getDelegateInfo(address _holder) external view returns(address,uint);
    function getDisputeFee() external view returns (uint256);
    function getDisputeInfo(uint256 _disputeId) external view returns(uint256,uint256,bytes memory, address);
    function getOpenDisputesOnId(bytes32 _queryId) external view returns(uint256);
    function getVoteCount() external view returns(uint256);
    function getVoteInfo(uint256 _disputeId) external view returns(bytes32,uint256[9] memory,bool[2] memory,VoteResult,bytes memory,bytes4,address[2] memory);
    function getVoteRounds(bytes32 _hash) external view returns(uint256[] memory);
    function proposeVote(address _contract,bytes4 _function, bytes calldata _data, uint256 _timestamp) external;   
    function setApprovedFunction(bytes4 _func, bool _val) external;
    function tallyVotes(uint256 _disputeId) external; 
    function updateMinDisputeFee() external;
    function verify() external pure returns(uint);
    function vote(uint256 _disputeId, bool _supports, bool _invalidQuery) external;
    function voteFor(address[] calldata _addys,uint256 _disputeId, bool _supports, bool _invalidQuery) external;
    //Oracle
    function getReportTimestampByIndex(bytes32 _queryId, uint256 _index) external view returns(uint256);
    function getValueByTimestamp(bytes32 _queryId, uint256 _timestamp) external view returns(bytes memory);
    function getBlockNumberByTimestamp(bytes32 _queryId, uint256 _timestamp) external view returns(uint256);
    function getReportingLock() external view returns(uint256);
    function getReporterByTimestamp(bytes32 _queryId, uint256 _timestamp) external view returns(address);
    function reportingLock() external view returns(uint256);
    function removeValue(bytes32 _queryId, uint256 _timestamp) external;
    function getTipsByUser(address _user) external view returns(uint256);
    function timeBasedReward() external view returns(uint256);
    function timeOfLastNewValue() external view returns(uint256);
    function tipQuery(bytes32 _queryId, uint256 _tip, bytes memory _queryData) external;
    function totalStakers() external view returns(uint256);
    function submitValue(bytes32 _queryId, bytes calldata _value, uint256 _nonce, bytes memory _queryData) external;
    function burnTips() external;
    function changeReportingLock(uint256 _newReportingLock) external;
    function getReportsSubmittedByAddress(address _reporter) external view returns(uint256);
    function changeTimeBasedReward(uint256 _newTimeBasedReward) external;
    function getReporterLastTimestamp(address _reporter) external view returns(uint256);
    function getTipsById(bytes32 _queryId) external view returns(uint256);
    function getTimeBasedReward() external view returns(uint256);
    function getTotalTimeBasedRewardsBalance() external view returns (uint256);
    function getTimestampCountById(bytes32 _queryId) external view returns(uint256);
    function getTimestampIndexByTimestamp(bytes32 _queryId, uint256 _timestamp) external view returns(uint256);
    function getCurrentReward(bytes32 _queryId) external view returns(uint256, uint256);
    function getCurrentValue(bytes32 _queryId) external view returns(bytes memory);
    function getDataBefore(bytes32 _queryId, uint256 _timestamp) external view returns(bool _ifRetrieve, bytes memory _value, uint256 _timestampRetrieved);
    function getIndexForDataBefore(bytes32 _queryId, uint256 _timestamp) external view returns(bool _found, uint256 _index);
    function getTimeOfLastNewValue() external view returns(uint256);
    function isInDispute(bytes32 _queryId, uint256 _timestamp) external view returns(bool);
    function depositStake(uint256 _amount) external;
    function requestStakingWithdraw(uint256 _amount) external;
    function getTokenAddress() external view returns (address);

    //Test functions
    function changeAddressVar(bytes32 _id, address _addy) external;

    //parachute functions
    function killContract() external;
    function migrateFor(address _destination,uint256 _amount) external;
    function rescue51PercentAttack(address _tokenHolder) external;
    function rescueBrokenDataReporting() external;
    function rescueFailedUpdate() external;

    //Tellor 360
    function addStakingRewards(uint256 _amount) external;
    function getStakeAmount() external view returns(uint256);
    function stakeAmount() external view returns(uint256);
    function token() external view returns(address);

    //ERC20
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom( address sender, address recipient, uint256 amount) external returns (bool);

    //QueryDataStorage
    function storeData(bytes memory _queryData) external; 
    function getQueryData(bytes32 _queryId) external view returns (bytes memory);

    //Autopay
    function getCurrentTip(bytes32 _queryId) external view returns (uint256);
    function getTipsByAddress(address _user) external view returns (uint256);
    function tip(bytes32 _queryId, uint256 _amount, bytes calldata _queryData) external;
}

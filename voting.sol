pragma solidity ^0.4.23;

import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol';

contract Voting {
    struct Option {
        bool selected;
        uint fund;
        bool cancel;
    }

    address public creator;
    uint public minimumFund;
    uint public endBlock;
    mapping(uint => address[]) public allVoters;
    mapping(uint => mapping(address => Option)) public allVotes;
    mapping(uint => int) public approves; // 1 approve, -1 cancel
    mapping(uint => uint) public funds;
    
    event onVote(address indexed voter, uint indexed option, uint indexed fund);
    event onUnvote(address indexed voter, uint indexed option, uint indexed fund);
    
    modifier onlyCreator {
        require(msg.sender == creator);
        _;
    }
    
    constructor (address _creator, uint _minimumFund, uint _endBlock) public {
        creator = _creator;
        minimumFund = _minimumFund;
        endBlock = _endBlock;
    }

    function vote(uint _option) payable public {
        require(approves[_option] == 0 || approves[_option] == 1);
        require(msg.value >= minimumFund);
        require(endBlock == 0 || block.number <= endBlock);
        
        Option storage option = allVotes[_option][msg.sender];
        
        // index voters
        if (!option.selected) {
            option.selected = true;
            allVoters[_option].push(msg.sender);
        } 
        
        if (option.cancel) {
            option.cancel = false;
            option.fund = msg.value;
        } else { 
            option.fund = SafeMath.add(option.fund, msg.value);
        }
        
        funds[_option] = SafeMath.add(funds[_option], msg.value);
        
        emit onVote(msg.sender, _option, msg.value);
    }
    
    function unvote(uint _option) public {
        require(approves[_option] == 0 || approves[_option] == -1);
        
        Option storage option = allVotes[_option][msg.sender];
        
        require(!option.cancel);
        
        if (msg.sender.send(option.fund)) {
            option.cancel = true;
            funds[_option] = SafeMath.sub(funds[_option], option.fund);
            
            emit onUnvote(msg.sender, _option, option.fund);
        }
    }
    
    function withdraw(uint _option) public onlyCreator {
        require(approves[_option] == 1);
        require(funds[_option] > 0);
       
        if (creator.send(funds[_option])) {
            funds[_option] = 0;
        }
    }

    function approve(uint _option) public onlyCreator returns(uint) {
        approves[_option] = 1;
    }
    
    function cancel(uint _option) public onlyCreator returns(uint) {
        approves[_option] = -1;
    }
    
    function getVotes(uint _option, uint offset, uint limit) view public returns(address[], uint[], bool[]) {
        address[] storage voters = allVoters[_option];
        mapping(address => Option) votes = allVotes[_option];
        
        if (offset < voters.length) {
            uint count = 0;
            uint resultLength = voters.length - offset > limit ? limit : voters.length - offset;
            address[] memory _voters = new address[](resultLength);
            uint[] memory _funds = new uint[](resultLength);
            bool[] memory _cancels = new bool[](resultLength); 
            
            for (uint i = offset; (i < voters.length) && (count < limit); i++) {
                _voters[count] = voters[i];
                _funds[count] = votes[_voters[i]].fund;
                _cancels[count] = votes[voters[i]].cancel;
                count++;
            }

            return(_voters, _funds, _cancels);
        }
    } 
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 private pin;
    mapping(uint256 => Transaction) public transactionHistory;
    uint256 public transactionCount;

    struct Transaction {
        uint256 amount;
        bool isDeposit;
        uint256 timestamp;
    }

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        pin = 1111; // default pin
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this account");
        _;
    }

    modifier verifyPin(uint256 _pin) {
        require(_pin == pin, "Invalid PIN");
        _;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function updateBalance(uint256 newBalance, uint256 _pin) public onlyOwner verifyPin(_pin) {
        balance = newBalance;
    }

    function deposit(uint256 _amount, uint256 _pin) public payable onlyOwner verifyPin(_pin) {
        uint _previousBalance = balance;

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // record transaction history
        transactionHistory[transactionCount] = Transaction({
            amount: _amount,
            isDeposit: true,
            timestamp: block.timestamp
        });
        transactionCount++;

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount, uint256 _pin) public onlyOwner verifyPin(_pin) {
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // record transaction history
        transactionHistory[transactionCount] = Transaction({
            amount: _withdrawAmount,
            isDeposit: false,
            timestamp: block.timestamp
        });
        transactionCount++;

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function changePin(uint256 oldPin, uint256 newPin) public onlyOwner {
        require(oldPin == pin, "Incorrect old PIN");
        pin = newPin;
    }

    function getTransaction(uint256 index) public view returns (uint256, bool, uint256) {
        Transaction memory txn = transactionHistory[index];
        return (txn.amount, txn.isDeposit, txn.timestamp);
    }
}

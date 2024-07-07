# MetaMask ATM

This project implements a simple ATM contract and a React-based web interface for interacting with the contract. It demonstrates basic Solidity and Ethereum functionality, such as balance management, transaction history, and PIN verification.

## Description

This project includes a smart contract written in Solidity and a frontend application written in React. The smart contract allows the owner to deposit, withdraw, update balance, and change the PIN of the ATM. The frontend application interacts with the smart contract through MetaMask, providing a user-friendly interface for managing the ATM.

## Getting Started

### Prerequisites

To run this project, you need to have the following installed :

- [Node.js](https://nodejs.org/)
- [MetaMask](https://metamask.io/)

### Installing

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/metamask-atm.git
    cd metamask-atm
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Compile the Solidity contract:**
    Ensure you have [Hardhat](https://hardhat.org/) installed and configured.

4. **Deploy the contract:**
    ```sh
    npx hardhat run scripts/deploy.js --network yournetwork
    ```
    Replace `yournetwork` with the network you're using (e.g., `localhost` for a local network).

### Running the Application

1. **Start the React application:**
    ```sh
    npm start
    ```

2. Open your browser and go to `http://localhost:3000`.

## Solidity Contract

Here is the Solidity code for the ATM contract:


```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint private pin;
    struct Transaction {
        uint256 amount;
        uint256 timestamp;
        string transactionType;
    }
    Transaction[] public transactions;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event BalanceUpdated(uint256 newBalance);
    event PinChanged(uint256 timestamp);

    constructor(uint initBalance, uint _pin) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        pin = _pin;
    }

    modifier onlyOwner(uint _pin) {
        require(msg.sender == owner, "You are not the owner of this account");
        require(pin == _pin, "Incorrect PIN");
        _;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit(uint256 _amount, uint _pin) public onlyOwner(_pin) payable {
        uint _previousBalance = balance;
        balance += _amount;
        assert(balance == _previousBalance + _amount);
        emit Deposit(_amount);
        transactions.push(Transaction(_amount, block.timestamp, "Deposit"));
    }

    function withdraw(uint256 _withdrawAmount, uint _pin) public onlyOwner(_pin) {
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert("Insufficient balance");
        }
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
        transactions.push(Transaction(_withdrawAmount, block.timestamp, "Withdraw"));
    }

    function updateBalance(uint256 _newBalance, uint _pin) public onlyOwner(_pin) {
        balance = _newBalance;
        emit BalanceUpdated(_newBalance);
        transactions.push(Transaction(_newBalance, block.timestamp, "Balance Update"));
    }

    function changePin(uint _newPin, uint _pin) public onlyOwner(_pin) {
        pin = _newPin;
        emit PinChanged(block.timestamp);
    }

    function getTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }
}
```



# React Application

Here is the React code for the frontend application:



```javascript

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [amount, setAmount] = useState(1);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
      getATMContract();
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance.toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        await atm.deposit(amount, parseInt(pin));
        getBalance();
        setPin(''); // Clear pin after successful transaction
        updateTransactionHistory();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        await atm.withdraw(amount, parseInt(pin));
        getBalance();
        setPin(''); // Clear pin after successful transaction
        updateTransactionHistory();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const changePin = async () => {
    if (atm) {
      try {
        await atm.changePin(parseInt(newPin), parseInt(pin));
        setPin(''); // Clear current pin after successful change
        setNewPin(''); // Clear new pin after successful change
        alert("PIN changed successfully!");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const updateBalance = async () => {
    if (atm) {
      try {
        await atm.updateBalance(parseInt(newBalance), parseInt(pin));
        getBalance();
        setNewBalance('');
        setPin('');
        updateTransactionHistory();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAmountChange = (event) => {
    setAmount(Number(event.target.value));
  };

  const handlePinChange = (event) => {
    setPin(event.target.value);
  };

  const handleNewPinChange = (event) => {
    setNewPin(event.target.value);
  };

  const handleNewBalanceChange = (event) => {
    setNewBalance(event.target.value);
  };

  const updateTransactionHistory = async () => {
    if (atm) {
      try {
        const history = await atm.getTransactions();
        const formattedHistory = history.map((tx) => ({
          amount: tx.amount.toNumber(),
          timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString(),
          type: tx.transactionType
        }));
        setTransactionHistory(formattedHistory);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p style={{ color: "orange" }}>Please install MetaMask in order to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount} className="button">
          Please connect your MetaMask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className="atm-container">
        <p className="account-info" style={{ color: "orange" }}>
          Your Account: {account}
        </p>
        <p className="account-info" style={{ color: "orange" }}>Your Balance: {balance} ETH</p>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          min="1"
          step="1"
          className="amount-input"
        />
        <input
          type="password"
          value={pin}
          onChange={handlePinChange}
          placeholder="Enter PIN"
          className="pin-input"
        />
        <button onClick={deposit} className="button">
          Deposit {amount} ETH
        </button>
        <button onClick={withdraw} className="button">
          Withdraw {amount} ETH
        </button>
        <input
          type="number"
          value={newBalance}
          onChange={handleNewBalanceChange}
          placeholder="Enter New Balance"
          className="balance-input"
        />
        <button onClick={updateBalance} className="button">
          Update Balance
        </button>
        <input
          type="password"
          value={newPin}
          onChange={handleNewPinChange}
          placeholder="Enter New PIN"
          className="pin-input"
        />
        <button onClick={changePin} className="button">
          Change PIN
        </button>
        <h2 style={{ color: "orange" }}>Transaction History</h2>
        <ul className="transaction-history" style={{ color: "orange" }}>
          {transactionHistory.map((tx, index) => (
            <li key={index} className="transaction-item">
              {tx.type}: {tx.amount} ETH at {tx.timestamp}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, [ethWallet]);

  return (
    <main className="container" style={{ backgroundColor: "black" }}>
      <header>
        <h1 style={{ color: "orange" }}>🦊 Welcome to the MetaMask ATM! 🦊</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Arial', sans-serif;
        }
        .atm-container {
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
          padding: 20px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }
        .button {
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          margin: 10px 5px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
          font-size: 16px;
        }
        .button:hover {
          background-color: #45a049;
        }
        .amount-input, .pin-input, .balance-input {
          padding: 10px;
          margin: 10px 0;
          font-size: 16px;
          border-radius: 5px;
          border: 1px solid #ccc;
          text-align: center;
        }
        .transaction-history {
          list-style-type: none;
          padding: 0;
        }
        .transaction-item {
          background-color:#ffd966;
          margin: 5px 0;
          padding: 10px;
          border-radius: 5px;
        }
        .account-info {
          margin: 10px 0;
        }
      `}</style>
    </main>
  );
}
```

## Getting Started

To get this project running on your computer, follow these steps:

1. **Clone the Repository:**
   - Clone the GitHub repository to your local machine using the following command:
     ```bash
     git clone <repository_url>
     ```
   - Replace `<repository_url>` with the URL of the GitHub repository.

2. **Install Dependencies:**
   - Navigate into the project directory in your terminal.
   - Run the following command to install the necessary dependencies:
     ```bash
     npm install
     ```

3. **Start Local Blockchain:**
   - Open a new terminal window in your VS Code.
   - Start a local blockchain node by running the following command:
     ```bash
     npx hardhat node
     ```

4. **Deploy Contracts:**
   - Open another new terminal window in your VS Code.
   - Deploy the smart contracts to the local blockchain by running:
     ```bash
     npx hardhat run --network localhost scripts/deploy.js
     ```

5. **Launch Frontend:**
   - Go back to the first terminal window.
   - Start the frontend application with the following command:
     ```bash
     npm run dev
     ```

6. **Accessing the Application:**
   - Once the frontend is running, open your web browser and go to [http://localhost:3000/](http://localhost:3000/) to access the application.


 ## Preview
![Web Application Preview](C:\Users\mihir\Pictures\Screenshots\metamask weboage.png)


![metamask weboage](https://github.com/MIHIR13396/ETH-AVAX-MODULE-2/assets/170404294/8b4345c3-d3bc-46f9-b351-89bae814707a)


## Authors

MIHIR  
[@MIHIR SINGH](www.linkedin.com/in/mihir-singh-0974832a8)


## License

This project is licensed under the MIT License - see the LICENSE.md file for details

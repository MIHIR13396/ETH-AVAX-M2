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
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [newBalance, setNewBalance] = useState('');

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
        await atm.changePin(parseInt(pin), parseInt(newPin));
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
        setNewBalance(''); // Clear new balance after successful update
        setPin(''); // Clear pin after successful transaction
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
        const count = await atm.transactionCount();
        const history = [];
        for (let i = 0; i < count; i++) {
          const tx = await atm.transactionHistory(i);
          history.push({
            amount: tx.amount.toNumber(),
            timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString(),
            type: tx.isDeposit ? "Deposit" : "Withdraw"
          });
        }
        setTransactionHistory(history);
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
          className="amount-input"
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
        .amount-input, .pin-input {
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
          background-color:#f1c232;
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

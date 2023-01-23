import React from "react";
import WalletConnectClass from "../assets/js/ConnectWallet";
import AlgoService from "../assets/js/Service";
import Transactions from "../assets/js/Transactions"

export default function TransferFunds(props){

    const [address, setAddress] = React.useState();
    const [receiver, setReceiver] = React.useState('');
    const [algo, setAlgo] = React.useState(0);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [txnId, setTxnId] = React.useState('');
    const [walletChoice, setWalletChoice] = React.useState('');

    const connectWallet = async (wallet) => {
        let accounts = []
        if(wallet === 'pera') {
            accounts = await WalletConnectClass.PeraLogin();

        } else if(wallet === 'algosigner') {
            accounts = await WalletConnectClass.AlgoSignerConnect();

        } else if(wallet === 'myalgo') {
            accounts = await WalletConnectClass.MyAlgoLogin();

        }

        setWalletChoice(wallet);

        if(accounts.length > 0) {
            setAddress(accounts[0].address);
        } else {
            setError('No accounts present in the wallet')
        }
    }

    const submitTxn = async () => {
        console.log(address, receiver);
        const txn = await AlgoService.createPaymentTxn(address, receiver, algo, "");
        setTxnId(txn.txID());
        try{
            await Transactions.signTransactions([txn], walletChoice);
            setSuccess(true);
        } catch(err) {

        }
       
    }

    return(
        <div>
            <h1>Funds Transfer Transaction</h1>
            <p>Address to transfer here: </p>
            <input  placeholder="Address to transfer" name="address" id="address" style={{width:500, height: 50, textAlign:'left'}} onChange={(e) => setReceiver(e.target.value)}></input> <br />
            <input  placeholder="Amount to transfer in ALGO" name="algo" id="algo" style={{width:500, height: 50, textAlign:'left', marginTop:'5%'}} onChange={(e) => setAlgo(e.target.value)}></input>
            {!address ? 
            <div>
                <button style={{marginRight:10}} onClick={() => connectWallet('pera')}>Pera</button>
                <button style={{marginRight:10}} onClick={() => connectWallet('algosigner')}>AlgoSigner</button>
                <button style={{marginRight:10}}  onClick={() => connectWallet('myalgo')}>MyAlgo</button>
            </div> : <></> }
            {error ? <p style={{color:'red'}}>{error}</p> : <></>}
            {address && !error ? 
                <div>
                    <p>My address: {address}</p>
                    <button onClick={() => submitTxn()}>Submit Transaction</button>
                </div> : <></> }
            {success ? <p style={{color:'green'}}>Transaction sent with ID: {txnId}</p> : <></>}
        </div>
    )
}
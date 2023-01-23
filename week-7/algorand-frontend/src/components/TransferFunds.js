import React from "react";
import WalletConnectClass from "../assets/js/ConnectWallet";

export default function TransferFunds(props){

    const [address, setAddress] = React.useState();

    const connectWallet = async (wallet) => {
        let accounts = []
        if(wallet === 'pera') {
            accounts = await WalletConnectClass.PeraLogin();

        } else if(wallet === 'algosigner') {
            accounts = await WalletConnectClass.AlgoSignerConnect();

        } else if(wallet === 'myalgo') {
            accounts = await WalletConnectClass.MyAlgoLogin();

        }

        console.log(accounts);
    }

    return(
        <div>
            <h1>Funds Transfer Transaction</h1>
            <p>Address to transfer here: </p>
            <input  placeholder="Address to transfer" name="address" id="address" style={{width:500, height: 50, textAlign:'left'}} onChange={(e) => setAddress(e.target.value)}></input>
            <div>
                <button style={{marginRight:10}} onClick={() => connectWallet('pera')}>Pera</button>
                <button style={{marginRight:10}} onClick={() => connectWallet('algosigner')}>AlgoSigner</button>
                <button style={{marginRight:10}}  onClick={() => connectWallet('myalgo')}>MyAlgo</button>
            </div>
            
        </div>
    )
}
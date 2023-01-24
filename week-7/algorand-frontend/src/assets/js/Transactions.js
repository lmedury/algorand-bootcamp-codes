import AlgoService from "./Service";
import MyAlgoConnect from '@randlabs/myalgo-connect';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import algosdk from 'algosdk';
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

window.Buffer = window.Buffer || require("buffer").Buffer;

class Transactions {

    static async signTransactions(transactions, wallet, ignoreTransactionIndex, signedTransaction){
        if(wallet === 'pera') {
            const connector = new WalletConnect({
                bridge: "https://bridge.walletconnect.org", // Required
                qrcodeModal: QRCodeModal,
            });
            
            const txnsToSign = transactions.map((txn, index) => {

                const encodedTxn = Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64");
                if(ignoreTransactionIndex === index) {
                    return {
                        txn: encodedTxn,
                        message: 'Signing a transaction here',
                        signers: [],
                    };
                } else {
                    return {
                        txn: encodedTxn,
                        message: 'Signing a transaction here'
                    };
                }
                
            });

            const requestParams = [txnsToSign];
            let txnsTobeSentToNetwork = []
            try{
                const request = formatJsonRpcRequest("algo_signTxn", requestParams);
                const signTransactionResult = await connector.sendCustomRequest(request);
                txnsTobeSentToNetwork = signTransactionResult.map((element, index) => {
                
                    if(ignoreTransactionIndex !== index) {
                        let signedTxnWithWallet = new Uint8Array(Buffer.from(element, "base64"));
                        return signedTxnWithWallet;
                    } else {
                        return signedTransaction.blob;
                    }
                
                });

            } catch (err) {
                return false;
            }
            
            return Transactions.sendToNetwork(txnsTobeSentToNetwork);

        } else if(wallet === 'algosigner') {
            let txns = transactions.map(txn => txn.toByte());
            txns = txns.map((txn, index) => {
                if(ignoreTransactionIndex === index) return {txn:window.AlgoSigner.encoding.msgpackToBase64(txn), signers:[]};
                else return {txn: window.AlgoSigner.encoding.msgpackToBase64(txn)}
            })
            let signedTxns = await window.AlgoSigner.signTxn(txns);
            const sendTxnsToNetwork = [];
           
            for (let i in txns) {
                
                if(ignoreTransactionIndex === parseInt(i)) sendTxnsToNetwork.push(signedTransaction.blob);
                else sendTxnsToNetwork.push(new Uint8Array(Buffer.from(signedTxns[i].blob, 'base64')));
               
            }
            return Transactions.sendToNetwork(sendTxnsToNetwork);
            
        } else if(wallet === 'myalgo') {
            const myAlgoConnect = new MyAlgoConnect();
            let txnsToBeSigned = transactions.map((txn) => txn.toByte());
            txnsToBeSigned = txnsToBeSigned.filter((txn, index) => index !== ignoreTransactionIndex);
            
            let signTxns = await myAlgoConnect.signTransaction(txnsToBeSigned);
            const signedTxns = [];
            if(ignoreTransactionIndex !== undefined) {
                signTxns.splice(ignoreTransactionIndex, 0, undefined);
            }
            
            for (let i in transactions) {
                
                if(ignoreTransactionIndex === parseInt(i)) signedTxns.push(signedTransaction.blob);
                else signedTxns.push(signTxns[i].blob);
            }
            return Transactions.sendToNetwork(signedTxns);
            
        }
    }

    static async sendToNetwork(txns){
        try {
            const status = await AlgoService.algoSendTxn(txns);
            return status;
        
        } catch (err) {
            return {success: false, err: err}
        }
    }
}

export default Transactions;
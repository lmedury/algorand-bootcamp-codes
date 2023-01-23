
import algosdk from "algosdk";

const client = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud");
const indexer = new algosdk.Indexer("", "https://testnet-idx.algonode.cloud");

class AlgoService {

    static async createPaymentTxn (sender, receiver, amt, note) {
        amt = algosdk.algosToMicroalgos(amt);
        const params = await client.getTransactionParams().do();
        const enc = new TextEncoder();
        note = enc.encode(note);
        let closeToRemaninder = undefined;
        let txn = algosdk.makePaymentTxnWithSuggestedParams(sender, receiver, amt, closeToRemaninder, note, params);
        return txn;
    }

    static async algoSendTxn(signedTxn, txId) {
        try {
            await client.sendRawTransaction(signedTxn).do();
            try{
                if(txId) await algosdk.waitForConfirmation(client, txId);
            } catch (err) {
                
            } finally {
                return {success:true};
            }
        } catch (err) {
            console.log(err);
            return {succes:false, err:err.message};
        }

    }



}

export default AlgoService;


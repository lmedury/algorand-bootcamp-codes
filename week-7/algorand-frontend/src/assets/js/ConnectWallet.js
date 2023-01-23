import MyAlgoConnect from '@randlabs/myalgo-connect';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";

window.Buffer = window.Buffer || require("buffer").Buffer;

class WalletConnectClass {

    static async AlgoSignerConnect(ledger) {
        try{
            if(!ledger) ledger = 'TestNet';
            if(window.AlgoSigner !== undefined) {

                await window.AlgoSigner.connect();
                let accounts = await window.AlgoSigner.accounts({
                    ledger: ledger
                });
                
                return accounts;

            } else {
                return false;
            }
        } catch (err) {
            return [];
        }
        
    }

    static async MyAlgoLogin () {
        try{
            const myAlgoConnect = new MyAlgoConnect();
            const accounts = await myAlgoConnect.connect();
            
            return accounts;
        } catch (err) {
            return []
        }
        
    }

    static async PeraLogin () {
        
        try {
            let accounts;
            const connector = new WalletConnect({
                bridge: "https://bridge.walletconnect.org", // Required
                qrcodeModal: QRCodeModal,
            });

            const connectorInfo = await connector.connect();
            
            accounts = connectorInfo.accounts;
            
            if (!connector.connected) {
                connector.createSession();
            }
            
            connector.on("connect", (error, payload) => {
                if (error) {
                    throw error;
                }
                accounts = payload.params[0];
                
            });

            connector.on("session_update", (error, payload) => {
                if (error) {
                    throw error;
                }
            });

            connector.on("disconnect", (error, payload) => {
                if (error) {
                    throw error;
                }
            });
            return accounts;
        
        } catch (err) {
            return [];
        }
    }

}

export default WalletConnectClass;
import MyAlgoConnect from '@randlabs/myalgo-connect';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";

window.Buffer = window.Buffer || require("buffer").Buffer;

class WalletConnectClass {

    static async AlgoSignerConnect(ledger) {
        try{
            if(!ledger) ledger = process.env.REACT_APP_NETWORK;
            if(window.AlgoSigner !== undefined) {

                await window.AlgoSigner.connect();
                let accounts = await window.AlgoSigner.accounts({
                    ledger: ledger
                });
                
                if(accounts.length > 0) {
                    if(!localStorage.getItem('address') || localStorage.getItem('address') === '' || localStorage.getItem('address') === undefined || localStorage.getItem('address') === 'null') {
                        localStorage.setItem('address', accounts[0].address);
                    }
                }
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
            if(accounts.length > 0) {
                if(!localStorage.getItem('address') || localStorage.getItem('address') === '' || localStorage.getItem('address') === undefined || localStorage.getItem('address') === 'null') {
                    localStorage.setItem('address', accounts[0].address);
                }
            }
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
            if(accounts.length > 0) {
                if(!localStorage.getItem('address') || localStorage.getItem('address') === '' || localStorage.getItem('address') === undefined || localStorage.getItem('address') === 'null') {
                    localStorage.setItem('address', accounts[0]);
                }
            }
            
            if (!connector.connected) {
                connector.createSession();
            }
            
            connector.on("connect", (error, payload) => {
                if (error) {
                    throw error;
                }
                accounts = payload.params[0];
                if(accounts.length > 0) {
                    if(!localStorage.getItem('address') || localStorage.getItem('address') === '' || localStorage.getItem('address') === undefined || localStorage.getItem('address') === 'null') {
                        localStorage.setItem('address', accounts[0]);
                    }
                }
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

    static disconnectWallet = () => {
        let wallet = localStorage.getItem('wallet');
        localStorage.removeItem('wallet');
        localStorage.removeItem('address');
        try{
            const connector = new WalletConnect({
                bridge: "https://bridge.walletconnect.org", // Required
                qrcodeModal: QRCodeModal,
            });
            
            if(connector && wallet === 'pera') connector.killSession();
        } catch (err) {

        }
    }

    static getConnectedWallet = () => {
        try{
            let address = localStorage.getItem('address');
            let wallet = localStorage.getItem('wallet');
            if(address === 'null' || address === 'undefined') return ({wallet: null, address:null})
            return ({wallet: wallet, address:address});
        } catch (err) {
            return false;
        } 
    }
}

export default WalletConnectClass;
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Network, Alchemy } from "alchemy-sdk";
admin.initializeApp();
const db = admin.firestore();

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
exports.scheduledFunctionCrontab = functions.pubsub.schedule('5 11 * * *')
  .timeZone('America/New_York') // Users can choose timezone - default is America/Los_Angeles
  .onRun((context) => {
    
  console.log('This will be run every day at 11:05 AM Eastern!');
  return null;
});


const collectionName = "Expprotocol";

export const onItemWrite = functions.firestore
  .document(`moralis/events/${collectionName}/{id}`)
  .onWrite(async (change) => {
    const event:any = change.after.data();
            console.log(event.chainId, "chainId");
            console.log(event.name, "name");
            console.log(event.lendId, "lendId");

            const lenddb: any = db.collection("database-main").doc(String(event.chainId)+"-"+String(event.lendId));
            if (event.name == "RentStarted") {
                console.log("rent event");
                let isGuarantor: boolean;
                if (event.guarantorBalance == 0) {
                    isGuarantor = false;
                    }  
                else {              
                    isGuarantor = true;
                    }
                lenddb.update({
                    lendId: String(event.lendId),
                    renter: String(event.renter),
                    guarantor: String(event.guarantor),
                    guarantorBalance: String(event.guarantorBalance),
                    guarantorFee: String(event.guarantorFee),
                    isRent: true,
                    isGuarantor: isGuarantor,
                })
            }
            if (event.name == "LendCanceled") {
                console.log("cancel event");
                lenddb.update({
                    lendId: String(event.lendId),
                    isActice: false,
                })
            }
            //isActiveフラグをイベントの更新でいじる
            if (event.name == "RentReturned") {
                console.log("return event");
                lenddb.update({
                    lendId: String(event.lendId),
                    isRent: false,
                    isActive: true,
                })
            }

            if (event.name == "ERC721LendRegistered" || event.name == "ERC1155LendRegistered") {
                let chain:any = Network.ETH_MAINNET
                if (event.chainId == 5) {
                    chain = Network.ETH_GOERLI;               
                }
                if (event.chainId == 1) {
                    chain = Network.ETH_MAINNET;
                }
                if (event.chainId == 137) {
                    chain = Network.MATIC_MAINNET;
                }
                if (event.chainId == 80001) {
                    chain = Network.MATIC_MUMBAI;
                }
                const settings = {
                    apiKey: process.env.ALCHEMY, // Replace with your Alchemy API Key.
                    network: chain, // Replace with your network.
                };
                const alchemy = new Alchemy(settings);
                const nftData:any = await alchemy.nft.getNftMetadata(event.token, event.tokenId);
                console.log(nftData, "nftData");
                
                if (event.name == "ERC721LendRegistered") {
                    console.log("lend 721 event");
                    lenddb.set({
                        chianId: String(event.chainId),
                        lendId: String(event.lendId),
                        lender: String(event.lender),
                        collectionAddress: String(event.token),
                        tokenId: String(event.tokenId),
                        perPrice: String(event.pricePerSec),
                        collateralPrice: String(event.totalPrice),
                        paymentAddress: String(event.payment),
                        tokenAmount: String(1),
                        isRent: false,
                        isActice: true,
                        autoReRegister: Boolean(event.autoReRegister),
                        tokenType: String(721),
                        tokenName: String(nftData.title),
                        tokenImage: String(nftData.media[0].gateway),


                    }, { merge: true }
                    )
                }
                if (event.name == "ERC1155LendRegistered") {
                    console.log("lend 1155 event");
                    lenddb.set({
                        chianId: String(event.chainId),
                        lendId: String(event.lendId),
                        lender: String(event.lender),
                        collectionAddress: String(event.token),
                        tokenId: String(event.tokenId),
                        perPrice: String(event.pricePerSec),
                        collateralPrice: String(event.totalPrice),
                        paymentAddress: String(event.payment),
                        tokenAmount: String(event.amount),
                        isRent: false,
                        isActice: true,
                        autoReRegister: Boolean(event.autoReRegister),
                        tokenType: String(1155),
                        tokenName: String(nftData.rawMetadata.name),
                        tokenImage: String(nftData.media.gateway),

                    }, { merge: true }
                    )
                }
                
                    
                const docRef = db.collection("collection").doc(String(event.chainId)+"-"+String(event.collectionAddress));
                const docSnapshot = await docRef.get();
                if (!docSnapshot.exists) {
                    console.log("write collection");
                    docRef.set({
                        chainId: String(event.chainId),
                        collectionName: String(nftData.contract.name),
                        collectionAddress: String(event.token),
                        collectionImage: String(nftData.media.gateway),
                        isWhitelist: false,
                    }, { merge: true }                    
                    )
                }  
            }
        }


        

    
    );
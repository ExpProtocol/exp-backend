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



const collectionName = "Goerlitest";

export const onItemWrite = functions.firestore
  .document(`moralis/events/${collectionName}/{id}`)
  .onWrite(async (change) => {
    const event:any = change.after.data();
            console.log(event.chainId, "chainId");
            console.log(event.name, "name");
            console.log(event.lendId, "lendId");

            const lenddb: any = db.collection("database-test").doc(String(event.chainId)+"-"+String(event.lendId));
            if (event.name == "Rent") {
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
            const settings = {
                apiKey: process.env.ALCHEMY, // Replace with your Alchemy API Key.
                network: chain, // Replace with your network.
            };
            const alchemy = new Alchemy(settings);
            const nftData:any = await alchemy.nft.getNftMetadata(event.collectionAddress, event.tokenId);
            console.log(nftData, "nftData");
            
            if (event.name == "LendERC721") {
                console.log("lend 721 event");
                lenddb.set({
                    chianId: String(event.chainId),
                    lendId: String(event.lendId),
                    lender: String(event.lender),
                    collectionAddress: String(event.collectionAddress),
                    tokenId: String(event.tokenId),
                    perPrice: String(event.perPrice),
                    collateralPrice: String(event.collateralPrice),
                    paymentAddress: String(event.paymentAddress),
                    tokenAmount: String(1),
                    isRent: false,
                    isActice: true,
                    tokenType: String(721),
                    tokenName: String(nftData.title),
                    tokenImage: String(nftData.media[0].gateway),


                }, { merge: true }
                )
            }
            if (event.name == "LendERC1155") {
                console.log("lend 1155 event");
                lenddb.set({
                    chianId: String(event.chainId),
                    lendId: String(event.lendId),
                    lender: String(event.lender),
                    collectionAddress: String(event.collectionAddress),
                    tokenId: String(event.tokenId),
                    perPrice: String(event.perPrice),
                    collateralPrice: String(event.collateralPrice),
                    paymentAddress: String(event.paymentAddress),
                    tokenAmount: String(event.tokenAmount),
                    isRent: false,
                    isActice: true,
                    tokenType: String(1155),
                    tokenName: String(nftData.rawMetadata.name),
                    tokenImage: String(nftData.media.gateway),

                }, { merge: true }
                )
            }

        }


    
    );
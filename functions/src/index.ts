import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});



const collectionName = "Goerlitest";

export const onItemWrite = functions.firestore
  .document(`moralis/events/${collectionName}/{id}`)
  .onWrite(async (change) => {
    const event:any = change.after.data();
            console.log(event.chainId, "chainId");
            console.log(event.name, "name");
            console.log(event.lendId, "lendId");

            const lenddb: any = db.collection("database-test").doc(String(event.chainId)+"-"+String(event.lendId));
            if (event.name = "rent") {
                console.log("rent event");                
                lenddb.set({
                    lendId: String(event.lendId),
                    renter: String(event.renter),
                    guarantor: String(event.guarantor),
                    guarantorBalance: String(event.guarantorBalance),
                    guarantorFee: String(event.guarantorFee),
                    isRent: true,
                }, { merge: true }
                )
               
            }
            if (event.name = "LendERC721") {
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
                    tokenAmount: 1,
                    isRent: false,
                    isActice: true,
                    tokenType: String(721),

                }, { merge: true }
                )
            }
            if (event.name = "LendERC1155") {
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
                }, { merge: true }
                )
            }

        }


    
    );
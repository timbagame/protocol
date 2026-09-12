import { appendTransactionMessageInstructions, compileTransaction, createTransactionMessage, getBase64EncodedWireTransaction, getBase64Encoder, getTransactionDecoder, pipe, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash, } from "@solana/kit";
export function createLegacyTransaction(feePayer, lifetime, instructions) {
    return compileTransaction(pipe(createTransactionMessage({ version: "legacy" }), (message) => setTransactionMessageFeePayer(feePayer, message), (message) => setTransactionMessageLifetimeUsingBlockhash(lifetime, message), (message) => appendTransactionMessageInstructions(instructions, message)));
}
export function decodeTransactionBase64(value) {
    return getTransactionDecoder().decode(getBase64Encoder().encode(value));
}
export function encodeTransactionBase64(transaction) {
    return getBase64EncodedWireTransaction(transaction);
}
//# sourceMappingURL=transaction.js.map
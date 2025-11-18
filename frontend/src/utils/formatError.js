export function formatError(err) {
    if (!err) return "Unexpected error";

    const msg = err.message || String(err);

    if (msg.includes("User denied")) return "User rejected the transaction.";
    if (msg.includes("insufficient funds")) return "You don't have enough balance.";
    if (msg.includes("execution reverted")) return "Transaction failed on blockchain.";
    if (msg.includes("gas required exceeds allowance")) return "Gas limit too low.";

    return msg.split("Request Arguments")[0].trim(); // strip technical junk
}

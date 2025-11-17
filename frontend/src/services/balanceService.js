// src/services/balanceService.js
/**
 * balanceService
 * tiny helpers to compare wei
 */
export const BalanceService = {
    hasEnoughBalance({ userBalanceWei, requiredWei }) {
        try {
            const ub = BigInt(userBalanceWei || 0n);
            const rq = BigInt(requiredWei || 0n);
            return ub >= rq;
        } catch (err) {
            console.error("BalanceService.hasEnoughBalance error:", err);
            return false;
        }
    },
};

export default BalanceService;

import { BalanceService } from '../balanceService';

describe('BalanceService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => { });
    });

    test('should return true if user has enough balance', () => {
        const result = BalanceService.hasEnoughBalance({
            userBalanceWei: '1000000000000000000', // 1 ETH in wei
            requiredWei: '500000000000000000', // 0.5 ETH in wei
        });
        expect(result).toBe(true);
    });

    test('should return false if user does not have enough balance', () => {
        const result = BalanceService.hasEnoughBalance({
            userBalanceWei: '100000000000000000', // 0.1 ETH in wei
            requiredWei: '500000000000000000', // 0.5 ETH in wei
        });
        expect(result).toBe(false);
    });

    test('should handle invalid user balance gracefully', () => {
        const result = BalanceService.hasEnoughBalance({
            userBalanceWei: 'invalid',
            requiredWei: '500000000000000000', // 0.5 ETH in wei
        });
        expect(result).toBe(false);
    });

    test('should handle invalid required balance gracefully', () => {
        const result = BalanceService.hasEnoughBalance({
            userBalanceWei: '1000000000000000000', // 1 ETH in wei
            requiredWei: 'invalid',
        });
        expect(result).toBe(false);
    });

    test('should return true if both balances are zero', () => {
        const result = BalanceService.hasEnoughBalance({
            userBalanceWei: '0',
            requiredWei: '0',
        });
        expect(result).toBe(true);
    });

    test('should log an error for invalid user balance', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        BalanceService.hasEnoughBalance({
            userBalanceWei: 'invalid',
            requiredWei: '500000000000000000',
        });
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('BalanceService.hasEnoughBalance error:'),
            expect.any(SyntaxError) // Match any SyntaxError object
        );
        consoleSpy.mockRestore();
    });
});
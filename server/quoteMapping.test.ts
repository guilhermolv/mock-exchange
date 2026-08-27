import { describe, expect, it } from 'vitest';
import { mapContractQuotes } from './quoteMapping';

describe('Smarkets quote mapping', () => {
  it('maps exchange offers to back prices and exchange bids to lay prices', () => {
    const quotes = mapContractQuotes(
      {
        contract_a: {
          offers: [
            [5100, 1000],
            [5000, 2000],
          ],
          bids: [
            [4900, 3000],
            [4800, 4000],
          ],
        },
      },
      new Map(),
    );

    expect(quotes).toEqual([
      expect.objectContaining({
        contractId: 'contract_a',
        bestBackPrice: 5000,
        bestLayPrice: 4900,
        offers: [
          { price: 5000, quantity: 2000 },
          { price: 5100, quantity: 1000 },
        ],
        bids: [
          { price: 4900, quantity: 3000 },
          { price: 4800, quantity: 4000 },
        ],
      }),
    ]);
  });

  it('does not cross displayed best prices when the source book has a spread', () => {
    const [quote] = mapContractQuotes(
      {
        contract_a: {
          offers: [[6700, 1000]],
          bids: [[6500, 1000]],
        },
        contract_b: {
          offers: [[3600, 1000]],
          bids: [[3400, 1000]],
        },
      },
      new Map(),
    );

    expect(quote.bestBackPrice).toBeGreaterThanOrEqual(quote.bestLayPrice ?? 0);
  });
});

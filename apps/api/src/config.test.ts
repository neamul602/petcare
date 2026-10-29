import { describe, expect, it } from 'vitest';
import { trainingDecisions } from '@petcare/shared/config';
import { loadBusinessRules, loadRuntimeConfig } from './config.ts';

describe('API configuration', () => {
  it('loads the approved business rules', () => {
    const { trainingDecisions: loaded } = loadBusinessRules();
    expect(loaded.commissionBasisPoints).toEqual(trainingDecisions.commissionBasisPoints);
  });

  it('refuses to start when a value is missing', () => {
    const broken: Record<string, unknown> = { ...trainingDecisions };
    delete broken.disputeWindowMinutes;
    expect(() => loadBusinessRules(broken)).toThrow(/Invalid training decisions/);
  });

  it('refuses a malformed value', () => {
    expect(() =>
      loadBusinessRules({
        ...trainingDecisions,
        payoutBatch: { dayOfWeek: 9, localTime: '25h', timeZone: 'x' },
      }),
    ).toThrow();
  });

  it('has safe runtime defaults', () => {
    expect(loadRuntimeConfig({})).toMatchObject({ API_PORT: 3000 });
  });
});

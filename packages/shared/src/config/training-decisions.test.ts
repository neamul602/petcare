import { describe, expect, it } from 'vitest';
import { platformRules, trainingDecisions } from './training-decisions.ts';

// This test pins the approved values from memory-bank/standards/training-decisions.md on purpose.
describe('training decisions match the approved standard', () => {
  it('TD-1 and TD-2 windows', () => {
    expect(trainingDecisions.confirmationWindow).toEqual({
      baseMinutes: 24 * 60,
      peakMinutes: 12 * 60,
    });
    expect(trainingDecisions.disputeWindowMinutes).toBe(72 * 60);
  });

  it('TD-3 weekly Sunday batch', () => {
    expect(trainingDecisions.payoutBatch).toMatchObject({ dayOfWeek: 0, timeZone: 'Asia/Dhaka' });
  });

  it('TD-7 MFS first, card last', () => {
    expect(trainingDecisions.paymentMethods).toEqual(['bkash', 'nagad', 'card']);
  });

  it('TD-8 commission per tier', () => {
    const { tierA, tierAPeak, tierB } = trainingDecisions.commissionBasisPoints;
    expect([tierA / 100, tierAPeak / 100, tierB / 100]).toEqual([10, 8, 16]);
  });

  it('TD-9 six decline reasons, TD-13 six report categories, TD-14 three severities', () => {
    expect(trainingDecisions.declineReasons).toHaveLength(6);
    expect(trainingDecisions.reportCategories).toHaveLength(6);
    expect(trainingDecisions.acuteSeverities).toEqual(['minor', 'serious', 'critical']);
  });

  it('TD-15 photo and note only; TD-16 fees not modelled', () => {
    expect(trainingDecisions.updateMedia.video).toBe(false);
    expect(trainingDecisions.gatewayFeesModelled).toBe(false);
  });

  it('platform rules: launch neighbourhoods, dogs and cats, ceiling', () => {
    expect(platformRules.launchNeighbourhoods).toEqual(['gulshan', 'banani', 'baridhara']);
    expect(platformRules.species).toEqual(['dog', 'cat']);
    expect(platformRules.operatingCeiling).toMatchObject({
      activeProviders: 25,
      completedBookingsPer30Days: 75,
    });
  });

  it('cannot be changed at runtime', () => {
    expect(Object.isFrozen(trainingDecisions)).toBe(true);
    expect(Object.isFrozen(platformRules)).toBe(true);
  });
});

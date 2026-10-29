/**
 * Intake screening (DR-5, PRD §5): PetCare is boarding, not a clinic. A stay whose purpose is
 * diagnosis, treatment, clinical monitoring or a procedure is refused. Ordinary special care
 * (for example giving a diabetic dog his insulin) is allowed. The mechanism is an explicit
 * declaration plus a keyword guard that asks the owner to confirm (assumption A-D1).
 */
const CLINICAL_TERMS: Array<{ term: string; pattern: RegExp }> = [
  { term: 'surgery', pattern: /\b(surgery|surgical|operation|post-?op(erative)?)\b/i },
  { term: 'chemotherapy', pattern: /\bchemo(therapy)?\b/i },
  { term: 'dialysis', pattern: /\bdialysis\b/i },
  { term: 'iv drip', pattern: /\b(iv (fluids?|drip)|intravenous|drip)\b/i },
  { term: 'hospitalisation', pattern: /\bhospitali[sz]ation\b|\bintensive care\b|\bicu\b/i },
  { term: 'diagnosis', pattern: /\bdiagnos(e|is|tic)\b/i },
  {
    term: 'treatment',
    pattern: /\b(medical|clinical|veterinary) (treatment|care|procedure)\b|\btreatment (of|for)\b/i,
  },
  {
    term: 'monitoring',
    pattern: /\bmonitor(ing)? (his|her|the|a) (condition|illness|recovery)\b/i,
  },
  { term: 'wound care', pattern: /\bwound (care|dressing)\b|\bstitches\b|\bcatheter\b/i },
  { term: 'অস্ত্রোপচার', pattern: /অস্ত্রোপচার|অপারেশন/ },
  { term: 'কেমো', pattern: /কেমো|ডায়ালাইসিস|স্যালাইন/ },
];

export type ScreenResult =
  | { allowed: true }
  | { allowed: false; reason: 'clinical_request_rejected'; message: string }
  | { allowed: false; reason: 'needs_confirmation'; message: string; matched: string[] };

export function screenForClinicalPurpose(input: {
  declaredClinical?: boolean;
  confirmedNotClinical?: boolean;
  text?: string;
}): ScreenResult {
  if (input.declaredClinical) {
    return {
      allowed: false,
      reason: 'clinical_request_rejected',
      message:
        'PetCare is a boarding service and cannot take stays whose purpose is treatment, monitoring or a procedure. A veterinary clinic can help with that.',
    };
  }
  const matched = CLINICAL_TERMS.filter(({ pattern }) => pattern.test(input.text ?? '')).map(
    ({ term }) => term,
  );
  if (matched.length > 0 && !input.confirmedNotClinical) {
    return {
      allowed: false,
      reason: 'needs_confirmation',
      matched,
      message:
        'Please confirm this stay is for boarding and everyday care, not for treatment, monitoring or a procedure.',
    };
  }
  return { allowed: true };
}

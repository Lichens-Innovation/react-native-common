import type { UiSchema } from '@rjsf/utils';

/**
 * The answer of a Signature field (shared web + mobile contract, SPOTD-1218).
 *
 * The comment and the signature are independent: either can exist alone, and the comment survives a
 * signature being deleted or replaced. The four signature keys are all present or all absent. An
 * answer with neither is no answer at all (`undefined`), so clearing everything removes the row.
 */
export type SignatureAnswer = {
  comment?: string;
  /** One SVG path in the 300×100 drawing viewBox (see drawing.utils). */
  path?: string;
  signer_user_uuid?: string;
  /** The signer's name when they signed, frozen so the displayed name never changes. */
  signer_name?: string;
  /** `toISOString()` on the device when Save was pressed, the same format as other form datetimes. */
  signed_at?: string;
};

export type SignedAnswer = SignatureAnswer & Required<Omit<SignatureAnswer, 'comment'>>;

export type SignatureSigner = { userUuid: string; displayName: string };

const SIGNATURE_KEYS = ['path', 'signer_user_uuid', 'signer_name', 'signed_at'] as const;

const ANSWER_KEYS = ['comment', ...SIGNATURE_KEYS] as const;

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value !== '';

/** Keeps only the known keys holding a non-empty string; anything else (a stray `""`, junk) is dropped. */
export const normalizeSignatureAnswer = (raw: unknown): SignatureAnswer => {
  if (!raw || typeof raw !== 'object') return {};
  const source = raw as Record<string, unknown>;
  const answer: SignatureAnswer = {};
  for (const key of ANSWER_KEYS) {
    const value = source[key];
    if (isNonEmptyString(value)) answer[key] = value;
  }
  return answer;
};

export const hasSignature = (answer: SignatureAnswer | undefined): answer is SignedAnswer =>
  !!answer && SIGNATURE_KEYS.every((key) => isNonEmptyString(answer[key]));

/** The answer to store: an empty comment and a partial signature are left out, and nothing left is `undefined`. */
const toStoredAnswer = (answer: SignatureAnswer): SignatureAnswer | undefined => {
  const stored: SignatureAnswer = {};
  if (isNonEmptyString(answer.comment)) stored.comment = answer.comment;
  if (hasSignature(answer)) {
    for (const key of SIGNATURE_KEYS) stored[key] = answer[key];
  }
  return Object.keys(stored).length ? stored : undefined;
};

export const withSignature = (
  answer: SignatureAnswer,
  { path, signer, now }: { path: string; signer: SignatureSigner; now: Date }
): SignatureAnswer | undefined =>
  toStoredAnswer({
    comment: answer.comment,
    path,
    signer_user_uuid: signer.userUuid,
    signer_name: signer.displayName,
    signed_at: now.toISOString(),
  });

export const withoutSignature = (answer: SignatureAnswer): SignatureAnswer | undefined =>
  toStoredAnswer({ comment: answer.comment });

export const withComment = (answer: SignatureAnswer, comment: string): SignatureAnswer | undefined =>
  toStoredAnswer({ ...answer, comment });

/** True when someone other than `userUuid` signed; an unsigned field belongs to nobody. */
export const isSignedByOther = (answer: SignatureAnswer, userUuid: string | undefined): boolean =>
  hasSignature(answer) && answer.signer_user_uuid !== userUuid;

export type SignatureUiOptions = {
  /** Absent means true: the comment box is there unless the template turns it off. */
  enableComment: boolean;
  /** The template's label for the comment box, if it set a non-blank one. */
  commentLabel?: string;
};

export const readSignatureUiOptions = (uiSchema: UiSchema | undefined): SignatureUiOptions => {
  const options = (uiSchema?.['ui:options'] ?? {}) as Record<string, unknown>;
  const label = options.commentLabel;
  return {
    enableComment: options.enableComment !== false,
    commentLabel: typeof label === 'string' && label.trim() ? label : undefined,
  };
};

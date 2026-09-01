import registry from '../../shared/isl_intents.json';
import { SupportedIntent } from '../../types/recognition';

export const SUPPORTED_INTENTS = registry as SupportedIntent[];
export const INTENT_BY_ID = new Map(SUPPORTED_INTENTS.map((intent) => [intent.id, intent]));

if (SUPPORTED_INTENTS.length < 30 || SUPPORTED_INTENTS.length > 50) {
  throw new Error('The constrained recognition registry must contain 30 to 50 intents.');
}

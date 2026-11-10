import type { LiveEntry, RootFormDataStore, RootFormSnapshot } from './root-form-data-context';

type FormDataRecord = Record<string, unknown>;

// Retire only the entries rjsf has caught up on: dropping them all would repaint an older value whenever the cycle for one keystroke lands after the next keystroke was published. habit-hooks-disable non-essential-comment
const retireConvergedEntries = (
  live: ReadonlyMap<string, LiveEntry>,
  data?: FormDataRecord
): ReadonlyMap<string, LiveEntry> => {
  const converged = [...live].filter(([, entry]) => data?.[entry.slug] === entry.value);
  if (converged.length === 0) return live;

  const pruned = new Map(live);
  converged.forEach(([fieldId]) => pruned.delete(fieldId));
  return pruned;
};

/** habit-hooks-disable non-essential-comment
 * Live form data is kept outside React state and published through this stable store: a setState in
 * the renderer would hand `Form` a fresh props object and cost a whole-schema deep compare on every
 * keystroke (SPOTD-621). Methods are arrow properties because consumers pass them unbound
 * (`useSyncExternalStore(store.subscribe, store.getSnapshot)`).
 */
export class LiveRootFormDataStore implements RootFormDataStore {
  private readonly listeners = new Set<() => void>();
  private snapshot: RootFormSnapshot;

  constructor(initialData?: FormDataRecord) {
    this.snapshot = { data: initialData, live: new Map() };
  }

  getSnapshot = (): RootFormSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  setLiveValue = (fieldId: string, slug: string, value: unknown): void => {
    const existing = this.snapshot.live.get(fieldId);
    if (existing && existing.value === value) return;

    const nextLive = new Map(this.snapshot.live);
    nextLive.set(fieldId, { slug, value });
    this.publish({ data: this.snapshot.data, live: nextLive });
  };

  clearLiveValue = (fieldId: string): void => {
    if (!this.snapshot.live.has(fieldId)) return;

    const nextLive = new Map(this.snapshot.live);
    nextLive.delete(fieldId);
    this.publish({ data: this.snapshot.data, live: nextLive });
  };

  // A new baseline from the caller: every live entry described the previous data. habit-hooks-disable non-essential-comment
  reseed = (data?: FormDataRecord): void => {
    this.publish({ data, live: new Map() });
  };

  acceptFormData = (data?: FormDataRecord): void => {
    this.publish({ data, live: retireConvergedEntries(this.snapshot.live, data) });
  };

  private publish(snapshot: RootFormSnapshot): void {
    this.snapshot = snapshot;
    // Iterates a copy: a listener that unsubscribes while notified would mutate the Set mid-iteration. habit-hooks-disable non-essential-comment
    for (const listener of [...this.listeners]) {
      listener();
    }
  }
}

import { createContext, useContext, useSyncExternalStore } from 'react';

/** A value a widget has parsed but rjsf has not converged on yet. */
export type LiveEntry = {
  /** The top-level property name, so a converge check needs no id/prefix arithmetic. */
  slug: string;
  value: unknown;
};

export type RootFormSnapshot = {
  /** The last form data rjsf published. */
  data: Record<string, unknown> | undefined;
  /**
   * Live values keyed by rjsf field id (`root_slug`), NOT by property name: `name` is the bare
   * property key, so a nested `foo` and a top-level `foo` share it and a nested write would feed the
   * wrong number into a top-level formula (SPOTD-621).
   */
  live: ReadonlyMap<string, LiveEntry>;
};

/**
 * Live form data, published to the few fields that need it (ComputedField) WITHOUT making the rjsf
 * `Form` controlled.
 *
 * Why a store rather than the data itself: mirroring form data back into the `formData` prop turned
 * every internal change into a second whole-schema state derivation, and putting the changing data
 * in a context value re-rendered the renderer — and therefore handed `Form` a fresh props object —
 * on every keystroke. A store whose identity never changes does neither: only the fields that
 * actually subscribe re-render (SPOTD-621).
 */
export type RootFormDataStore = {
  getSnapshot: () => RootFormSnapshot;
  subscribe: (listener: () => void) => () => void;
  /**
   * Publish a value synchronously, ahead of rjsf's change cycle. A one-cycle-ahead cache only: the
   * renderer retires the entry as soon as rjsf converges on the same value, so rjsf stays the
   * authority on form data.
   */
  setLiveValue: (fieldId: string, slug: string, value: unknown) => void;
  /**
   * Drop a published value, handing the field back to rjsf's own form data.
   *
   * Retiring on convergence alone only covers rjsf AGREEING. rjsf can also overrule a value it was
   * handed — `plainLeafWasCleared` resets a cleared leaf, `shouldSanitize` sanitizes a leaf, an
   * if/then switch resets a sibling — and such an entry would never match and would shadow the real
   * form data indefinitely. Callers therefore clear on blur and on unmount, which bounds how long a
   * value the widget published can outlive rjsf's opinion of it.
   */
  clearLiveValue: (fieldId: string) => void;
};

const EMPTY_LIVE: ReadonlyMap<string, LiveEntry> = new Map();
const EMPTY_SNAPSHOT: RootFormSnapshot = { data: undefined, live: EMPTY_LIVE };

/** Used when a widget or field is rendered outside RjsfPaperRenderer (other themes, unit tests). */
const NOOP_STORE: RootFormDataStore = {
  getSnapshot: () => EMPTY_SNAPSHOT,
  subscribe: () => () => {},
  setLiveValue: () => {},
  clearLiveValue: () => {},
};

export const RootFormDataContext = createContext<RootFormDataStore>(NOOP_STORE);

export const useRootFormDataStore = (): RootFormDataStore => useContext(RootFormDataContext);

export const useRootFormSnapshot = (): RootFormSnapshot => {
  const store = useRootFormDataStore();

  return useSyncExternalStore(store.subscribe, store.getSnapshot);
};

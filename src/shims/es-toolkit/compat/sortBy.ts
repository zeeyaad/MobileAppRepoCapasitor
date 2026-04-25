type Iteratee<T> = ((item: T) => unknown) | string;

const toIteratees = <T>(iteratees?: Iteratee<T> | Array<Iteratee<T>>): Array<Iteratee<T>> => {
  if (!iteratees) {
    return [];
  }
  return Array.isArray(iteratees) ? iteratees : [iteratees];
};

const getValue = <T>(item: T, iteratee: Iteratee<T>): unknown => {
  if (typeof iteratee === "function") {
    return iteratee(item);
  }
  if (item && typeof item === "object") {
    return (item as Record<string, unknown>)[iteratee];
  }
  return undefined;
};

const compareValues = (a: unknown, b: unknown): number => {
  if (a === b) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  if (a === null) return 1;
  if (b === null) return -1;
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
};

const sortBy = <T>(collection: T[], iteratees?: Iteratee<T> | Array<Iteratee<T>>): T[] => {
  if (!Array.isArray(collection)) return [];

  const iterList = toIteratees(iteratees);
  const withIndex = collection.map((item, index) => ({ item, index }));

  return withIndex
    .sort((left, right) => {
      if (iterList.length === 0) {
        return left.index - right.index;
      }
      for (const iteratee of iterList) {
        const a = getValue(left.item, iteratee);
        const b = getValue(right.item, iteratee);
        const cmp = compareValues(a, b);
        if (cmp !== 0) return cmp;
      }
      return left.index - right.index;
    })
    .map(({ item }) => item);
};

export default sortBy;
export { sortBy };

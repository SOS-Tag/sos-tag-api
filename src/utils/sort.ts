enum SortOrder {
  ascending = 'ASC',
  descending = 'DESC',
}

type Order = `${SortOrder}`;

export type { Order };
export { SortOrder };

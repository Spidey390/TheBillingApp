export function isTableOccupied(table) {
  return table?.status === 'Occupied' || Boolean(table?.activeOrder?.items?.length);
}

import {rem, viewport} from './helpers';

// whitespace aside grid
export const colSideOffset = rem(24);

// space between columns
export const colOffset = rem(16);

export const columnsAmount = 4;
const sideOffsets = colSideOffset * 2;
const columnOffsets = colOffset * (columnsAmount - 1);
const space = viewport.width - (sideOffsets + columnOffsets);
const columnWidth = space / columnsAmount;

export const col = (n: number) => {
  if (n < 0 || n > columnsAmount) {
    throw new Error(`col(x) value should be in range [0, ${columnsAmount}]`);
  }

  if (n === 0) {
    return 0;
  }

  if (n === 1) {
    return columnWidth;
  }

  return n * columnWidth + (n - 1) * colOffset;
};

export type PageNavIndex = {
  id: string;
  nextId?: string;
  prevId?: string;
  parentId?: string;
  depth?: number;
  isLast?: boolean;
  isFirst?: boolean;
};

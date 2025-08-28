import { H3Type } from '@/types/coordinateHistory.type';

export const mergeH3Data = (data: H3Type[]): H3Type[] => {
  const mergedMap = new Map<string, H3Type>();

  data.forEach((item) => {
    const existing = mergedMap.get(item.h3Index);

    if (existing) {
      // Merge with existing data
      const mergedUsers = new Set([...existing.users, ...item.users]);

      mergedMap.set(item.h3Index, {
        ...existing,
        count: existing.count + item.count,
        users: Array.from(mergedUsers),
        uniqueUsers: mergedUsers.size,
        firstSeen: new Date(
          Math.min(new Date(existing.firstSeen).getTime(), new Date(item.firstSeen).getTime())
        ).toISOString(),
        lastSeen: new Date(
          Math.max(new Date(existing.lastSeen).getTime(), new Date(item.lastSeen).getTime())
        ).toISOString(),
      });
    } else {
      // First occurrence of this h3Index
      mergedMap.set(item.h3Index, { ...item });
    }
  });

  return Array.from(mergedMap.values());
};

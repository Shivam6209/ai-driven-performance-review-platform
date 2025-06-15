import { OKR, OKRLevel, OKRStatus, OKRPriority, OKRUpdate } from '@/types/okr';

export const getProgressColor = (progress: number): 'success' | 'primary' | 'warning' | 'error' => {
  if (progress >= 100) return 'success';
  if (progress >= 70) return 'primary';
  if (progress >= 40) return 'warning';
  return 'error';
};

export const formatDate = (date: Date | null | undefined): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const calculateAverageProgress = (okrs: { progress: number }[]): number => {
  if (okrs.length === 0) return 0;
  const sum = okrs.reduce((acc, okr) => acc + okr.progress, 0);
  return Math.round(sum / okrs.length);
};

export const validateOKR = (okr: Partial<OKR>): boolean => {
  // Required fields
  if (!okr.title?.trim()) return false;
  if (!okr.description?.trim()) return false;
  if (!okr.level) return false;
  if (!okr.start_date) return false;
  if (!okr.due_date) return false;
  if (!okr.status) return false;
  if (!okr.priority) return false;
  if (!Array.isArray(okr.tags)) return false;

  // Date validation
  if (new Date(okr.start_date) > new Date(okr.due_date)) return false;

  return true;
};

const priorityOrder: Record<OKRPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const sortOKRsByPriority = (okrs: { priority: OKRPriority }[]): typeof okrs => {
  return [...okrs].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

export const filterOKRsByLevel = (okrs: { level: OKRLevel }[], level: OKRLevel): typeof okrs => {
  return okrs.filter((okr) => okr.level === level);
};

export const filterOKRsByStatus = (okrs: { status: OKRStatus }[], status: OKRStatus): typeof okrs => {
  return okrs.filter((okr) => okr.status === status);
};

export const findParentChain = (okrId: string, okrs: OKR[]): OKR[] => {
  const okr = okrs.find((o) => o.id === okrId);
  if (!okr || !okr.parent_okr) return [];

  return [okr.parent_okr, ...findParentChain(okr.parent_okr.id, okrs)];
};

export const findChildrenRecursive = (okrId: string, okrs: OKR[]): OKR[] => {
  const directChildren = okrs.filter((okr) => okr.parent_okr?.id === okrId);
  const childrenOfChildren = directChildren.flatMap((child) => findChildrenRecursive(child.id, okrs));
  return [...directChildren, ...childrenOfChildren];
};

export const getProgressTrend = (updates: OKRUpdate[]): Array<{ x: Date; y: number }> => {
  return updates
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((update) => ({
      x: new Date(update.created_at),
      y: typeof update.new_value === 'number' ? update.new_value : 0,
    }));
};
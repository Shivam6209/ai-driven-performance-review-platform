// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'planned';
  teamId?: string;
  members?: string[];
}
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'planned';
  teamId?: string;
  members?: string[];
}

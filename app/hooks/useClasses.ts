import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ClassData {
  id: number;
  title: string;
  description: string;
  classNumber: string;
  duration: string;
  videoUrl: string;
  posterUrl: string;
  videos: any[];
  assessments: any[];
  resources: any[];
}

const fetchClasses = async (): Promise<ClassData[]> => {
  const response = await axios.get('/api/classes');
  if (response.data.success) {
    return response.data.data.sort((a: ClassData, b: ClassData) => a.id - b.id);
  }
  throw new Error(response.data.error || 'Failed to fetch classes');
};

export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 
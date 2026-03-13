import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { Notification } from '@/types';

export function useToast() {
  const dispatch = useAppDispatch();

  const toast = ({ 
    title, 
    description, 
    variant = 'info' 
  }: { 
    title: string; 
    description: string; 
    variant?: 'success' | 'error' | 'warning' | 'info' | 'destructive'
  }) => {
    // Map shadcn 'destructive' to our 'error'
    const type = variant === 'destructive' ? 'error' : variant;

    dispatch(addNotification({
      id: Math.random().toString(36).substring(7),
      type,
      title,
      message: description,
      timestamp: new Date().toISOString(),
      read: false,
    } as Notification));
  };

  return { toast };
}

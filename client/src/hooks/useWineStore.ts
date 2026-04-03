import { useWine } from '../contexts/WineContext';

export function useWineStore(_token?: string | null) {
  const context = useWine();

  return {
    ...context,
    filteredWines: context.wines, // For compatibility
  };
}

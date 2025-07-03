
import { useTimeEntryCore } from "./useTimeEntryCore";
import { useTimeEntryFetch } from "./useTimeEntryFetch";
import { useTimeEntryMutations } from "./useTimeEntryMutations";

export function useTimeEntryData() {
  const { timeEntries, loading, error } = useTimeEntryCore();
  const { fetchTimeEntries } = useTimeEntryFetch();
  const { addTimeEntry, updateTimeEntry, deleteTimeEntry } = useTimeEntryMutations();

  return {
    timeEntries,
    loading,
    error,
    fetchTimeEntries,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
  };
}

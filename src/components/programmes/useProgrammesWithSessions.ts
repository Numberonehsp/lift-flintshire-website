import { programmesByGroup } from '../../data/programmes'
import type { Programme, ProgrammeGroup } from '../../data/programmes'
import { useContentSheets } from '../../hooks/useContentSheets'

// Programmes in a group, with session rows from the content sheet where it has them.
export function useProgrammesWithSessions(group: ProgrammeGroup): Programme[] {
  const { sessionsByProgramme } = useContentSheets()
  return programmesByGroup(group).map(p => ({
    ...p,
    sessions: sessionsByProgramme[p.id]?.length ? sessionsByProgramme[p.id] : p.sessions,
  }))
}

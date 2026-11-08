import { useEffect, useRef, useState } from 'react'
import { AppDataContext } from './AppDataContext.js'
import { emptyAppData, loadAppData, saveAppResource, completeOnboardingData, addStoredItem, updateStoredItem, deleteStoredItem, addStoredHistory, updateStoredHistory, deleteStoredHistory } from './appDataStore.js'
import useCalendarToday from '../hooks/useCalendarToday.js'
import Button from '../components/ui/Button.jsx'

export default function AppDataProvider({ children }) {
  const today = useCalendarToday()
  const [data, setData] = useState(emptyAppData)
  const dataRef = useRef(emptyAppData)
  const [isLoading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [revision, setRevision] = useState(0)
  const ready = useRef(false)

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (!active) return
      try {
        const loaded = loadAppData()
        dataRef.current = loaded
        ready.current = true
        setData(loaded)
        setLoadError('')
      } catch (error) { ready.current = false; setLoadError(error.message) }
      setLoading(false)
    })
    return () => { active = false }
  }, [revision])

  function reload() {
    ready.current = false
    setLoading(true)
    setRevision(current => current + 1)
  }

  function saveResource(resource, value) {
    if (!ready.current) return { ok: false, error: '데이터를 먼저 불러와 주세요.' }
    try {
      const next = saveAppResource(dataRef.current, resource, value)
      dataRef.current = next
      setData(next)
      setSaveError('')
      return { ok: true }
    } catch (error) { setSaveError(error.message); return { ok: false, error: error.message } }
  }

  function commit(operation) {
    if (!ready.current) return { ok: false, error: '데이터를 먼저 불러와 주세요.' }
    try {
      const result = operation(dataRef.current)
      dataRef.current = result.data
      setData(result.data)
      setSaveError('')
      return { ok: true, itemId: result.itemId, historyId: result.historyId }
    } catch (error) {
      setSaveError(error.message)
      if (error.requiresReload) { ready.current = false; setLoadError(error.message) }
      return { ok: false, error: error.message }
    }
  }
  function completeOnboarding(wizard) { return commit(current => ({ data: completeOnboardingData(current, wizard) })) }
  function addItem(values, space) { return commit(current => addStoredItem(current, values, space)) }
  function updateItem(itemId, values, space) { return commit(current => updateStoredItem(current, itemId, values, space)) }
  function deleteItem(itemId) { return commit(current => deleteStoredItem(current, itemId)) }
  function addHistory(itemId, values) { return commit(current => addStoredHistory(current, itemId, values)) }
  function updateHistory(historyId, values) { return commit(current => updateStoredHistory(current, historyId, values)) }
  function deleteHistory(historyId) { return commit(current => deleteStoredHistory(current, historyId)) }

  if (isLoading) return <p role="status" className="p-5 text-body text-muted">저장된 데이터를 불러오고 있어요…</p>
  if (loadError) return <section className="mx-auto flex max-w-[375px] flex-col gap-4 p-5">
    <h1 className="font-heading text-title font-bold">데이터를 불러오지 못했어요</h1>
    <p role="alert" className="text-body text-danger">{loadError}</p>
    <p className="text-body text-muted">브라우저 저장소 접근이나 저장 데이터 형식을 확인한 뒤 다시 시도해 주세요.</p>
    <Button onClick={reload}>다시 불러오기</Button>
  </section>
  return <AppDataContext.Provider value={{ ...data, today, isLoading, saveError, saveResource, completeOnboarding, addItem, updateItem, deleteItem, addHistory, updateHistory, deleteHistory, reload }}>
    {saveError && <div role="alert" className="fixed top-3 left-1/2 z-50 flex w-[calc(100vw-40px)] max-w-[335px] -translate-x-1/2 items-start gap-3 rounded-card border border-line bg-soft p-4 text-body text-danger shadow-lg">
      <p className="flex-1">{saveError}</p><button type="button" className="shrink-0 underline" onClick={() => setSaveError('')}>닫기</button>
    </div>}
    {children}
  </AppDataContext.Provider>
}

import { useEffect, useId, useRef, useState } from 'react'
import Field from '../../../components/ui/Field.jsx'
import { validateItemImageFile } from '../../../utils/itemImage.js'
import imageIcon from '../../../assets/icons/form-image.svg'

export default function ItemImagePicker({ value = null, onChange, onBusyChange }) {
  const id = useId()
  const inputRef = useRef(null)
  const version = useRef(0)
  const readerRef = useRef(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => () => { version.current++; readerRef.current?.abort() }, [])

  function loading(value) { setBusy(value); onBusyChange?.(value) }
  function removeImage() {
    version.current++
    readerRef.current?.abort()
    if (inputRef.current) inputRef.current.value = ''
    onChange?.(null)
    setError('')
    loading(false)
  }
  function selectImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const token = ++version.current
    readerRef.current?.abort()
    const invalid = validateItemImageFile(file)
    if (invalid) { setError(invalid); event.target.value = ''; loading(false); return }
    setError('')
    loading(true)
    const reader = new FileReader()
    readerRef.current = reader
    const fail = () => {
      if (token !== version.current) return
      setError('이미지를 읽거나 표시할 수 없어요. 다른 파일을 선택해 주세요.')
      if (inputRef.current) inputRef.current.value = ''
      loading(false)
    }
    reader.onerror = fail
    reader.onload = () => {
      if (token !== version.current) return
      const image = new Image()
      image.onerror = fail
      image.onload = () => {
        if (token !== version.current) return
        onChange?.(String(reader.result))
        loading(false)
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  }
  return <Field id={id} label="이미지 (선택)" hint="PNG·JPEG·WebP·GIF, 1MB 이하. 브라우저 저장 공간에 함께 보관해요." error={error}>
    <div className="rounded-card border border-dashed border-line bg-detail-soft/60 p-3">
      {value && <figure className="mb-3"><img src={value} alt="제품 이미지 미리보기" className="h-40 w-full rounded-input bg-surface object-contain" /></figure>}
      {busy && <p role="status" className="mb-2 text-caption text-primary">이미지를 확인하고 있어요…</p>}
      <input ref={inputRef} id={id} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={selectImage} aria-describedby={`${id}-message`} aria-invalid={error ? true : undefined} className="peer sr-only" />
      <label htmlFor={id} className="flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-input py-2 text-caption font-medium text-muted hover:bg-soft peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"><img src={imageIcon} alt="" className="[transform:scaleY(-1)]" />{value ? '이미지 변경' : '이미지 선택'}</label>
      {(value || busy || error) && <button type="button" onClick={removeImage} className="mt-1 w-full rounded-input py-2 text-caption text-danger hover:bg-surface">이미지 제거</button>}
    </div>
  </Field>
}

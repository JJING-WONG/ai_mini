import { useState } from 'react'
import TextField from '../../../components/ui/TextField.jsx'
import Button from '../../../components/ui/Button.jsx'

export default function InlineAddForm({ label, onAdd, onCancel }) {
  const [name, setName] = useState('')
  return <form onSubmit={event => { event.preventDefault(); if (name.trim()) onAdd(name.trim()) }} className="flex flex-col gap-3 rounded-card border border-line bg-detail-soft p-4">
    <TextField label={label} required autoFocus value={name} onChange={event => setName(event.target.value)} placeholder={label === '공간 이름' ? '예: 베란다' : '예: 베란다 바닥 청소'} />
    <div className="flex gap-2"><Button variant="secondary" onClick={onCancel}>취소</Button><Button type="submit" disabled={!name.trim()}>추가</Button></div>
  </form>
}

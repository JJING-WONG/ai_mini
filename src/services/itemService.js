import { defaultSpaces } from '../data/defaultSpaces.js'
import { defaultItems } from '../data/defaultItems.js'
import { validateResource } from '../repositories/dataValidation.js'

export function validateItemInput(values) {
  const errors = {}
  if (typeof values.spaceId !== 'string' || !values.spaceId.trim()) errors.spaceId = '소속 공간을 선택해 주세요.'
  if (typeof values.name !== 'string' || !values.name.trim()) errors.name = '관리 항목 이름을 입력해 주세요.'
  if (typeof values.interval !== 'string' || (values.interval !== '' && (!/^\d+$/.test(values.interval) || !Number.isSafeInteger(Number(values.interval)) || Number(values.interval) < 1))) errors.interval = '양의 정수 일수를 입력하거나 비워 주세요.'
  return errors
}

function itemFields(values) {
  if (Object.keys(validateItemInput(values)).length) throw new Error('필수 입력값과 관리 주기를 확인해 주세요.')
  const fields = { spaceId: values.spaceId, templateId: values.templateId || null, name: values.name.trim(),
    intervalDays: values.interval === '' ? null : Number(values.interval), modelName: values.modelName,
    specification: values.specification, image: values.image ?? null, memo: values.memo }
  if (fields.templateId !== null && !defaultItems.some(template => template.id === fields.templateId)) throw new Error('기본 관리 항목을 확인해 주세요.')
  return fields
}

function withSpace(data, spaceId, newSpace) {
  if (data.spaces.some(space => space.id === spaceId)) return data.spaces
  const space = defaultSpaces.find(space => space.id === spaceId) || newSpace
  if (!space || space.id !== spaceId || !validateResource('spaces', [space])) throw new Error('소속 공간을 확인해 주세요.')
  return [...data.spaces, { id: space.id, name: space.name }]
}

export function addItemData(data, values, newSpace, { id = () => crypto.randomUUID(), now = () => new Date().toISOString() } = {}) {
  const fields = itemFields(values)
  const item = { id: `item-${id()}`, ...fields, createdAt: now() }
  const next = { ...data, spaces: withSpace(data, fields.spaceId, newSpace), items: [...data.items, item] }
  if (!validateResource('items', next.items)) throw new Error('항목 정보나 이미지를 확인해 주세요.')
  return { data: next, itemId: item.id }
}

export function updateItemData(data, itemId, values, newSpace) {
  const original = data.items.find(item => item.id === itemId)
  if (!original) throw new Error('수정할 관리 대상을 찾을 수 없어요.')
  const fields = itemFields(values)
  // 수정 화면은 원래 템플릿 연결을 유지하거나 명시적으로 해제할 수 있습니다.
  if (fields.templateId !== null && fields.templateId !== original.templateId) throw new Error('기본 항목 연결을 임의로 변경할 수 없어요.')
  const item = { ...original, ...fields }
  const next = { ...data, spaces: withSpace(data, fields.spaceId, newSpace), items: data.items.map(current => current.id === itemId ? item : current) }
  if (!validateResource('items', next.items)) throw new Error('항목 정보나 이미지를 확인해 주세요.')
  return { data: next, itemId }
}

export function deleteItemData(data, itemId) {
  if (!data.items.some(item => item.id === itemId)) throw new Error('삭제할 관리 대상을 찾을 수 없어요.')
  return { ...data, items: data.items.filter(item => item.id !== itemId), histories: data.histories.filter(record => record.itemId !== itemId) }
}

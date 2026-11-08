import { isCalendarDate } from '../utils/date.js'
import { defaultItems } from '../data/defaultItems.js'
import { defaultSpaces } from '../data/defaultSpaces.js'

const text = value => typeof value === 'string'
const named = value => text(value) && value.trim().length > 0
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const timestamp = value => text(value) && Number.isFinite(Date.parse(value))
const templateIds = new Set(defaultItems.map(item => item.id))
const defaultSpaceNames = new Map(defaultSpaces.map(space => [space.id, space.name]))


const validators = {
  spaces: value => object(value) && named(value.id) && named(value.name)
    && (!defaultSpaceNames.has(value.id) || defaultSpaceNames.get(value.id) === value.name),
  items: value => object(value) && named(value.id) && !templateIds.has(value.id)
    && (value.templateId === null || templateIds.has(value.templateId)) && named(value.spaceId) && named(value.name)
    && (value.intervalDays === null || (Number.isSafeInteger(value.intervalDays) && value.intervalDays > 0))
    && ['modelName', 'specification', 'memo'].every(key => text(value[key]))
    && (value.image === null || (text(value.image) && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value.image)))
    && timestamp(value.createdAt)
    && !['lastManagedDate', 'lastManagedAt', 'nextDueDate', 'status'].some(key => Object.hasOwn(value, key)),
  histories: value => object(value) && named(value.id) && named(value.itemId) && isCalendarDate(value.managedAt)
    && ['initial', 'completed'].includes(value.type) && text(value.productUsed) && text(value.memo) && timestamp(value.createdAt),
}

export function validateResource(resource, value) {
  if (resource === 'onboarding') {
    return object(value) && typeof value.completed === 'boolean'
      && ['welcome', 'spaces', 'items', 'cycles'].includes(value.currentStep)
      && Array.isArray(value.selectedSpaceIds) && value.selectedSpaceIds.every(named)
      && new Set(value.selectedSpaceIds).size === value.selectedSpaceIds.length && object(value.draft)
  }
  return Array.isArray(value) && value.every(validators[resource]) && new Set(value.map(entry => entry.id)).size === value.length
}

export function validateReferences(data) {
  const spaces = new Set(data.spaces.map(space => space.id))
  const items = new Set(data.items.map(item => item.id))
  return data.items.every(item => spaces.has(item.spaceId)) && data.histories.every(record => items.has(record.itemId))
}

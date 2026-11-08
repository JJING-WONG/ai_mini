export const maxItemImageBytes = 1024 * 1024
export const itemImageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
export function validateItemImageFile(file) {
  if (!itemImageTypes.includes(file.type) || !file.size) return 'PNG, JPEG, WebP, GIF 이미지 파일을 선택해 주세요.'
  if (file.size > maxItemImageBytes) return '이미지는 1MB 이하로 선택해 주세요.'
  return ''
}

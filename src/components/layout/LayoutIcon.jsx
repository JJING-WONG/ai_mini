// 피그마 원본 SVG의 크기를 유지하고, 원본 레이어의 세로 반전을 적용합니다.
export default function LayoutIcon({ src, width, height }) {
  return (
    <span aria-hidden="true" className="inline-flex size-6 shrink-0 items-center justify-center">
      <span className="block bg-current [transform:scaleY(-1)]" style={{
        width, height, maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")`,
        maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
      }} />
    </span>
  )
}

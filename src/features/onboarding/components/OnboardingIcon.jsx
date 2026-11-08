import { onboardingAssets } from '../data/onboardingAssets.js'

export default function OnboardingIcon({ name, className = '' }) {
  const asset = onboardingAssets[name]
  return <span aria-hidden="true" className={`inline-block shrink-0 bg-current align-middle [transform:scaleY(-1)] ${className}`} style={{
    width: asset.width, height: asset.height,
    maskImage: `url("${asset.src}")`, WebkitMaskImage: `url("${asset.src}")`,
    maskPosition: 'center', maskRepeat: 'no-repeat', maskSize: 'contain',
  }} />
}

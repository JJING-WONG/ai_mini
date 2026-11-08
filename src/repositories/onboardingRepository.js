import { createRepository } from './storageRepository.js'
export const emptyOnboarding = { completed: false, currentStep: 'welcome', selectedSpaceIds: [], draft: {} }
export const onboardingRepository = createRepository('onboarding', emptyOnboarding)

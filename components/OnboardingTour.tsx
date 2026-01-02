'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, ArrowRight, BookOpen, Plus, Star, Users } from 'lucide-react'
import TreasureChest from './icons/TreasureChest'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action?: {
    label: string
    onClick: () => void
  }
}

export default function OnboardingTour() {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return

    // Check if user has completed onboarding
    const hasCompleted = localStorage.getItem(`onboarding_completed_${session.user.id}`)
    if (hasCompleted === 'true') {
      setCompleted(true)
      return
    }

    // Check if user has collections (if they do, skip onboarding)
    const checkCollections = async () => {
      try {
        const res = await fetch('/api/collections')
        if (res.ok) {
          const collections = await res.json()
          if (collections.length > 0) {
            // User has collections, mark onboarding as completed
            localStorage.setItem(`onboarding_completed_${session.user.id}`, 'true')
            setCompleted(true)
            return
          }
        }
      } catch (error) {
        console.error('Error checking collections:', error)
      }

      // Show first step after a short delay
      setTimeout(() => {
        setCurrentStep(0)
      }, 1000)
    }

    checkCollections()
  }, [session])

  const steps: OnboardingStep[] = [
    {
      id: 'create-collection',
      title: 'Start Your Trove',
      description: 'Create your first collection to begin building your trove. Track comics, cards, books, movies, or anything you collect!',
      icon: TreasureChest,
      action: {
        label: 'Create Collection',
        onClick: () => {
          // Dispatch custom event to trigger create collection dialog
          window.dispatchEvent(new CustomEvent('onboarding:create-collection'))
          markStepComplete()
        },
      },
    },
    {
      id: 'browse-recommended',
      title: 'Discover Recommended Collections',
      description: 'Browse curated collections recommended by experts. Perfect starting points to grow your trove!',
      icon: Star,
      action: {
        label: 'Browse Recommended',
        onClick: () => {
          window.location.href = '/recommended'
          markStepComplete()
        },
      },
    },
    {
      id: 'explore-community',
      title: 'Explore Community Collections',
      description: 'Discover collections shared by other collectors. Get inspired and find new treasures for your trove!',
      icon: Users,
      action: {
        label: 'Explore Community',
        onClick: () => {
          window.location.href = '/community'
          markStepComplete()
        },
      },
    },
  ]

  const markStepComplete = () => {
    if (session?.user?.id) {
      localStorage.setItem(`onboarding_step_${steps[currentStep!].id}_${session.user.id}`, 'true')
    }
    nextStep()
  }

  const nextStep = () => {
    if (currentStep === null) return

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const skipOnboarding = () => {
    completeOnboarding()
  }

  const completeOnboarding = () => {
    if (session?.user?.id) {
      localStorage.setItem(`onboarding_completed_${session.user.id}`, 'true')
      // Also clear all step markers
      steps.forEach(step => {
        localStorage.removeItem(`onboarding_step_${step.id}_${session.user.id}`)
      })
    }
    setCompleted(true)
    setCurrentStep(null)
  }

  // Listen for restart event
  useEffect(() => {
    const handleRestart = () => {
      if (session?.user?.id) {
        localStorage.removeItem(`onboarding_completed_${session.user.id}`)
        steps.forEach(step => {
          localStorage.removeItem(`onboarding_step_${step.id}_${session.user.id}`)
        })
        setCompleted(false)
        setCurrentStep(0)
      }
    }

    window.addEventListener('onboarding:restart', handleRestart)
    return () => window.removeEventListener('onboarding:restart', handleRestart)
  }, [session?.user?.id])

  if (completed || currentStep === null) {
    return null
  }

  const step = steps[currentStep]
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={skipOnboarding} />
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 pointer-events-auto">
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--accent-color)]/10 rounded-lg">
                  <Icon className="h-6 w-6 text-[var(--accent-color)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipOnboarding}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[var(--text-secondary)] mb-6">
              {step.description}
            </p>
            <div className="flex gap-3">
              {step.action && (
                <Button
                  onClick={step.action.onClick}
                  className="accent-button text-white smooth-transition flex-1"
                >
                  {step.action.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                onClick={nextStep}
                className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
            <div className="mt-4 flex gap-2 justify-center">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-[var(--accent-color)] w-8'
                      : 'bg-[var(--bg-tertiary)] w-2'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


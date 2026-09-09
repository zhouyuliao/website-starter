'use client'

import { useEffect, useState } from 'react'
import { HomeScreen } from '@/components/home-screen'
import { LaunchScreen } from '@/components/launch-screen'
import { ProfileScreen } from '@/components/profile-screen'
import { QuotesScreen } from '@/components/quotes-screen'
import { RegisterScreen } from '@/components/register-screen'
import { TabBar, type TabId } from '@/components/tab-bar'
import { clearAuthToken, getCurrentUser, registerUser, updateCurrentUser } from '@/lib/api'
import { identities, type IdentityId, type Profile } from '@/lib/data'

type Stage = 'launch' | 'register' | 'main'

const emptyProfile: Profile = { name: '', phone: '', address: '' }

export default function Page() {
  const [stage, setStage] = useState<Stage>('launch')
  const [identityId, setIdentityId] = useState<IdentityId | null>(null)
  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const [tab, setTab] = useState<TabId>('home')

  useEffect(() => {
    let active = true
    void getCurrentUser().then((user) => {
      if (!active || !user) return
      setIdentityId(user.identityId)
      setProfile({ name: user.name, phone: user.phone, address: user.address })
      setStage('main')
    })

    try {
      const saved = window.localStorage.getItem('concrete-profile')
      if (saved) {
        const parsed = JSON.parse(saved) as { identityId?: IdentityId; profile?: Profile }
        if (parsed.identityId && parsed.profile?.name && parsed.profile.phone && parsed.profile.address) {
          setIdentityId(parsed.identityId)
          setProfile(parsed.profile)
          setStage('main')
        }
      }
    } catch {
      window.localStorage.removeItem('concrete-profile')
    }
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (stage !== 'main' || !identityId) return
    window.localStorage.setItem('concrete-profile', JSON.stringify({ identityId, profile }))
  }, [stage, identityId, profile])

  const identity = identities.find((i) => i.id === identityId) ?? identities[0]

  const handleLogout = () => {
    setStage('launch')
    setIdentityId(null)
    setProfile(emptyProfile)
    setTab('home')
    window.localStorage.removeItem('concrete-profile')
    clearAuthToken()
  }

  const handleRegister = async (nextProfile: Profile, password: string) => {
    if (!identityId) throw new Error('请选择您的身份')
    const user = await registerUser({ identityId, ...nextProfile, password })
    setIdentityId(user.identityId)
    setProfile({ name: user.name, phone: user.phone, address: user.address })
    setTab('home')
    setStage('main')
  }

  const handleProfileSave = (nextProfile: Profile) => {
    setProfile(nextProfile)
    if (identityId) void updateCurrentUser({ identityId, profile: nextProfile })
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink md:py-6">
      {/* 桌面端装饰背景 */}
      <div aria-hidden className="pointer-events-none fixed inset-0 hidden md:block">
        <div className="hazard-stripes absolute inset-x-0 top-0 h-1.5 opacity-60" />
        <div className="hazard-stripes absolute inset-x-0 bottom-0 h-1.5 opacity-60" />
        <div className="absolute left-10 top-1/2 -translate-y-1/2 font-display text-xs tracking-[0.6em] text-white/20 [writing-mode:vertical-rl]">
          CONCRETE PRICING ASSISTANT
        </div>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 font-display text-xs tracking-[0.6em] text-white/20 [writing-mode:vertical-rl]">
          BATCHING PLANT QUOTE
        </div>
      </div>

      {/* 手机壳框架 */}
      <div className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background md:h-[min(880px,92dvh)] md:rounded-[28px] md:border md:border-white/10 md:shadow-2xl">
        {stage === 'launch' && (
          <LaunchScreen
            selected={identityId}
            onSelect={setIdentityId}
            onNext={() => setStage('register')}
          />
        )}

        {stage === 'register' && (
          <RegisterScreen
            identity={identity}
            initial={profile}
            onBack={() => setStage('launch')}
            onDone={handleRegister}
          />
        )}

        {stage === 'main' && (
          <>
            {tab === 'home' && (
              <HomeScreen profile={profile} identity={identity} onNavigate={setTab} />
            )}
            {tab === 'quotes' && <QuotesScreen />}
            {tab === 'profile' && (
              <ProfileScreen
                profile={profile}
                identity={identity}
                onSave={handleProfileSave}
                onNavigate={setTab}
                onSwitchIdentity={() => setStage('launch')}
                onLogout={handleLogout}
              />
            )}
            <TabBar active={tab} onChange={setTab} />
          </>
        )}
      </div>
    </main>
  )
}

'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import { ChangeEvent, ReactNode, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  ArrowLeft,
  AtSign,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Globe,
  HelpCircle,
  ImagePlus,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Palette,
  Phone,
  Shield,
  Sparkles,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { FaCheck } from 'react-icons/fa';
import { AiOutlineGlobal } from 'react-icons/ai';
import { FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { LoaderSmall } from '@/components/ui/loader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ShareDialog } from '@/components/share-button/share-option';
import { showTopToast } from '@/components/toast/toast-util';
import defaultImage from '@/assests/default.jpeg';
import { ProtectedRoute } from '@/components/auth/ProtectedRoutes';
import { ScreenProvider } from '@/components/screen/screen-provider';
import { useShare } from '@/hooks/share-option';
import { authApi } from '@/lib/axios';
import { cn, MAX_IMAGE_SIZE, passwordRegex, uploadMedia } from '@/lib/utils';
import { DESKTOP_ROUTES } from '@/lib/routes';
import {
  SEARCH_BORDER_COLORS,
  SearchBorderColorId,
  useAppearanceStore,
} from '@/store/appearance-store';
import { useAuthStore } from '@/store/auth-store';
import { useEventTags } from '@/store/event-tag-store';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { UserPaymentInfo } from '@/components/wallet/user-payment-infos';

type SettingsSection =
  | 'profile'
  | 'appearance'
  | 'preferences'
  | 'payment-method'
  | 'privacy'
  | 'help'
  | 'invite'
  | 'connect'
  | 'logout'
  | 'delete';

interface SettingsNavItem {
  value: SettingsSection;
  label: string;
  eyebrow: string;
  icon: ReactNode;
}

const settingsNav: SettingsNavItem[] = [
  {
    value: 'profile',
    label: 'Edit profile',
    eyebrow: 'Identity and socials',
    icon: <User size={18} />,
  },
  {
    value: 'appearance',
    label: 'Appearance',
    eyebrow: 'Theme and accents',
    icon: <Palette size={18} />,
  },
  {
    value: 'preferences',
    label: 'Preferences',
    eyebrow: 'Experience interests',
    icon: <Sparkles size={18} />,
  },
  {
    value: 'payment-method',
    label: 'Payment methods',
    eyebrow: 'Wallet accounts',
    icon: <CreditCard size={18} />,
  },
  {
    value: 'privacy',
    label: 'Privacy',
    eyebrow: 'Data and policy',
    icon: <Shield size={18} />,
  },
  {
    value: 'help',
    label: 'Help',
    eyebrow: 'Support and FAQs',
    icon: <HelpCircle size={18} />,
  },
  {
    value: 'invite',
    label: 'Invite friends',
    eyebrow: 'Share Drifto',
    icon: <Users size={18} />,
  },
  {
    value: 'connect',
    label: 'Connect',
    eyebrow: 'Social links',
    icon: <AtSign size={18} />,
  },
  {
    value: 'logout',
    label: 'Sign out',
    eyebrow: 'End session',
    icon: <LogOut size={18} />,
  },
  {
    value: 'delete',
    label: 'Delete account',
    eyebrow: 'Permanent action',
    icon: <Trash2 size={18} />,
  },
];

const themeOptions: Array<{
  value: 'light' | 'dark' | 'system';
  label: string;
  helper: string;
}> = [
  {
    value: 'system',
    label: 'System',
    helper: 'Follow your operating system setting.',
  },
  {
    value: 'light',
    label: 'Light',
    helper: 'Use brighter surfaces across Drifto.',
  },
  { value: 'dark', label: 'Dark', helper: 'Use dark surfaces across Drifto.' },
];

const policyItems = [
  {
    title: 'How Drifto uses personal information',
    content:
      'We use account, booking, profile, and location information to provide event discovery, ticketing, payments, safety, support, and service improvements.',
  },
  {
    title: 'How your information is protected',
    content:
      'We use access control, secure service providers, and operational safeguards to reduce unauthorized access, alteration, or disclosure.',
  },
  {
    title: 'Your data rights',
    content:
      'You can update your profile, preferences, and account information from settings. You can also request account deletion when account conditions are met.',
  },
  {
    title: 'Payments and transactions',
    content:
      'Payments are handled through trusted payment providers. Order and transaction history may remain available for legal, fraud-prevention, and support records.',
  },
];

const faqItems = [
  {
    title: 'How do I book an experience?',
    content:
      'Open an event, choose a ticket, complete checkout, and your ticket will appear in Plans.',
  },
  {
    title: 'What if a host cancels an event?',
    content:
      'Refund handling depends on the event, timing, and refund rules. Use the refund entry point from your booking when eligible.',
  },
  {
    title: 'How do I update my profile?',
    content:
      'Use Edit profile in settings to update your photo, name, username, bio, date of birth, and social links.',
  },
];

const connectLinks = [
  { label: 'Follow us on X', href: 'https://x.com/driftoapp' },
  {
    label: 'Follow us on Instagram',
    href: 'https://www.instagram.com/driftoapp/',
  },
  {
    label: 'Subscribe on YouTube',
    href: 'https://www.youtube.com/@DriftoExperience',
  },
  {
    label: 'Connect on LinkedIn',
    href: 'https://www.linkedin.com/company/drifto-app/',
  },
  {
    label: 'Explore Drifto',
    href: process.env.NEXT_PUBLIC_WEBSITE_BASE_URL ?? 'https://drifto.app',
  },
];

const preferenceColors = [
  'bg-rose-500',
  'bg-teal-500',
  'bg-sky-600',
  'bg-yellow-600',
  'bg-orange-600',
  'bg-fuchsia-600',
  'bg-emerald-600',
  'bg-indigo-600',
];

const deleteChecklist = [
  'Your account has no active events',
  'Your wallet balance is ₦0',
  'You don’t have any tickets still eligible for refunds',
  'You have no posts left on your profile',
];

const deleteRetainedData = [
  'Your order history will still be saved',
  'Your transaction history will still be saved',
  'Any tickets you already used or that are non-refundable will remain in our system',
];

function getSection(value: string | null): SettingsSection {
  return settingsNav.some((item) => item.value === value)
    ? (value as SettingsSection)
    : 'profile';
}

export function DesktopSettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prev = searchParams?.get('prev') ?? null;
  const activeSection = getSection(searchParams?.get('section') ?? null);
  const activeItem =
    settingsNav.find((item) => item.value === activeSection) ?? settingsNav[0];

  const setSection = (section: SettingsSection) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('section', section);
    router.replace(`${DESKTOP_ROUTES.settings}?${params.toString()}`);
  };

  const handleBack = () => {
    router.push(prev ?? '/?screen=profile');
  };

  return (
    <ProtectedRoute>
      <ScreenProvider>
        <div className="min-h-screen bg-background text-foreground">
          <div className="desktop-page-container py-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Account
                </p>
                <h1 className="mt-1 text-4xl font-black tracking-tight">
                  Settings
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Manage account details, personalization, privacy, support, and
                  account actions.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handleBack}
              >
                Back
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[clamp(18rem,22vw,23rem)_minmax(0,1fr)]">
              <aside className="h-fit rounded-2xl border border-border bg-card p-3 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto">
                <nav className="grid gap-1">
                  {settingsNav.map((item) => {
                    const isActive = activeSection === item.value;
                    const isDestructive = item.value === 'delete';
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSection(item.value)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-3 text-left transition',
                          isActive
                            ? isDestructive
                              ? 'bg-red-600 text-white'
                              : 'bg-blue-800 text-white'
                            : isDestructive
                              ? 'text-red-600 hover:bg-red-500/10'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            isActive
                              ? 'bg-white/15'
                              : isDestructive
                                ? 'bg-red-500/10 text-red-600'
                                : 'bg-background text-foreground',
                          )}
                        >
                          {item.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black">
                            {item.label}
                          </span>
                          <span
                            className={cn(
                              'block truncate text-xs',
                              isActive
                                ? 'text-white/65'
                                : isDestructive
                                  ? 'text-red-600/70'
                                  : 'text-muted-foreground',
                            )}
                          >
                            {item.eyebrow}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              <main className="min-w-0">
                <section className="rounded-2xl border border-border bg-card shadow-sm">
                  <div className="border-b border-border p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                      {activeItem.eyebrow}
                    </p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight">
                      {activeItem.label}
                    </h2>
                  </div>
                  <div className="p-6">
                    {activeSection === 'profile' ? <ProfileSettings /> : null}
                    {activeSection === 'appearance' ? (
                      <AppearanceSettings />
                    ) : null}
                    {activeSection === 'preferences' ? (
                      <PreferenceSettings />
                    ) : null}
                    {activeSection === 'payment-method' ? (
                      <PaymentMethodSettings />
                    ) : null}
                    {activeSection === 'privacy' ? <PrivacySettings /> : null}
                    {activeSection === 'help' ? <HelpSettings /> : null}
                    {activeSection === 'invite' ? <InviteSettings /> : null}
                    {activeSection === 'connect' ? <ConnectSettings /> : null}
                    {activeSection === 'logout' ? <LogoutSettings /> : null}
                    {activeSection === 'delete' ? <DeleteSettings /> : null}
                  </div>
                </section>
              </main>
            </div>
          </div>
        </div>
      </ScreenProvider>
    </ProtectedRoute>
  );
}

function ProfileSettings() {
  const { user, setUser } = useAuthStore();
  const [profileMode, setProfileMode] = useState<
    'overview' | 'email' | 'phone' | 'password'
  >('overview');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [username, setUsername] = useState(user?.username || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || user?.aboutText || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [instagramHandle, setInstagramHandle] = useState(
    user?.instagramHandle || '',
  );
  const [twitterHandle, setTwitterHandle] = useState(user?.twitterHandle || '');
  const [facebookHandle, setFacebookHandle] = useState(
    user?.facebookHandle || '',
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initial = useMemo(
    () => ({
      profileImage: user?.profileImage || '',
      username: user?.username || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || user?.aboutText || '',
      dob: user?.dob || '',
      website: user?.website || '',
      instagramHandle: user?.instagramHandle || '',
      twitterHandle: user?.twitterHandle || '',
      facebookHandle: user?.facebookHandle || '',
    }),
    [user],
  );

  const current = {
    profileImage,
    username,
    firstName,
    lastName,
    bio,
    dob,
    website,
    instagramHandle,
    twitterHandle,
    facebookHandle,
  };
  const hasChanges = JSON.stringify(initial) !== JSON.stringify(current);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE)
      return;

    setIsUploading(true);
    try {
      const uploaded = await uploadMedia(file, 'PROFILE_IMAGE');
      if (!uploaded) {
        showTopToast('error', 'Upload failed.');
        return;
      }
      setProfileImage(uploaded);
    } catch (error: any) {
      showTopToast(
        'error',
        error.response?.data?.description || 'Upload failed.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        profileImageUrl: profileImage,
        username: username.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        dob: dob || null,
        website: website.trim(),
        instagramHandle: instagramHandle.trim(),
        twitterHandle: twitterHandle.trim(),
        facebookHandle: facebookHandle.trim(),
      };

      await authApi.patch('/user/update', payload);
      setUser({
        ...user,
        profileImage,
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        bio: payload.bio,
        aboutText: payload.bio,
        dob: payload.dob,
        website: payload.website,
        instagramHandle: payload.instagramHandle,
        twitterHandle: payload.twitterHandle,
        facebookHandle: payload.facebookHandle,
      });
      showTopToast('success', 'Profile updated successfully.');
    } catch (error: any) {
      showTopToast(
        'error',
        error.response?.data?.description || 'Profile update failed.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (profileMode !== 'overview') {
    return (
      <AccountUpdatePanel
        mode={profileMode}
        onBack={() => setProfileMode('overview')}
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Username">
            <SettingsInput
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </Field>
          <Field label="Date of birth">
            <SettingsInput
              type="date"
              value={dob ? String(dob).slice(0, 10) : ''}
              onChange={(event) => setDob(event.target.value)}
            />
          </Field>
          <Field label="First name">
            <SettingsInput
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </Field>
          <Field label="Last name">
            <SettingsInput
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </Field>
        </div>

        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm shadow-none outline-none transition placeholder:text-muted-foreground focus:border-blue-800 focus:ring-2 focus:ring-blue-800/10"
            placeholder="Tell people about yourself"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <SocialField
            icon={<AiOutlineGlobal size={18} />}
            label="Website"
            value={website}
            setValue={setWebsite}
          />
          <SocialField
            icon={<FiInstagram size={18} />}
            label="Instagram"
            value={instagramHandle}
            setValue={setInstagramHandle}
          />
          <SocialField
            icon={<FiTwitter size={18} />}
            label="Twitter / X"
            value={twitterHandle}
            setValue={setTwitterHandle}
          />
          <SocialField
            icon={<FiFacebook size={18} />}
            label="Facebook"
            value={facebookHandle}
            setValue={setFacebookHandle}
          />
        </div>

        <div className="flex justify-end">
          <Button
            className="h-11 rounded-full bg-blue-800 px-6 hover:bg-blue-800"
            disabled={!hasChanges || isSaving || isUploading}
            onClick={handleSave}
          >
            {isSaving ? <LoaderSmall /> : 'Save changes'}
          </Button>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-background p-5">
        <label className="block cursor-pointer text-center">
          <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border border-border bg-muted">
            {isUploading ? (
              <div className="flex h-full items-center justify-center">
                <LoaderSmall />
              </div>
            ) : (
              <AspectRatio ratio={1}>
                <Image
                  src={profileImage || defaultImage}
                  alt={user?.username || 'Profile image'}
                  fill
                  className="object-cover"
                />
              </AspectRatio>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold">
            <ImagePlus size={16} />
            Change photo
          </span>
        </label>

        <div className="mt-6 border-t border-border pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Account updates
          </p>
          <div className="mt-3 grid gap-2">
            <AccountActionButton
              icon={<Mail size={16} />}
              label="Update email"
              value={user?.email || 'No email'}
              onClick={() => setProfileMode('email')}
            />
            <AccountActionButton
              icon={<Phone size={16} />}
              label="Update phone"
              value={user?.phoneNumber || 'No phone number'}
              onClick={() => setProfileMode('phone')}
            />
            <AccountActionButton
              icon={<KeyRound size={16} />}
              label="Change password"
              value="Security credential"
              onClick={() => setProfileMode('password')}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function AccountActionButton({
  icon,
  label,
  value,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left transition hover:bg-accent"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-foreground">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {value}
        </span>
      </span>
    </button>
  );
}

function AccountUpdatePanel({
  mode,
  onBack,
}: {
  mode: 'email' | 'phone' | 'password';
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold transition hover:bg-accent"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Edit profile
      </button>
      {mode === 'email' ? <EmailUpdatePanel onDone={onBack} /> : null}
      {mode === 'phone' ? <PhoneUpdatePanel onDone={onBack} /> : null}
      {mode === 'password' ? <PasswordUpdatePanel onDone={onBack} /> : null}
    </div>
  );
}

function EmailUpdatePanel({ onDone }: { onDone: () => void }) {
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState<'request' | 'verify' | 'change'>('request');
  const [otpValue, setOtpValue] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestVerification = async () => {
    setLoading(true);
    try {
      await authApi.post('/verification/request', {
        verificationType: 'ACCOUNT_EMAIL_CHANGE',
      });
      setStep('verify');
    } catch {
      showTopToast('error', 'Error requesting verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyVerification = async () => {
    setLoading(true);
    try {
      await authApi.post('/verification/verify', {
        verificationType: 'ACCOUNT_EMAIL_CHANGE',
        token: otpValue.trim(),
      });
      setOtpValue('');
      setStep('change');
    } catch {
      showTopToast('error', 'Error verifying code.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    setLoading(true);
    try {
      await authApi.patch('/user/update/email', { email: newEmail.trim() });
      setUser({ ...user, email: newEmail.trim() });
      showTopToast('success', 'Email updated successfully.');
      onDone();
    } catch {
      showTopToast('error', 'Error updating email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DedicatedUpdateCard
      icon={<Mail size={22} />}
      title="Update email"
      description="Verify your current account before changing the email address used for login and notifications."
    >
      {step === 'request' ? (
        <div className="space-y-4">
          <ReadOnlyValue
            label="Current email"
            value={user?.email || 'No email'}
          />
          <Button
            className="rounded-full bg-blue-800 px-6 hover:bg-blue-800"
            onClick={handleRequestVerification}
            disabled={loading}
          >
            {loading ? <LoaderSmall /> : 'Send verification code'}
          </Button>
        </div>
      ) : null}
      {step === 'verify' ? (
        <div className="space-y-5">
          <OtpInput
            value={otpValue}
            onChange={setOtpValue}
            disabled={loading}
          />
          <Button
            className="rounded-full bg-blue-800 px-6 hover:bg-blue-800"
            onClick={handleVerifyVerification}
            disabled={loading || otpValue.length !== 6}
          >
            {loading ? <LoaderSmall /> : 'Verify code'}
          </Button>
        </div>
      ) : null}
      {step === 'change' ? (
        <div className="space-y-5">
          <Field label="New email">
            <SettingsInput
              type="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </Field>
          <Button
            className="rounded-full bg-blue-800 px-6 hover:bg-blue-800"
            onClick={handleEmailChange}
            disabled={loading || !newEmail.trim()}
          >
            {loading ? <LoaderSmall /> : 'Update email'}
          </Button>
        </div>
      ) : null}
    </DedicatedUpdateCard>
  );
}

function PhoneUpdatePanel({ onDone }: { onDone: () => void }) {
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState<'request' | 'verify' | 'change'>('request');
  const [otpValue, setOtpValue] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestVerification = async () => {
    setLoading(true);
    try {
      await authApi.post('/verification/request', {
        verificationType: 'ACCOUNT_PHONENUMBER_CHANGE',
      });
      setStep('verify');
    } catch {
      showTopToast('error', 'Error requesting verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyVerification = async () => {
    setLoading(true);
    try {
      await authApi.post('/verification/verify', {
        verificationType: 'ACCOUNT_PHONENUMBER_CHANGE',
        token: otpValue.trim(),
      });
      setOtpValue('');
      setStep('change');
    } catch {
      showTopToast('error', 'Error verifying code.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = async () => {
    setLoading(true);
    try {
      await authApi.patch('/user/update/phoneNumber', {
        phoneNumber: newPhoneNumber.trim(),
      });
      setUser({ ...user, phoneNumber: newPhoneNumber.trim() });
      showTopToast('success', 'Phone number updated successfully.');
      onDone();
    } catch {
      showTopToast('error', 'Error updating phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DedicatedUpdateCard
      icon={<Phone size={22} />}
      title="Update phone number"
      description="Verify your account before changing the phone number attached to your profile."
    >
      {step === 'request' ? (
        <div className="space-y-4">
          <ReadOnlyValue
            label="Current phone number"
            value={user?.phoneNumber || 'No phone number'}
          />
          <Button
            className="rounded-full bg-blue-800 px-6 hover:bg-blue-800"
            onClick={handleRequestVerification}
            disabled={loading}
          >
            {loading ? <LoaderSmall /> : 'Send verification code'}
          </Button>
        </div>
      ) : null}
      {step === 'verify' ? (
        <div className="space-y-5">
          <OtpInput
            value={otpValue}
            onChange={setOtpValue}
            disabled={loading}
          />
          <Button
            className="rounded-full bg-blue-800 px-6 hover:bg-blue-800"
            onClick={handleVerifyVerification}
            disabled={loading || otpValue.length !== 6}
          >
            {loading ? <LoaderSmall /> : 'Verify code'}
          </Button>
        </div>
      ) : null}
      {step === 'change' ? (
        <div className="space-y-5">
          <Field label="New phone number">
            <SettingsInput
              type="tel"
              value={newPhoneNumber}
              onChange={(event) => setNewPhoneNumber(event.target.value)}
              placeholder="+234..."
            />
          </Field>
          <Button
            className="rounded-full bg-blue-800 px-6 hover:bg-blue-800"
            onClick={handlePhoneChange}
            disabled={loading || !newPhoneNumber.trim()}
          >
            {loading ? <LoaderSmall /> : 'Update phone number'}
          </Button>
        </div>
      ) : null}
    </DedicatedUpdateCard>
  );
}

function PasswordUpdatePanel({ onDone }: { onDone: () => void }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isValid =
    oldPassword.trim() !== '' &&
    passwordRegex.test(newPassword) &&
    newPassword === confirmPassword;

  const handlePasswordUpdate = async () => {
    if (!isValid) {
      showTopToast('error', 'Check your password fields and try again.');
      return;
    }

    setLoading(true);
    try {
      await authApi.patch('/user/update/password', {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      showTopToast('success', 'Password updated successfully.');
      onDone();
    } catch (error: any) {
      showTopToast(
        'error',
        error.response?.data?.description || 'Password update failed.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DedicatedUpdateCard
      icon={<KeyRound size={22} />}
      title="Change password"
      description="Use a strong password with uppercase, lowercase, number, and special character."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Current password">
          <SettingsInput
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
          />
        </Field>
        <div />
        <Field label="New password">
          <SettingsInput
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </Field>
        <Field label="Confirm password">
          <SettingsInput
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </Field>
      </div>
      {newPassword && !passwordRegex.test(newPassword) ? (
        <p className="mt-3 text-sm text-red-600">
          Password must be at least 8 characters and include uppercase,
          lowercase, number, and special character.
        </p>
      ) : null}
      {confirmPassword && newPassword !== confirmPassword ? (
        <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>
      ) : null}
      <Button
        className="mt-5 rounded-full bg-blue-800 px-6 hover:bg-blue-800"
        onClick={handlePasswordUpdate}
        disabled={loading || !isValid}
      >
        {loading ? <LoaderSmall /> : 'Change password'}
      </Button>
    </DedicatedUpdateCard>
  );
}

function DedicatedUpdateCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
        {icon}
      </span>
      <h3 className="mt-4 text-2xl font-black">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ReadOnlyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <InputOTP
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} className="otp-slot" />
      </InputOTPGroup>
      <InputOTPGroup>
        <InputOTPSlot index={1} className="otp-slot" />
      </InputOTPGroup>
      <InputOTPGroup>
        <InputOTPSlot index={2} className="otp-slot" />
      </InputOTPGroup>
      <InputOTPGroup>
        <InputOTPSlot index={3} className="otp-slot" />
      </InputOTPGroup>
      <InputOTPGroup>
        <InputOTPSlot index={4} className="otp-slot" />
      </InputOTPGroup>
      <InputOTPGroup>
        <InputOTPSlot index={5} className="otp-slot" />
      </InputOTPGroup>
    </InputOTP>
  );
}

function AppearanceSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const activeTheme = (theme ?? 'system') as 'light' | 'dark' | 'system';
  const homeSearchBorderColor = useAppearanceStore(
    (state) => state.homeSearchBorderColor,
  );
  const setHomeSearchBorderColor = useAppearanceStore(
    (state) => state.setHomeSearchBorderColor,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <div className="grid gap-3">
          {themeOptions.map((option) => {
            const isActive = activeTheme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={cn(
                  'flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition',
                  isActive
                    ? 'border-blue-800 bg-blue-800 text-white'
                    : 'border-border bg-background hover:bg-accent',
                )}
              >
                <span>
                  <span className="block font-black">{option.label}</span>
                  <span
                    className={cn(
                      'mt-1 block text-sm',
                      isActive ? 'text-white/70' : 'text-muted-foreground',
                    )}
                  >
                    {option.helper}
                  </span>
                </span>
                {isActive ? <FaCheck /> : null}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm font-black">Home search border</p>
          <div className="mt-4 flex flex-wrap gap-4">
            {SEARCH_BORDER_COLORS.map((color) => {
              const isActive = homeSearchBorderColor === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  aria-label={`Use ${color.label}`}
                  onClick={() =>
                    setHomeSearchBorderColor(color.id as SearchBorderColorId)
                  }
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 transition hover:scale-105',
                    isActive ? 'border-foreground' : 'border-transparent',
                  )}
                  style={{ backgroundColor: color.value }}
                >
                  {isActive ? <FaCheck className="text-white" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-background p-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Preview
        </p>
        <p className="mt-3 text-2xl font-black capitalize">
          {resolvedTheme ?? 'system'}
        </p>
        <div
          className="mt-5 rounded-full border bg-card px-4 py-4 text-sm text-muted-foreground"
          style={{
            borderColor: SEARCH_BORDER_COLORS.find(
              (item) => item.id === homeSearchBorderColor,
            )?.value,
          }}
        >
          Search events and people
        </div>
      </aside>
    </div>
  );
}

function PreferenceSettings() {
  const { user, setUser } = useAuthStore();
  const eventTags = useEventTags();
  const [categories, setCategories] = useState<string[]>(user?.eventTags || []);
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges =
    JSON.stringify(categories.slice().sort()) !==
    JSON.stringify((user?.eventTags || []).slice().sort());

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authApi.patch('/user/update', { tags: categories });
      setUser({ ...user, eventTags: categories });
      showTopToast('success', 'Preferences updated successfully.');
    } catch {
      showTopToast('error', 'User preferences update error.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        Choose the categories that should influence discovery, recommendations,
        and event suggestions.
      </p>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {eventTags.map((tag, index) => {
          const isActive = categories.includes(tag.name);
          return (
            <button
              key={tag.name}
              type="button"
              className={cn(
                'min-h-28 rounded-2xl border-2 p-4 text-left text-white transition',
                preferenceColors[index % preferenceColors.length],
                isActive
                  ? 'border-foreground shadow-lg'
                  : 'border-transparent opacity-85 hover:opacity-100',
              )}
              onClick={() => {
                setCategories((items) =>
                  items.includes(tag.name)
                    ? items.filter((item) => item !== tag.name)
                    : [...items, tag.name],
                );
              }}
            >
              <span className="font-black capitalize">{tag.name}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button
          className="rounded-full bg-blue-800 px-6 hover:bg-blue-800"
          disabled={!hasChanges || isSaving}
          onClick={handleSave}
        >
          {isSaving ? <LoaderSmall /> : 'Save preferences'}
        </Button>
      </div>
    </div>
  );
}

function PaymentMethodSettings() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="rounded-2xl border border-border bg-background p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
            <CreditCard size={22} />
          </span>
          <div>
            <h3 className="text-xl font-black">Manage payout accounts</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Saved bank accounts are used for wallet withdrawals and eligible
              paid-ticket refunds.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <UserPaymentInfo
            detailsType="BANK_ACCOUNT_DETAILS"
            maxHeight="520px"
            isManage={true}
            variant="desktop"
          />
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-border bg-background p-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Wallet
        </p>
        <h3 className="mt-3 text-xl font-black">Payments and refunds</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Add a payout account, open wallet, or review refund history from here.
        </p>
        <div className="mt-5 grid gap-3">
          <Button
            asChild
            className="rounded-full bg-blue-800 hover:bg-blue-800"
          >
            <Link href={DESKTOP_ROUTES.addPaymentMethod}>Add account</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={DESKTOP_ROUTES.wallet}>Open wallet</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={DESKTOP_ROUTES.refundHistory}>Refund history</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-6">
      <Accordion
        type="single"
        collapsible
        className="w-full rounded-2xl border border-border bg-background px-4"
      >
        {policyItems.map((item, index) => (
          <AccordionItem key={item.title} value={`policy-${index}`}>
            <AccordionTrigger className="text-left font-black hover:no-underline">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-6 text-muted-foreground">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <a
        href={`${process.env.NEXT_PUBLIC_WEBSITE_BASE_URL ?? 'https://drifto.app'}/privacy-policy`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-bold text-blue-800"
      >
        Open full privacy policy <ExternalLink size={15} />
      </a>
    </div>
  );
}

function HelpSettings() {
  const { user } = useAuthStore();
  const email = 'support@drifto.app';
  const subject = 'Drifto Issue Report';
  const fromEmail = user?.email ? `\n\nUser Email: ${user.email}` : '';
  const body = `Please describe the issue you encountered.${fromEmail}`;
  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <Accordion
        type="single"
        collapsible
        className="w-full rounded-2xl border border-border bg-background px-4"
      >
        {faqItems.map((item, index) => (
          <AccordionItem key={item.title} value={`faq-${index}`}>
            <AccordionTrigger className="text-left font-black hover:no-underline">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-6 text-muted-foreground">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <aside className="h-fit rounded-2xl border border-border bg-background p-5">
        <Mail className="text-blue-800" size={22} />
        <h3 className="mt-4 text-xl font-black">Need help?</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Send a support ticket with your account context included.
        </p>
        <a href={mailtoUrl}>
          <Button className="mt-5 w-full rounded-full bg-blue-800 hover:bg-blue-800">
            Report an issue
          </Button>
        </a>
      </aside>
    </div>
  );
}

function InviteSettings() {
  const inviteUrl =
    process.env.NEXT_PUBLIC_WEBSITE_BASE_URL ?? 'https://drifto.app';
  const {
    isShareDialogOpen,
    closeShareDialog,
    handleQuickShare,
    copyToClipboard,
  } = useShare({
    title: 'Join me on Drifto!',
    url: inviteUrl,
    description:
      'Discover real experiences with people you love. Live every moment.',
  });

  const handleCopyInviteLink = async () => {
    try {
      await copyToClipboard();
      showTopToast('success', 'Invite link copied to clipboard.');
    } catch {
      showTopToast('error', 'Failed to copy invite link.');
    }
  };

  return (
    <>
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="relative h-24 w-56">
          <Image
            src="/logo-extend.png"
            alt="Drifto"
            fill
            className="object-contain"
          />
        </div>
        <h3 className="mt-6 text-3xl font-black">
          Share Drifto with your friends
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Invite friends to discover real experiences and book events with you.
        </p>
        <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
          <Button
            className="h-12 rounded-full bg-blue-800 hover:bg-blue-800"
            onClick={handleCopyInviteLink}
          >
            Copy invite link
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-full"
            onClick={handleQuickShare}
          >
            Share invite
          </Button>
        </div>
      </div>
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={closeShareDialog}
        title="Join me on Drifto!"
        url={inviteUrl}
        description="Discover real experiences with people you love. Live every moment."
      />
    </>
  );
}

function ConnectSettings() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {connectLinks.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 transition hover:bg-accent"
        >
          <span className="flex items-center gap-3 font-black">
            <Globe size={18} />
            {item.label}
          </span>
          <ExternalLink size={16} className="text-muted-foreground" />
        </a>
      ))}
    </div>
  );
}

function LogoutSettings() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      router.replace('/login');
    } catch {
      showTopToast('error', 'Error logging out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-2xl border border-border bg-background p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
          <LogOut size={22} />
        </span>
        <h3 className="mt-4 text-2xl font-black">Sign out of Drifto</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          End this browser session and return to login. Your profile, bookings,
          posts, and account data will stay unchanged.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Account data
            </p>
            <p className="mt-1 text-sm font-semibold">Kept safely on Drifto</p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Session
            </p>
            <p className="mt-1 text-sm font-semibold">
              Cleared from this browser
            </p>
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
        <h3 className="text-xl font-black text-red-600">Confirm sign out</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          You will need to sign in again before managing bookings, settings, or
          hosted events.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-5 w-full rounded-full bg-red-600 text-white hover:bg-red-700">
              Sign out
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] rounded-3xl border-border bg-background p-6 text-foreground shadow-xl">
            <DialogTitle className="text-center text-xl font-semibold">
              Sign out
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Are you sure you want to sign out of your account?
            </DialogDescription>
            <DialogFooter className="flex-row gap-3 sm:justify-between">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                className="flex-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                disabled={isLoggingOut}
                onClick={handleLogout}
              >
                {isLoggingOut ? <LoaderSmall /> : 'Sign out'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </aside>
    </div>
  );
}

function DeleteSettings() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authApi.delete('/user/account');
      clearAuth();
      router.push('/login');
    } catch (error: any) {
      showTopToast(
        'error',
        error.response?.data?.description || 'Could not delete account.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-background p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
            <Trash2 size={22} />
          </span>
          <h3 className="mt-4 text-2xl font-black">
            Thinking about deleting your account?
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            You can close your Drifto account if a few conditions are met. These
            steps help us keep your account secure and your data safe.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="text-lg font-black">
            Before deleting, please make sure:
          </p>
          <ul className="mt-4 grid gap-3">
            {deleteChecklist.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-blue-800"
                />
                <p className="text-sm font-semibold leading-6">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="text-lg font-black">What remains after deletion</p>
          <ul className="mt-4 grid gap-3">
            {deleteRetainedData.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <Lock size={18} className="mt-0.5 shrink-0 text-blue-800" />
                <p className="text-sm font-semibold leading-6">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <aside className="h-fit rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
        <Trash2 className="text-red-600" size={22} />
        <h3 className="mt-4 text-xl font-black text-red-600">Delete account</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Closing your account is permanent and cannot be restored.
        </p>
        <p className="mt-4 rounded-xl border border-red-500/20 bg-background/70 px-4 py-3 text-sm font-semibold text-red-600">
          Once your account is deleted, it cannot be restored.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-5 w-full rounded-full bg-red-600 text-white hover:bg-red-700">
              Continue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
              >
                {isDeleting ? <LoaderSmall /> : 'Confirm delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SettingsInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        'h-12 rounded-xl border-border bg-background px-4 text-sm shadow-none transition placeholder:text-muted-foreground focus-visible:border-blue-800 focus-visible:ring-2 focus-visible:ring-blue-800/10',
        className,
      )}
      {...props}
    />
  );
}

function SocialField({
  icon,
  label,
  value,
  setValue,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-3 transition focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-800/10">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground">
          {icon}
        </span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </Field>
  );
}

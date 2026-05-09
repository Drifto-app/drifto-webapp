import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DESKTOP_ROUTES } from '@/lib/routes';

interface PageHeaderProps {
  headerTitle: string;
  prev: string;
  variant?: 'mobile' | 'desktop';
}

export default function PageHeader({
  headerTitle,
  prev,
  variant = 'mobile',
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div>
      <div className="w-full flex justify-between font-bold px-4 items-center">
        <h2 className="text-xl">{headerTitle}</h2>
        <span
          onClick={() =>
            router.push(
              `${variant === 'desktop' ? DESKTOP_ROUTES.settings : '/m/settings'}?prev=${encodeURIComponent(prev)}`,
            )
          }
        >
          <Settings size={20} />
        </span>
      </div>
    </div>
  );
}

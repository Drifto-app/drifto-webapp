import * as React from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FaUser } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';

interface PaymentInfoCardProps {
  info: Record<string, any>;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (info: Record<string, any>) => Promise<void>;
  showDelete?: boolean;
  variant?: 'mobile' | 'desktop';
}

export const PaymentInfoCard = ({
  info,
  isSelected,
  onSelect,
  onDelete,
  showDelete,
  variant = 'mobile',
}: PaymentInfoCardProps) => {
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteLoading(true);
    try {
      await onDelete(info);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <span
      key={info.id}
      className={cn(
        'w-full cursor-pointer border-2 transition',
        variant === 'desktop'
          ? 'flex items-center justify-between rounded-2xl bg-card px-4 py-4 hover:border-blue-800/50'
          : 'px-4 py-4 rounded-lg flex justify-between items-center',
        isSelected ? 'border-blue-800' : 'border-border',
      )}
      onClick={onSelect}
    >
      <span className="flex items-center gap-3">
        <span className="flex-shrink-0 bg-neutral-600 h-9 w-9 rounded-xl flex items-center justify-center overflow-hidden">
          <FaUser className="text-white w-4 h-4" />
        </span>
        <span className="flex flex-col font-semibold">
          <p
            className={cn(
              'line-clamp-2',
              isSelected ? 'text-blue-800' : 'text-foreground',
            )}
          >
            {`${info.accountNumber} (${info.bankName})`}
          </p>
          <p className="text-neutral-400 text-sm">{info.accountName}</p>
        </span>
      </span>
      {showDelete && (
        <button
          className="px-3 disabled:opacity-50"
          onClick={handleDelete}
          disabled={isDeleteLoading}
        >
          {isDeleteLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-red-700 border-t-transparent rounded-full" />
          ) : (
            <RiDeleteBin6Line size={20} className="text-red-700" />
          )}
        </button>
      )}
    </span>
  );
};

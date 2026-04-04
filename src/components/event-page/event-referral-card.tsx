import { ComponentProps, useState } from 'react';
import { cn, referralCodeRegex } from '@/lib/utils';
import { LuCircleMinus, LuPencil } from 'react-icons/lu';
import {
  Dialog,
  DialogClose,
  DialogContent, DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as React from 'react';
import { LoaderSmall } from '@/components/ui/loader';
import { authApi } from '@/lib/axios';
import { showTopToast } from '@/components/toast/toast-util';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import DoughnutChart from '@/components/ui/doughnut-chart';
import { EventSingleContent } from '@/components/ui/content';

interface EventReferralCardProps extends ComponentProps<"div"> {
  referralContent: {[key: string]: any};
  setReferralContent: (newReferral: {[key: string]: any}) => void;
  onDelete: (referralId: string) => void;
}

export const EventReferralCard = ({
  referralContent, setReferralContent, onDelete, className, ...props
}: EventReferralCardProps) => {
  const [referralCode, setReferralCode] = useState<string>(referralContent.referralCode);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "w-full flex px-4 py-4 border-border border-1 justify-between rounded-md items-center",
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-1 w-full" onClick={() => setDrawerOpen(true)}>
          <span className="font-black text-lg">{referralCode}</span>
          <span className="text-md text-gray-600">{referralContent.totalTicketsUsed} uses</span>
        </div>
        <div className="flex flex-row gap-6">
          <span>
            <EditEventReferralCard
              changeReferralCode={(referralCode: string) => {
                setReferralCode(referralCode);
                setReferralContent({...referralContent, referralCode});
              }}
              referralContent={referralContent}
            />
          </span>
          <span>
          <DeleteEventReferralCard onDelete={() => onDelete(referralContent.eventReferralId)} referralContent={referralContent} />
        </span>
        </div>
      </div>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Referral Details</DrawerTitle>
          </DrawerHeader>
          <div className="w-full flex flex-col gap-8 px-6 pb-10">
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-neutral-500">Referral Code</span>
              <span className="font-bold text-lg">
                {referralContent.referralCode}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-neutral-500">Total Tickets Used</span>
              <span className="font-bold text-lg">
                {referralContent.totalTicketsUsed}
              </span>
            </div>
            <div className="flex flex-col">
              {referralContent.ticketsUsageInfo.length <= 0
                ? <span className="w-full text-center text-neutral-500">No usage data</span>
                : referralContent.ticketsUsageInfo.map(
                  (item: {[key: string]: any}) => (
                    <EventSingleContent className="shadow-lg border-1" key={item.ticketInfo.id}>
                      <span  className="flex flex-row justify-between items-center w-full">
                        <p className="capitalize font-semibold text-md text-neutral-500">
                          {item.ticketInfo.title}
                        </p>
                        <p className="font-semibold">{item.amountUsed}</p>
                      </span>
                    </EventSingleContent>
                  )
                )
              }
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

interface NewEventReferralCardProps extends ComponentProps<"button"> {
  addReferral: (referralContent: { [key: string]: any }) => void;
  eventId: string;
}

export const NewEventReferralCard = ({
                                       addReferral,
                                       eventId,
                                       className,
                                       ...props
                                     }: NewEventReferralCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const isInvalidReferral =
    referralCode.length > 0 && !referralCodeRegex.test(referralCode);

  const isSaveDisabled = referralCode.length <= 0 || isInvalidReferral;

  const createReferralCode = async () => {
    setIsLoading(true);

    const param = {
      referralCode: referralCode.toUpperCase(),
      eventId: eventId,
    };

    try {
      const response = await authApi.post("/referral/event", param);
      addReferral({
        eventReferralId: response.data.data.id,
        referralCode: response.data.data.referralCode,
        ticketsUsageInfo: [],
        totalTicketsUsed: 0,
      });
      closeModal(false);
      showTopToast("success", "Referral code created")
    } catch (err: any) {
      showTopToast(
        "error",
        err.response?.data?.description || "Unable to create event referral"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferralCodeChange = (value: string) => {
    setReferralCode(value.toUpperCase());
  };

  const closeModal = (value: boolean) => {
    setIsOpen(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "bg-blue-800 hover:bg-blue-800 py-6 font-bold text-lg",
            className
          )}
          {...props}
        >
          Create
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Referral Code</DialogTitle>
        </DialogHeader>

        <div>
          <div className="grid gap-2">
            <Label htmlFor="referral" className="text-neutral-500">
              Referral Code
            </Label>
            <Input
              id="referral"
              type="text"
              placeholder="Enter Code"
              value={referralCode}
              onChange={(e) => handleReferralCodeChange(e.target.value)}
              className="py-6 bg-background"
              aria-invalid={isInvalidReferral}
            />
            {isInvalidReferral && (
              <p className="text-sm text-red-600">
                referral code should only be numbers and letters
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="default"
            className="text-md py-6 bg-blue-800 hover:bg-blue-800"
            disabled={isSaveDisabled || isLoading}
            onClick={createReferralCode}
          >
            {isLoading ? <LoaderSmall /> : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


interface EditEventReferralCardProps {
  changeReferralCode: (referralCode: string) => void;
  referralContent: { [key: string]: any };
}

export const EditEventReferralCard = ({
                                       changeReferralCode,
                                       referralContent
                                     }: EditEventReferralCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<string>(referralContent.referralCode);
  const [isLoading, setIsLoading] = useState(false);

  const isInvalidReferral =
    referralCode.length > 0 && !referralCodeRegex.test(referralCode);

  const isSaveDisabled = referralCode.length <= 0 || isInvalidReferral || referralContent.referralCode === referralCode;

  const updateReferralCode = async () => {
    setIsLoading(true);

    const param = {
      referralCode: referralCode.toUpperCase(),
    };

    try {
      const response = await authApi.patch(`/referral/event/${referralContent.eventReferralId}`, param);
      changeReferralCode(response.data.data.referralCode);
      closeModal(false);
      showTopToast("success", "Referral code updated")
    } catch (err: any) {
      showTopToast(
        "error",
        err.response?.data?.description || "Unable to update refferal code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferralCodeChange = (value: string) => {
    setReferralCode(value.toUpperCase());
  };

  const closeModal = (value: boolean) => {
    setIsOpen(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogTrigger asChild>
        <LuPencil size={26} className="text-blue-800"/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Referral Code</DialogTitle>
        </DialogHeader>

        <div>
          <div className="grid gap-2">
            <Label htmlFor="referral" className="text-neutral-500">
              Referral Code
            </Label>
            <Input
              id="referral"
              type="text"
              placeholder="Enter Code"
              value={referralCode}
              onChange={(e) => handleReferralCodeChange(e.target.value)}
              className="py-6 bg-background"
              aria-invalid={isInvalidReferral}
            />
            {isInvalidReferral && (
              <p className="text-sm text-red-600">
                referral code should only be numbers and letters
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="default"
            className="text-md py-6 bg-blue-800 hover:bg-blue-800"
            disabled={isSaveDisabled || isLoading}
            onClick={updateReferralCode}
          >
            {isLoading ? <LoaderSmall /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteEventReferralCardProps {
  onDelete: (eventReferralId: string) => void;
  referralContent: { [key: string]: any };
}

export const DeleteEventReferralCard = ({
  onDelete, referralContent,
}: DeleteEventReferralCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = (value: boolean) => {
    if(isLoading) return
    setIsOpen(value);
  };

  const deleteEventReferral = async () => {
    setIsLoading(true);

    try {
      await authApi.delete(`/referral/event/${referralContent.eventReferralId}`);
      onDelete(referralContent.eventReferralId);
      setIsOpen(false);
      showTopToast("success", "Referral code deleted successfully.");
    } catch (err: any) {
      showTopToast("error", err.response?.data?.description || "Unable to delete referral");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogTrigger asChild>
        <LuCircleMinus size={26} className="text-red-700" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event Referral</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete event referral? <span className="font-bold text-foreground">{referralContent.referralCode}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full flex flex-row sm:justify-between justify-between px-4 sm:px-20">
          <DialogClose asChild>
            <Button
              type="button"
              variant="default"
              className="text-md bg-muted text-foreground hover:bg-muted py-6 px-8 font-semibold"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            variant="secondary"
            className="text-md py-6 px-8 bg-red-700 hover:bg-red-700 text-white font-semibold"
            disabled={isLoading}
            onClick={deleteEventReferral}
          >
            {isLoading ? <LoaderSmall /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
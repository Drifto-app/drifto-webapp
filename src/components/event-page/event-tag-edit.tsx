"use client"

import {CiEdit} from "react-icons/ci";
import * as React from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../ui/dialog";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {useEventTags} from "@/store/event-tag-store";
import { cn } from "@/lib/utils";

interface EventTagDialogProps  {
    currentEventTags: string[]
    onTagAdd: (tag: string) => void
    onTagRemove: (tag: string) => void
}

export const EventTagDialog= ({
    currentEventTags, onTagAdd, onTagRemove
}: EventTagDialogProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const availableTags = useEventTags().filter((tag): tag is { name: string } => Boolean(tag?.name));
    const selectedTagsText =
        currentEventTags.length > 0 ? currentEventTags.join(", ") : "Select event tags";

    return (
        <>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                  <div className="w-full rounded-md border border-border bg-background px-4 py-3 text-wrap flex flex-row justify-between items-center cursor-pointer text-foreground transition-colors hover:bg-muted dark:border-neutral-700 dark:bg-neutral-950 dark:hover:bg-neutral-900">
                            <span className="text-sm w-[85%] text-foreground">
                            {selectedTagsText}
                        </span>
                      <CiEdit size={22} className="text-muted-foreground" />
                  </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                      <DialogTitle>Select event tags</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3 max-h-100 overflow-y-auto flex-grow no-scrollbar">
                      {availableTags.map((tag, index) => {
                          const isSelected = currentEventTags.includes(tag.name);
                          return (
                              <Button
                                  variant="outline"
                                  key={index}
                                  className={cn(
                                      "rounded-full px-2 py-2 text-sm border-border bg-background text-foreground hover:bg-muted dark:border-neutral-700 dark:bg-neutral-950 dark:hover:bg-neutral-900",
                                      isSelected && "border-blue-600 bg-blue-800/10 text-blue-800 hover:bg-blue-800/15 dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-400/15",
                                  )}
                                  onClick={() => isSelected ? onTagRemove(tag.name) : onTagAdd(tag.name)}
                              >
                                  {tag.name}
                              </Button>
                          );
                      })}
                  </div>
                  <DialogFooter>
                      <DialogClose asChild>
                          <Button variant="default" className="text-md py-6">Save</Button>
                      </DialogClose>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
        </>
    )
}

"use client"

import {CiEdit} from "react-icons/ci";
import * as React from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../ui/dialog";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {eventTagsActions, useEventTags} from "@/store/event-tag-store";

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
                  <div className=" w-full py-3 px-4 bg-background rounded-md text-wrap flex flex-row justify-between items-center cursor-pointer hover:bg-muted transition-colors border-1 border-border">
                            <span className="text-sm w-[85%]">
                            {selectedTagsText}
                        </span>
                      <CiEdit size={22} />
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
                                  className={`px-2 py-2 text-sm rounded-full ${isSelected ? "border-blue-600" : ""}`}
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

"use client";

import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@opensec/ui/components/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@opensec/ui/components/sheet";
import { useIsMobile } from "@opensec/ui/hooks/use-mobile";
import { cn } from "@opensec/ui/lib/utils";

function ResponsiveDialog({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof Dialog>) {
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const open = openProp ?? internalOpen;
  const Root = isMobile ? Sheet : Dialog;
  return (
    <Root
      open={open}
      onOpenChange={(next, eventDetails) => {
        setInternalOpen(next);
        onOpenChange?.(next, eventDetails);
      }}
      {...props}
    />
  );
}

function ResponsiveDialogTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
  const Component = useIsMobile() ? SheetTrigger : DialogTrigger;
  return <Component {...props} />;
}

function ResponsiveDialogClose(props: React.ComponentProps<typeof DialogClose>) {
  const Component = useIsMobile() ? SheetClose : DialogClose;
  return <Component {...props} />;
}

function ResponsiveDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  if (useIsMobile()) {
    return (
      <SheetContent
        side="bottom"
        className={cn("h-auto max-h-[85svh] rounded-t-xl", className)}
        {...props}
      />
    );
  }
  return <DialogContent className={className} {...props} />;
}

function ResponsiveDialogHeader(props: React.ComponentProps<typeof DialogHeader>) {
  const Component = useIsMobile() ? SheetHeader : DialogHeader;
  return <Component {...props} />;
}

function ResponsiveDialogFooter(props: React.ComponentProps<typeof DialogFooter>) {
  const Component = useIsMobile() ? SheetFooter : DialogFooter;
  return <Component {...props} />;
}

function ResponsiveDialogTitle(props: React.ComponentProps<typeof DialogTitle>) {
  const Component = useIsMobile() ? SheetTitle : DialogTitle;
  return <Component {...props} />;
}

function ResponsiveDialogDescription(props: React.ComponentProps<typeof DialogDescription>) {
  const Component = useIsMobile() ? SheetDescription : DialogDescription;
  return <Component {...props} />;
}

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
};

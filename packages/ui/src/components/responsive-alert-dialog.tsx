"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@opensec/ui/components/alert-dialog";
import { Button } from "@opensec/ui/components/button";
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

function ResponsiveAlertDialog({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof AlertDialog>) {
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const open = openProp ?? internalOpen;
  const Root = isMobile ? Sheet : AlertDialog;

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

function ResponsiveAlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogTrigger>) {
  const Component = useIsMobile() ? SheetTrigger : AlertDialogTrigger;
  return <Component {...props} />;
}

function ResponsiveAlertDialogContent({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogContent>) {
  if (useIsMobile()) {
    return (
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={cn("h-auto max-h-[85svh] rounded-t-xl", className)}
        {...props}
      />
    );
  }

  return <AlertDialogContent className={className} size={size} {...props} />;
}

function ResponsiveAlertDialogHeader(props: React.ComponentProps<typeof AlertDialogHeader>) {
  const Component = useIsMobile() ? SheetHeader : AlertDialogHeader;
  return <Component {...props} />;
}

function ResponsiveAlertDialogFooter(props: React.ComponentProps<typeof AlertDialogFooter>) {
  const Component = useIsMobile() ? SheetFooter : AlertDialogFooter;
  return <Component {...props} />;
}

function ResponsiveAlertDialogMedia(props: React.ComponentProps<typeof AlertDialogMedia>) {
  return <AlertDialogMedia {...props} />;
}

function ResponsiveAlertDialogTitle(props: React.ComponentProps<typeof AlertDialogTitle>) {
  const Component = useIsMobile() ? SheetTitle : AlertDialogTitle;
  return <Component {...props} />;
}

function ResponsiveAlertDialogDescription(
  props: React.ComponentProps<typeof AlertDialogDescription>,
) {
  const Component = useIsMobile() ? SheetDescription : AlertDialogDescription;
  return <Component {...props} />;
}

function ResponsiveAlertDialogAction(props: React.ComponentProps<typeof AlertDialogAction>) {
  const Component = useIsMobile() ? Button : AlertDialogAction;
  return <Component {...props} />;
}

function ResponsiveAlertDialogCancel(props: React.ComponentProps<typeof AlertDialogCancel>) {
  if (useIsMobile()) {
    const { variant = "outline", size = "default", ...closeProps } = props;
    return <SheetClose render={<Button variant={variant} size={size} />} {...closeProps} />;
  }

  return <AlertDialogCancel {...props} />;
}

export {
  ResponsiveAlertDialog,
  ResponsiveAlertDialogAction,
  ResponsiveAlertDialogCancel,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogFooter,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogMedia,
  ResponsiveAlertDialogTitle,
  ResponsiveAlertDialogTrigger,
};

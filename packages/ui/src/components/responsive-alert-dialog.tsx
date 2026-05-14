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
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@opensec/ui/components/alert-dialog";
import { Button, buttonVariants } from "@opensec/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@opensec/ui/components/drawer";
import { useIsMobile } from "@opensec/ui/hooks/use-mobile";
import { cn } from "@opensec/ui/lib/utils";

const ResponsiveAlertDialogContext = React.createContext(false);

type ResponsiveAlertDialogProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function ResponsiveAlertDialog({ children, ...props }: ResponsiveAlertDialogProps) {
  const isMobile = useIsMobile();
  const Root = isMobile ? Drawer : AlertDialog;

  return (
    <ResponsiveAlertDialogContext.Provider value={isMobile}>
      <Root {...props}>{children}</Root>
    </ResponsiveAlertDialogContext.Provider>
  );
}

type ResponsiveAlertDialogTriggerProps = {
  children?: React.ReactNode;
  className?: string;
  render?: React.ReactElement;
};

function ResponsiveAlertDialogTrigger({
  children,
  className,
  render,
}: ResponsiveAlertDialogTriggerProps) {
  const isMobile = React.useContext(ResponsiveAlertDialogContext);

  if (isMobile) {
    return (
      <DrawerTrigger className={className}>
        {render ?? children}
      </DrawerTrigger>
    );
  }

  return (
    <AlertDialogTrigger className={className} render={render}>
      {children}
    </AlertDialogTrigger>
  );
}

type ResponsiveAlertDialogContentProps = {
  children?: React.ReactNode;
  className?: string;
};

function ResponsiveAlertDialogContent({
  className,
  children,
}: ResponsiveAlertDialogContentProps) {
  const isMobile = React.useContext(ResponsiveAlertDialogContext);

  if (isMobile) {
    return (
      <DrawerContent className={cn("max-h-[85svh] overflow-y-auto", className)}>
        {children}
      </DrawerContent>
    );
  }

  return <AlertDialogContent className={className}>{children}</AlertDialogContent>;
}

function ResponsiveAlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogHeader>) {
  const isMobile = React.useContext(ResponsiveAlertDialogContext);
  const Header = isMobile ? DrawerHeader : AlertDialogHeader;

  return <Header className={className} {...props} />;
}

function ResponsiveAlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogFooter>) {
  const isMobile = React.useContext(ResponsiveAlertDialogContext);
  const Footer = isMobile ? DrawerFooter : AlertDialogFooter;

  return <Footer className={className} {...props} />;
}

function ResponsiveAlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  const isMobile = React.useContext(ResponsiveAlertDialogContext);
  const Title = isMobile ? DrawerTitle : AlertDialogTitle;

  return <Title className={className} {...props} />;
}

function ResponsiveAlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const isMobile = React.useContext(ResponsiveAlertDialogContext);
  const Description = isMobile ? DrawerDescription : AlertDialogDescription;

  return <Description className={className} {...props} />;
}

type ResponsiveAlertDialogActionProps = Omit<
  React.ComponentProps<typeof Button>,
  "className"
> & {
  className?: string;
};

function ResponsiveAlertDialogAction({
  className,
  ...props
}: ResponsiveAlertDialogActionProps) {
  const isMobile = React.useContext(ResponsiveAlertDialogContext);

  if (isMobile) {
    return <Button className={className} {...props} />;
  }

  return <AlertDialogAction className={className} {...props} />;
}

type ResponsiveAlertDialogCancelProps = Omit<
  React.ComponentProps<typeof Button>,
  "className"
> & {
  className?: string;
};

function ResponsiveAlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  children,
}: ResponsiveAlertDialogCancelProps) {
  const isMobile = React.useContext(ResponsiveAlertDialogContext);

  if (isMobile) {
    return (
      <DrawerClose className={cn(buttonVariants({ variant, size }), className)}>
        {children}
      </DrawerClose>
    );
  }

  return (
    <AlertDialogCancel className={className} variant={variant} size={size}>
      {children}
    </AlertDialogCancel>
  );
}

export {
  ResponsiveAlertDialog,
  ResponsiveAlertDialogAction,
  ResponsiveAlertDialogCancel,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogFooter,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogTitle,
  ResponsiveAlertDialogTrigger,
};

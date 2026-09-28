"use client";

import { Button, Spinner } from "@heroui/react";

import { cn } from "@/lib/cn";

export function SubmitButton({
  loading,
  label,
  loadingLabel,
  className,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
  className?: string;
}) {
  return (
    <Button
      className={cn(
        "brand-gradient w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 hover:opacity-95",
        className,
      )}
      fullWidth
      isPending={loading}
      type="submit"
    >
      {({ isPending }) => (
        <>
          {isPending ? <Spinner color="current" size="sm" /> : null}
          {isPending ? loadingLabel : label}
        </>
      )}
    </Button>
  );
}
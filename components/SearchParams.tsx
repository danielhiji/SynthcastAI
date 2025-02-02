"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";
import { useIsFetching } from "@/providers/IsFetchingProvider";

export default function SearchParams({ setSuccess } : { setSuccess: (value: boolean) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const isFetching = useIsFetching();
  const pathname = usePathname();

  // if the payment was successful, the user will be redirected to the plans page with a query parameter.
  // This block checks for the query parameter and displays a success message to the user.
  useEffect(() => {
    if (!isFetching && searchParams.get("session_id")) {
      setSuccess(true);

      toast({
        title: "Payment successful ✅",
        variant: "success",
      });
    }
    // remove the query parameter from the URL and update the state after 5 seconds.
    setTimeout(() => {
      if (pathname !== "/plans" || !searchParams.get("session_id")) return;

      router.replace("/plans");
      setSuccess(false);
    }, 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
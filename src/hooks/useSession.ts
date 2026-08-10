import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionInfo, type SessionInfo } from "@/lib/auth.functions";

export function useSession() {
  const fetchSession = useServerFn(getSessionInfo);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setHasToken(Boolean(data.session));
    });
    return () => {
      active = false;
    };
  }, []);

  const query = useQuery<SessionInfo>({
    queryKey: ["session-info"],
    queryFn: () => fetchSession(),
    enabled: hasToken === true,
    staleTime: 60_000,
  });

  return {
    ...query,
    isSignedIn: hasToken === true,
    role: query.data?.role ?? null,
    profile: query.data?.profile ?? null,
  };
}

export async function signOutEverywhere() {
  await supabase.auth.signOut();
  window.location.href = "/";
}

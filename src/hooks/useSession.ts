import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionInfo, type SessionInfo, type PortalRole } from "@/lib/auth.functions";

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

  const profile = query.data?.profile ?? null;
  const name = profile?.full_name?.trim() || "";
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U";

  return {
    ...query,
    isSignedIn: hasToken === true,
    role: (query.data?.role ?? null) as PortalRole | null,
    roles: query.data?.roles ?? [],
    profile,
    name,
    initials,
    email: profile?.email ?? null,
  };
}

export async function signOutEverywhere() {
  try {
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem("jgi-sih-demo-state-v1");
    Object.keys(localStorage)
      .filter((k) => k.startsWith("sb-"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
  window.location.replace("/");
}

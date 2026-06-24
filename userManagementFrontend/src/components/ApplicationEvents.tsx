import { useEffect, useState } from "react";
import { getSocket } from "../services/sockets";
import { getApplicationLogs } from "../services/User.service";
import { useRecoilValue } from "recoil";
import { selectedApplicationState } from "../store/authState";

type Event = {
  type?: string;
  deviceId?: string;
  timeStamp?: string | number;
  message?: string;
  [key: string]: any;
};

function getBadgeStyle(type?: string): React.CSSProperties {
  if (type?.includes("QUEUED"))              return { background: "#E6F1FB", color: "#0C447C" };
  if (type?.includes("GROUP_DOWNLINK"))      return { background: "#FCE5D8", color: "#A33C00" };
  if (type?.includes("SCHEDULER_EXECUTED"))  return { background: "#E8DDF5", color: "#5B2A86" };
  if (type?.includes("ERROR"))               return { background: "#FCEBEB", color: "#A32D2D" };
  return { background: "rgba(22,150,71,0.08)", color: "#169647" };
}

function formatRelative(ts?: string | number) {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60_000)    return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const ApplicationEvents = () => {
  const [events, setEvents]   = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const selectedAppId =
  useRecoilValue(selectedApplicationState);


  useEffect(() => {
    (async () => {
      try {
        const res = await getApplicationLogs();
        setEvents(res.data || []);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

 useEffect(() => {
  const socket = getSocket();

  if (!socket) return;

  const handler = (event: Event) =>
    setEvents(prev => [event, ...prev]);

  socket.on("applicationEvent", handler);

  return () => {
    socket.off("applicationEvent", handler);
  };
}, [selectedAppId]);

  return (
    <div style={{ fontFamily: "var(--font-sans, system-ui)", fontSize: 13 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: loading ? "#aaa" : "#169647",
            display: "inline-block",
          }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Live logs</span>
        </div>
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 20,
          background: "rgba(22,150,71,0.08)",
          color: "#169647", fontWeight: 500,
        }}>
          {loading ? "…" : `${events.length} events`}
        </span>
      </div>

      {!loading && events.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-tertiary)", fontSize: 12 }}>
          No events yet.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        {events.map((ev, i) => (
          <div key={i}>
            <div
              onClick={() => setExpanded(expanded === i ? null : i)}
              style={{
                display: "grid", gridTemplateColumns: "100px 1fr auto",
                alignItems: "start", gap: 10, padding: "8px 10px",
                borderRadius: 6, cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{
                  fontSize: 9, fontWeight: 500, padding: "2px 7px",
                  borderRadius: 20, display: "inline-block", whiteSpace: "nowrap",
                  ...getBadgeStyle(ev.type),
                }}>
                  {(ev.type || "UNKNOWN").replace(/_/g, " ")}
                </span>
                {i === 0 && (
                  <span style={{
                    fontSize: 9, fontWeight: 500, padding: "2px 6px",
                    borderRadius: 20, background: "rgba(22,150,71,0.12)",
                    color: "#169647", display: "inline-block",
                  }}>new</span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <code style={{ fontSize: 12, color: "var(--color-text-primary)" }}>{ev.name}</code>
                {ev.message && (
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                    {ev.message}
                  </span>
                )}
              </div>

              <span style={{ fontSize: 10, color: "var(--color-text-tertiary)", whiteSpace: "nowrap", paddingTop: 2 }}>
                {formatRelative(ev.timeStamp)}
              </span>
            </div>

            {expanded === i && (
              <pre style={{
                margin: "0 10px 6px", padding: "8px 10px",
                background: "rgba(0,0,0,0.03)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 6, fontSize: 10,
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--color-text-secondary)",
                overflowX: "auto", lineHeight: 1.5,
              }}>
                {JSON.stringify(ev, null, 2)}
              </pre>
            )}

            {i < events.length - 1 && (
              <div style={{ height: "0.5px", background: "var(--color-border-tertiary)", margin: "1px 0" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
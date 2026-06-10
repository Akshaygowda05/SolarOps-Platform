import { useEffect, useState } from "react";
import { getSocket } from "../services/sockets";
import { getApplicationLogs } from "../services/User.service";

type Event = {
  type?: string;
  deviceId?: string;
  timeStamp?: string | number;
  message?: string;
  [key: string]: any;
};

function getBadgeStyle(type?: string): React.CSSProperties {
  if (type?.includes("QUEUED")) return { background: "#E6F1FB", color: "#0C447C" };
  if (type?.includes("GROUP_DOWNLINK")) return { background: "#FCE5D8", color: "#A33C00" };
  if (type?.includes("SCHEDULER_EXECUTED")) return { background: "#E8DDF5", color: "#5B2A86" };
  if (type?.includes("ERROR"))  return { background: "#FCEBEB", color: "#A32D2D" };
  return { background: "var(--color-background-secondary)", color: "var(--color-text-secondary)" };
}

function formatRelative(ts?: string | number) {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60_000)    return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const ApplicationEvents = () => {
  const [events, setEvents]       = useState<Event[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<number | null>(null);

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
    const handler = (event: Event) => setEvents(prev => [event, ...prev]);
    socket.on("applicationEvent", handler);
    return () => { socket.off("applicationEvent", handler); };
  }, []);

  return (
    <div style={{ fontFamily: "var(--font-sans, system-ui)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: loading ? "#888" : "#1D9E75",
            display: "inline-block",
            animation: loading ? "none" : "pulse 1.8s ease-in-out infinite"
          }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Live logs</span>
        </div>
        <span style={{
          fontSize: 11, padding: "3px 10px", borderRadius: 20,
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          color: "var(--color-text-tertiary)"
        }}>
          {loading ? "Loading..." : `${events.length} event${events.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Empty state */}
      {!loading && events.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-tertiary)", fontSize: 13 }}>
          No events recorded yet.
        </div>
      )}

      {/* Event rows */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {events.map((ev, i) => (
          <div key={i}>
            <div
              onClick={() => setExpanded(expanded === i ? null : i)}
              style={{
                display: "grid", gridTemplateColumns: "110px 1fr auto",
                alignItems: "start", gap: 12, padding: "10px 14px",
                borderRadius: 8, cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {/* Badge */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{
                  fontSize: 10, fontWeight: 500, padding: "2px 8px",
                  borderRadius: 20, display: "inline-block", whiteSpace: "nowrap",
                  ...getBadgeStyle(ev.type)
                }}>
                  {(ev.type || "UNKNOWN").replace(/_/g, " ")}
                </span>
                {i === 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 500, padding: "2px 7px",
                    borderRadius: 20, background: "#EAF3DE", color: "#27500A",
                    display: "inline-block"
                  }}>new</span>
                )}
              </div>

              {/* Device + message */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <code style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{ev.name}</code>
                {ev.message && (
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{ev.message}</span>
                )}
              </div>

              {/* Timestamp */}
              <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", whiteSpace: "nowrap", paddingTop: 2 }}>
                {formatRelative(ev.timeStamp)}
              </span>
            </div>

            {/* Raw JSON drawer */}
            {expanded === i && (
              <pre style={{
                margin: "0 14px 8px", padding: "10px 12px",
                background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 8, fontSize: 11,
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--color-text-secondary)",
                overflowX: "auto", lineHeight: 1.6
              }}>
                {JSON.stringify(ev, null, 2)}
              </pre>
            )}

            {i < events.length - 1 && (
              <div style={{ height: "0.5px", background: "var(--color-border-tertiary)", margin: "2px 0" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
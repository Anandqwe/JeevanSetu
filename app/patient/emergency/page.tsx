"use client";

import { startTransition, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Activity,
  BellRing,
  CheckCircle2,
  Clock3,
  LogOut,
  MapPin,
  Mic,
  Navigation,
  PhoneCall,
  ShieldCheck,
  Siren,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LocationState =
  | { status: "idle" | "denied" | "unsupported" } & { coords?: undefined; accuracy?: undefined }
  | { status: "fetching" }
  | { status: "ready"; coords: GeolocationCoordinates; accuracy?: number };

type TimelineEntry = {
  label: string;
  detail: string;
  status: "pending" | "done";
  timestamp?: string;
};

const INCIDENT_TAGS = ["Road accident", "Cardiac", "Stroke", "Breathing", "Burn", "Other"];
const REJECTION_POLICIES = [
  "Block driver after 3 rejects",
  "Escalate to govt dashboard",
  "Auto-assign after 2 mins",
];
const NEARBY_AMBULANCES = [
  { unit: "ALS-21", eta: 4 },
  { unit: "BLS-07", eta: 5 },
  { unit: "Gov-12", eta: 6 },
];
const INCIDENT_NOTES = "Heaviness in chest, difficulty breathing.";

function useGeolocation(autoRequest = true): LocationState {
  const [state, setState] = useState<LocationState>({ status: "idle" });

  useEffect(() => {
    if (!autoRequest) return;
    if (!("geolocation" in navigator)) {
      startTransition(() => setState({ status: "unsupported" }));
      return;
    }

    startTransition(() => setState({ status: "fetching" }));
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        startTransition(() =>
          setState({ status: "ready", coords: position.coords, accuracy: position.coords.accuracy })
        );
      },
      () => {
        startTransition(() => setState({ status: "denied" }));
      },
      { enableHighAccuracy: true, maximumAge: 10_000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [autoRequest]);

  return state;
}

export default function PatientEmergencyPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const [emergencyState, setEmergencyState] = useState<"idle" | "precheck" | "dispatching" | "locked">("idle");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([
    {
      label: "Medical snapshot",
      detail: "Profile verified & synced",
      status: "done",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      label: "Preferred hospitals",
      detail: "Awaiting readiness check",
      status: "pending",
    },
    {
      label: "Ambulance lock",
      detail: "No active dispatch",
      status: "pending",
    },
    {
      label: "Family notified",
      detail: "SMS/WhatsApp queued",
      status: "pending",
    },
  ]);
  const [selectedTag, setSelectedTag] = useState("Cardiac");
  const [voiceCapturing, setVoiceCapturing] = useState(false);
  const [bystanderReport, setBystanderReport] = useState({ description: "", contact: "" });
  const location = useGeolocation(true);

  const locationSummary = useMemo(() => {
    if (location.status === "unsupported") return "Device has no GPS";
    if (location.status === "denied") return "Location blocked – tap to enter manually";
    if (location.status === "fetching" || location.status === "idle") return "Fetching live location...";
    if (location.status === "ready" && location.coords) {
      const { latitude, longitude, accuracy } = location.coords;
      const preciseAccuracy = location.accuracy ?? accuracy ?? 10;
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (${Math.round(preciseAccuracy)}m)`;
    }
    return "Live location pending";
  }, [location]);

  const handleEmergencyTrigger = () => {
    if (emergencyState !== "idle") return;
    setEmergencyState("precheck");

    setTimeline((prev) =>
      prev.map((entry, index) =>
        index === 1
          ? { ...entry, status: "done", detail: "Hospitals pinged", timestamp: new Date().toLocaleTimeString() }
          : entry
      )
    );

    setTimeout(() => {
      setEmergencyState("dispatching");
      setTimeline((prev) =>
        prev.map((entry, index) =>
          index === 2
            ? {
                ...entry,
                status: "done",
                detail: "Driver alerted – awaiting accept",
                timestamp: new Date().toLocaleTimeString(),
              }
            : entry
        )
      );
    }, 1200);

    setTimeout(() => {
      setEmergencyState("locked");
      setTimeline((prev) =>
        prev.map((entry, index) =>
          index === 3
            ? {
                ...entry,
                status: "done",
                detail: "Family notified with live map",
                timestamp: new Date().toLocaleTimeString(),
              }
            : entry
        )
      );
    }, 2800);
  };

  const handleReportSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    alert("Accident report queued with live GPS. (Mock)");
    setBystanderReport({ description: "", contact: "" });
  };

  const handleVoiceCapture = () => {
    setVoiceCapturing((prev) => !prev);
    if (!voiceCapturing) {
      setBystanderReport((prev) => ({
        ...prev,
        description: prev.description ? prev.description + "\n" + "Voice: Victim unconscious" : "Voice: Victim unconscious",
      }));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
        <header className="flex flex-col gap-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-500">Patient Emergency Command</p>
          <h1 className="text-3xl font-bold text-slate-900">Zero-click emergency support</h1>
          <p className="text-slate-500">
            We preload your medical history, preferred hospitals, and family contacts so every second counts.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="border-red-200 bg-white shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl text-red-600">
                    <Siren className="h-6 w-6" /> Emergency Button
                  </CardTitle>
                  <CardDescription>Single tap dispatch with medical & hospital context</CardDescription>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Profile verified ✅
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-red-300 bg-red-50/60 p-4 text-center">
                <p className="text-sm uppercase tracking-widest text-red-500">Tap in any crisis</p>
                <Button
                  size="lg"
                  className="relative mx-auto w-full max-w-xs rounded-full bg-red-600 py-6 text-lg font-semibold uppercase tracking-wide shadow-lg shadow-red-300 transition hover:scale-105"
                  onClick={handleEmergencyTrigger}
                  disabled={emergencyState !== "idle"}
                >
                  <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-red-400/50" />
                  {emergencyState === "idle" && "Emergency"}
                  {emergencyState === "precheck" && "Checking hospitals"}
                  {emergencyState === "dispatching" && "Alerting ambulances"}
                  {emergencyState === "locked" && "Ambulance locked"}
                </Button>
                <p className="text-xs text-slate-500">
                  Includes identity, medical summary, preferred hospitals, live GPS, and device diagnostics.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <DeviceTile
                  title="Location"
                  icon={<MapPin className="h-4 w-4" />}
                  value={locationSummary}
                  status={location.status === "ready" ? "ok" : location.status === "denied" ? "warn" : "pending"}
                />
                <DeviceTile
                  title="SMS Backup"
                  icon={<PhoneCall className="h-4 w-4" />}
                  value="Offline HELP SMS ready"
                  status="ok"
                />
                <DeviceTile
                  title="Wearable"
                  icon={<Activity className="h-4 w-4" />}
                  value="Smartwatch paired"
                  status="ok"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">What we send:</p>
                <ul className="mt-2 space-y-1 list-disc pl-5">
                  <li>Latest vitals + chronic conditions ({INCIDENT_NOTES})</li>
                  <li>Preferred hospitals (ICU + insurance ready)</li>
                  <li>Family contacts auto-alerted with live map + ETA</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              {REJECTION_POLICIES.map((policy) => (
                <span key={policy} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {policy}
                </span>
              ))}
            </CardFooter>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" /> Report an Accident
              </CardTitle>
              <CardDescription>Bystander mode – no login, minimal input, automatic GPS</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {INCIDENT_TAGS.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        selectedTag === tag ? "border-red-500 bg-red-50 text-red-600" : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">What happened?</label>
                  <textarea
                    className="min-h-[96px] w-full rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="Example: He collapsed suddenly near Sector 21 bus stop."
                    value={bystanderReport.description}
                    onChange={(event) => setBystanderReport({ ...bystanderReport, description: event.target.value })}
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <button type="button" onClick={handleVoiceCapture} className="inline-flex items-center gap-1 text-red-600">
                      <Mic className={`h-3.5 w-3.5 ${voiceCapturing ? "animate-pulse" : ""}`} />
                      {voiceCapturing ? "Recording..." : "Add voice note"}
                    </button>
                    <span>{selectedTag}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">How can responders reach you?</label>
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Phone or stay anonymous"
                    value={bystanderReport.contact}
                    onChange={(event) => setBystanderReport({ ...bystanderReport, contact: event.target.value })}
                  />
                </div>

                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Navigation className="h-4 w-4 text-red-500" /> Live GPS
                  </div>
                  <p className="mt-1 text-xs">{locationSummary}</p>
                  <p className="mt-1 text-xs">A photo or short clip can be added after submission.</p>
                </div>

                <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800">
                  Send report to command center
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <BellRing className="h-4 w-4 text-indigo-500" /> Dispatch timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {timeline.map((item) => (
                  <li key={item.label} className="flex gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full ${item.status === "done" ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.detail}</p>
                      {item.timestamp && <p className="text-[10px] uppercase text-slate-400">{item.timestamp}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock3 className="h-4 w-4 text-blue-500" /> Nearby ambulances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Within 5 km</span>
                <span className="font-semibold text-slate-900">04 units</span>
              </div>
              <div className="space-y-2">
                {NEARBY_AMBULANCES.map(({ unit, eta }) => (
                  <div key={unit} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{unit}</p>
                      <p className="text-xs text-slate-500">ETA {eta} mins</p>
                    </div>
                    <span className="text-xs font-medium text-emerald-600">On duty</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Waves className="h-4 w-4 text-teal-500" /> Sensors & vitals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <VitalBadge label="ECG" value="72 bpm" status="stable" />
              <VitalBadge label="BP" value="118/78" status="stable" />
              <VitalBadge label="SpO2" value="97%" status="stable" />
              <p className="text-xs text-slate-500">Real sensors stream automatically once ambulance confirms pickup.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

type DeviceTileProps = {
  title: string;
  icon: ReactNode;
  value: string;
  status: "ok" | "warn" | "pending";
};

function DeviceTile({ title, icon, value, status }: DeviceTileProps) {
  const colors =
    status === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-white text-slate-600";

  return (
    <div className={`rounded-xl border px-3 py-2 text-xs ${colors}`}>
      <div className="flex items-center gap-1 font-semibold">
        {icon}
        {title}
      </div>
      <p className="mt-1 text-[11px] leading-tight">{value}</p>
    </div>
  );
}

type VitalBadgeProps = {
  label: string;
  value: string;
  status: "stable" | "alert";
};

function VitalBadge({ label, value, status }: VitalBadgeProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
      <div className="flex items-center gap-2 text-slate-600">
        <CheckCircle2 className={`h-4 w-4 ${status === "stable" ? "text-emerald-500" : "text-amber-500"}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

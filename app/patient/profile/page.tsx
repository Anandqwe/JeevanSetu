'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import { Activity, ClipboardList, ShieldCheck, Smartphone, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const HOSPITAL_OPTIONS = [
  'City Heart Institute',
  'MetroCare Cardiac',
  'Govt Trauma Center',
  'Sunrise Multispeciality',
  'Pulse Children Hospital',
];

const PREFERRED_MIN = 2;

type PatientProfileDraft = {
  name: string;
  age: string;
  gender: string;
  address: string;
  bloodGroup: string;
  contactNumber: string;
  email: string;
  emergencyContacts: [string, string];
  diabetes: boolean;
  bpIssues: boolean;
  heartConditions: string;
  kidneyConditions: string;
  allergies: string;
  medications: string;
  disabilities: string;
  hasInsurance: boolean;
  insuranceProvider: string;
  policyNumber: string;
  insuranceCardName?: string;
  reportName?: string;
  preferredHospitals: string[];
  additionalHospitals: string[];
  allowLocation: boolean;
  allowSms: boolean;
  allowVoice: boolean;
  wearablePaired: boolean;
};

const defaultDraft: PatientProfileDraft = {
  name: '',
  age: '',
  gender: '',
  address: '',
  bloodGroup: '',
  contactNumber: '',
  email: '',
  emergencyContacts: ['', ''],
  diabetes: false,
  bpIssues: false,
  heartConditions: '',
  kidneyConditions: '',
  allergies: '',
  medications: '',
  disabilities: '',
  hasInsurance: true,
  insuranceProvider: '',
  policyNumber: '',
  preferredHospitals: ['City Heart Institute', 'MetroCare Cardiac'],
  additionalHospitals: [],
  allowLocation: true,
  allowSms: true,
  allowVoice: true,
  wearablePaired: false,
};

export default function PatientProfilePage() {
  const [draft, setDraft] = useState<PatientProfileDraft>(defaultDraft);
  const [stepIndex, setStepIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('patient-profile-draft');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        startTransition(() => setDraft({ ...defaultDraft, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse patient profile draft', error);
      }
    }
  }, []);

  const steps = ['Personal', 'Medical & Insurance', 'Preferences'];
  const canContinue = useMemo(() => {
    if (stepIndex === 0) {
      return (
        draft.name &&
        draft.age &&
        draft.gender &&
        draft.address &&
        draft.bloodGroup &&
        draft.contactNumber &&
        draft.email &&
        draft.emergencyContacts.every(Boolean)
      );
    }
    if (stepIndex === 1) {
      if (draft.hasInsurance) {
        return draft.insuranceProvider && draft.policyNumber;
      }
      return true;
    }
    return draft.preferredHospitals.length >= PREFERRED_MIN;
  }, [draft, stepIndex]);

  const handleNext = () => {
    if (!canContinue) {
      setStatusMessage('Complete required fields before continuing.');
      return;
    }
    setStatusMessage(null);
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStatusMessage(null);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleDraftChange = <K extends keyof PatientProfileDraft>(key: K, value: PatientProfileDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleEmergencyContactChange = (index: number, value: string) => {
    const updated = [...draft.emergencyContacts] as [string, string];
    updated[index] = value;
    handleDraftChange('emergencyContacts', updated);
  };

  const toggleHospitalSelection = (hospital: string) => {
    setDraft((prev) => {
      const exists = prev.preferredHospitals.includes(hospital);
      if (exists) {
        return { ...prev, preferredHospitals: prev.preferredHospitals.filter((h) => h !== hospital) };
      }
      return { ...prev, preferredHospitals: [...prev.preferredHospitals, hospital] };
    });
  };

  const handleFileCapture = (key: 'insuranceCardName' | 'reportName', fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    handleDraftChange(key, fileList[0].name);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canContinue || draft.preferredHospitals.length < PREFERRED_MIN) {
      setStatusMessage('Please ensure at least two preferred hospitals are selected.');
      return;
    }
    setIsSaving(true);
    localStorage.setItem('patient-profile-draft', JSON.stringify(draft));
    setTimeout(() => {
      setIsSaving(false);
      setStatusMessage('Profile saved locally. We will sync it once APIs are available.');
    }, 600);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-500">Patient profile intake</p>
          <h1 className="text-3xl font-bold text-slate-900">Preload your critical medical data</h1>
          <p className="text-slate-500">
            Completing this form saves 5–10 minutes during emergencies and automatically informs hospitals + ambulances.
          </p>
        </header>

        {statusMessage && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            {statusMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ClipboardList className="h-5 w-5 text-red-500" /> Step {stepIndex + 1} of {steps.length}
              </CardTitle>
              <CardDescription>{steps[stepIndex]}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <StepIndicator current={stepIndex} steps={steps} />
              <form onSubmit={handleSubmit} className="space-y-6">
                {stepIndex === 0 && (
                  <section className="grid gap-4 md:grid-cols-2">
                    <Field label="Full Name" required>
                      <Input value={draft.name} onChange={(e) => handleDraftChange('name', e.target.value)} required />
                    </Field>
                    <Field label="Age" required>
                      <Input type="number" value={draft.age} onChange={(e) => handleDraftChange('age', e.target.value)} required />
                    </Field>
                    <Field label="Gender" required>
                      <select
                        className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
                        value={draft.gender}
                        onChange={(e) => handleDraftChange('gender', e.target.value)}
                        required
                      >
                        <option value="">Select</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                    <Field label="Blood Group" required>
                      <Input value={draft.bloodGroup} onChange={(e) => handleDraftChange('bloodGroup', e.target.value)} required />
                    </Field>
                    <Field label="Primary Address" className="md:col-span-2" required>
                      <textarea
                        className="min-h-[80px] w-full rounded-md border border-slate-200 p-2 text-sm"
                        value={draft.address}
                        onChange={(e) => handleDraftChange('address', e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Contact Number" required>
                      <Input value={draft.contactNumber} onChange={(e) => handleDraftChange('contactNumber', e.target.value)} required />
                    </Field>
                    <Field label="Email" required>
                      <Input type="email" value={draft.email} onChange={(e) => handleDraftChange('email', e.target.value)} required />
                    </Field>
                    <Field label="Emergency Contact 1" required>
                      <Input value={draft.emergencyContacts[0]} onChange={(e) => handleEmergencyContactChange(0, e.target.value)} required />
                    </Field>
                    <Field label="Emergency Contact 2" required>
                      <Input value={draft.emergencyContacts[1]} onChange={(e) => handleEmergencyContactChange(1, e.target.value)} required />
                    </Field>
                  </section>
                )}

                {stepIndex === 1 && (
                  <section className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <CheckboxField
                        label="Diabetes"
                        checked={draft.diabetes}
                        onChange={(checked) => handleDraftChange('diabetes', checked)}
                      />
                      <CheckboxField
                        label="Blood pressure issues"
                        checked={draft.bpIssues}
                        onChange={(checked) => handleDraftChange('bpIssues', checked)}
                      />
                    </div>
                    <Field label="Heart conditions">
                      <textarea
                        className="min-h-[64px] w-full rounded-md border border-slate-200 p-2 text-sm"
                        placeholder="Example: Coronary artery disease, angioplasty 2018"
                        value={draft.heartConditions}
                        onChange={(e) => handleDraftChange('heartConditions', e.target.value)}
                      />
                    </Field>
                    <Field label="Kidney conditions">
                      <textarea
                        className="min-h-[64px] w-full rounded-md border border-slate-200 p-2 text-sm"
                        value={draft.kidneyConditions}
                        onChange={(e) => handleDraftChange('kidneyConditions', e.target.value)}
                      />
                    </Field>
                    <Field label="Allergies to medicines">
                      <textarea
                        className="min-h-[64px] w-full rounded-md border border-slate-200 p-2 text-sm"
                        placeholder="Penicillin, Ibuprofen"
                        value={draft.allergies}
                        onChange={(e) => handleDraftChange('allergies', e.target.value)}
                      />
                    </Field>
                    <Field label="Regular medications">
                      <textarea
                        className="min-h-[64px] w-full rounded-md border border-slate-200 p-2 text-sm"
                        value={draft.medications}
                        onChange={(e) => handleDraftChange('medications', e.target.value)}
                      />
                    </Field>
                    <Field label="Disabilities">
                      <textarea
                        className="min-h-[64px] w-full rounded-md border border-slate-200 p-2 text-sm"
                        value={draft.disabilities}
                        onChange={(e) => handleDraftChange('disabilities', e.target.value)}
                      />
                    </Field>

                    <div className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-slate-700">Insurance available?</Label>
                        <input
                          type="checkbox"
                          checked={draft.hasInsurance}
                          onChange={(e) => handleDraftChange('hasInsurance', e.target.checked)}
                        />
                      </div>
                      {draft.hasInsurance && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <Field label="Insurance provider" required>
                            <Input value={draft.insuranceProvider} onChange={(e) => handleDraftChange('insuranceProvider', e.target.value)} required />
                          </Field>
                          <Field label="Policy number" required>
                            <Input value={draft.policyNumber} onChange={(e) => handleDraftChange('policyNumber', e.target.value)} required />
                          </Field>
                          <Field label="Insurance card (upload snapshot)" className="md:col-span-2">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(event) => handleFileCapture('insuranceCardName', event.target.files)}
                            />
                            {draft.insuranceCardName && (
                              <p className="text-xs text-slate-500">Captured: {draft.insuranceCardName}</p>
                            )}
                          </Field>
                        </div>
                      )}
                      <Field label="Recent medical report (optional)" className="mt-4">
                        <input type="file" accept="image/*,application/pdf" onChange={(event) => handleFileCapture('reportName', event.target.files)} />
                        {draft.reportName && <p className="text-xs text-slate-500">Captured: {draft.reportName}</p>}
                      </Field>
                    </div>
                  </section>
                )}

                {stepIndex === 2 && (
                  <section className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Select at least two preferred hospitals</Label>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {HOSPITAL_OPTIONS.map((hospital) => {
                          const checked = draft.preferredHospitals.includes(hospital);
                          return (
                            <label key={hospital} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${checked ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200'}`}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleHospitalSelection(hospital)}
                              />
                              {hospital}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <Field label="Additional hospitals (comma separated)">
                      <Input
                        placeholder="Optional"
                        value={draft.additionalHospitals.join(', ')}
                        onChange={(e) =>
                          handleDraftChange(
                            'additionalHospitals',
                            e.target.value
                              .split(',')
                              .map((item) => item.trim())
                              .filter(Boolean)
                          )
                        }
                      />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                      <ToggleField
                        label="Allow location access"
                        description="Required for instant dispatch"
                        checked={draft.allowLocation}
                        onChange={(checked) => handleDraftChange('allowLocation', checked)}
                      />
                      <ToggleField
                        label="Allow SMS alerts"
                        description="Offline HELP SMS + family updates"
                        checked={draft.allowSms}
                        onChange={(checked) => handleDraftChange('allowSms', checked)}
                      />
                      <ToggleField
                        label="Enable voice commands"
                        description="Web Speech API for emergencies"
                        checked={draft.allowVoice}
                        onChange={(checked) => handleDraftChange('allowVoice', checked)}
                      />
                      <ToggleField
                        label="Smartwatch paired"
                        description="Tap SOS + vitals streaming"
                        checked={draft.wearablePaired}
                        onChange={(checked) => handleDraftChange('wearablePaired', checked)}
                      />
                    </div>
                  </section>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="text-xs text-slate-500">Step {stepIndex + 1} / {steps.length}</div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleBack} disabled={stepIndex === 0}>
                      Back
                    </Button>
                    {stepIndex < steps.length - 1 ? (
                      <Button type="button" onClick={handleNext} disabled={!canContinue}>
                        Continue
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSaving || !canContinue}>
                        {isSaving ? 'Saving...' : 'Save profile'}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Why this matters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>Hospitals preload ICU/ventilator availability while ambulances review your medical history.</p>
                <p>Family contacts receive live location + driver details instantly when you trigger SOS.</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Enables zero-click emergency dispatch</li>
                  <li>Blocks drivers that repeatedly reject</li>
                  <li>Feeds anonymized stats to the government dashboard</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-red-500" /> Status summary
                </CardTitle>
                <CardDescription>Auto-sync preview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <SummaryRow label="Medical history" value={draft.heartConditions || draft.diabetes || draft.bpIssues ? 'Captured' : 'Pending'} />
                <SummaryRow label="Insurance" value={draft.hasInsurance ? 'Ready' : 'Not provided'} />
                <SummaryRow label="Hospitals" value={`${draft.preferredHospitals.length} preferred`} />
                <SummaryRow label="Device settings" value={[draft.allowLocation ? 'GPS' : null, draft.allowSms ? 'SMS' : null, draft.wearablePaired ? 'Wearable' : null].filter(Boolean).join(', ') || 'Pending'} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Smartphone className="h-4 w-4 text-indigo-500" /> Device checklist
                </CardTitle>
                <CardDescription>Keep these toggles on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-500">
                <p>✔ Location + Bluetooth enabled</p>
                <p>✔ SMS permissions granted</p>
                <p>✔ Wearable battery &gt; 30%</p>
                <p>✔ NFC emergency card in wallet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UploadCloud className="h-4 w-4 text-slate-600" /> Secure uploads
                </CardTitle>
                <CardDescription>Encrypted at rest (AES‑256)</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                Insurance cards + medical reports are encrypted before storage. Only hospitals assigned to your emergency can decrypt them.
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

type StepIndicatorProps = {
  current: number;
  steps: string[];
};

function StepIndicator({ current, steps }: StepIndicatorProps) {
  return (
    <ol className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
      {steps.map((label, idx) => (
        <li key={label} className={`flex items-center gap-1 rounded-full border px-3 py-1 ${
          idx === current ? 'border-red-200 bg-red-50 text-red-600' : idx < current ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200'
        }`}>
          <span>{idx + 1}.</span>
          {label}
        </li>
      ))}
    </ol>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

function Field({ label, children, required, className }: FieldProps) {
  return (
    <div className={className}>
      <Label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

type ToggleFieldProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
        {label}
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      </div>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span>{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

import {
  listProvidersWithModels,
  syncModelsFromConfig,
  toggleVideoProvider,
  toggleVideoModel,
  upsertVideoProvider,
  upsertVideoModel,
  deleteVideoModel,
  deleteVideoProvider,
} from '@/api/admin-video-models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronDown,
  IconChevronRight,
  IconAlertTriangle,
  IconRefresh,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type ParsedModel = {
  id: string;
  providerId: string;
  modelKey: string;
  providerModelName: string;
  displayNameEn: string;
  displayNameZh: string;
  enabled: boolean;
  supportedTypes: string[];
  supportedResolutions: string[];
  supportedAspectRatios: string[];
  supportedDurations: number[];
  defaultResolution: string;
  defaultDuration: number;
  defaultAspectRatio: string;
  creditCost480p: number;
  creditCost720p: number;
  creditCost1080p: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type ProviderWithModels = {
  id: string;
  key: string;
  displayName: string;
  enabled: boolean;
  apiKeyEnvVar: string;
  baseUrl: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  models: ParsedModel[];
};

// ── Provider form defaults ─────────────────────────────────────────────────────

const EMPTY_PROVIDER = {
  id: undefined as string | undefined,
  key: '',
  displayName: '',
  enabled: true,
  apiKeyEnvVar: '',
  baseUrl: '',
  notes: '',
  sortOrder: 0,
};

const EMPTY_MODEL = {
  id: undefined as string | undefined,
  providerId: '',
  modelKey: '',
  providerModelName: '',
  displayNameEn: '',
  displayNameZh: '',
  enabled: true,
  supportedTypes: ['text-to-video', 'image-to-video'],
  supportedResolutions: ['480p', '720p', '1080p'],
  supportedAspectRatios: ['16:9', '9:16', '1:1'],
  supportedDurations: [5, 10],
  defaultResolution: '720p',
  defaultDuration: 5,
  defaultAspectRatio: '16:9',
  creditCost480p: 2,
  creditCost720p: 3,
  creditCost1080p: 5,
  sortOrder: 0,
};

// ── Provider form dialog ───────────────────────────────────────────────────────

function ProviderFormDialog({
  initial,
  onClose,
}: {
  initial: typeof EMPTY_PROVIDER;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState(initial);

  const mutation = useMutation({
    mutationFn: () =>
      upsertVideoProvider({
        data: {
          id: form.id,
          key: form.key,
          displayName: form.displayName,
          enabled: form.enabled,
          apiKeyEnvVar: form.apiKeyEnvVar,
          baseUrl: form.baseUrl || undefined,
          notes: form.notes || undefined,
          sortOrder: form.sortOrder,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-video-providers'] });
      onClose();
    },
  });

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{form.id ? 'Edit Provider' : 'Add Provider'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Key (internal)</Label>
            <Input
              value={form.key}
              onChange={(e) => set('key', e.target.value)}
              placeholder="apimart"
              disabled={!!form.id}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Display Name</Label>
            <Input
              value={form.displayName}
              onChange={(e) => set('displayName', e.target.value)}
              placeholder="ApiMart"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">API Key Env Var</Label>
          <Input
            value={form.apiKeyEnvVar}
            onChange={(e) => set('apiKeyEnvVar', e.target.value)}
            placeholder="APIMART_API_KEY"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Base URL (optional)</Label>
          <Input
            value={form.baseUrl}
            onChange={(e) => set('baseUrl', e.target.value)}
            placeholder="https://api.example.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Notes</Label>
          <Input
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Optional notes…"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Sort Order</Label>
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
          </div>
          <div className="flex items-end gap-2 pb-0.5">
            <Switch
              checked={form.enabled}
              onCheckedChange={(v) => set('enabled', v)}
            />
            <span className="text-sm text-muted-foreground">Enabled</span>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ── Model form dialog ──────────────────────────────────────────────────────────

function ModelFormDialog({
  initial,
  providerId,
  onClose,
}: {
  initial: typeof EMPTY_MODEL;
  providerId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...initial, providerId });

  const mutation = useMutation({
    mutationFn: () =>
      upsertVideoModel({
        data: {
          id: form.id,
          providerId: form.providerId,
          modelKey: form.modelKey,
          providerModelName: form.providerModelName,
          displayNameEn: form.displayNameEn,
          displayNameZh: form.displayNameZh,
          enabled: form.enabled,
          supportedTypes: form.supportedTypes,
          supportedResolutions: form.supportedResolutions,
          supportedAspectRatios: form.supportedAspectRatios,
          supportedDurations: form.supportedDurations,
          defaultResolution: form.defaultResolution,
          defaultDuration: form.defaultDuration,
          defaultAspectRatio: form.defaultAspectRatio,
          creditCost480p: form.creditCost480p,
          creditCost720p: form.creditCost720p,
          creditCost1080p: form.creditCost1080p,
          sortOrder: form.sortOrder,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-video-providers'] });
      onClose();
    },
  });

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const parseJsonArray = (val: string, numeric: boolean) => {
    try {
      const arr = JSON.parse(`[${val}]`);
      return numeric ? arr.map(Number) : arr.map(String);
    } catch {
      return [];
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{form.id ? 'Edit Model' : 'Add Model'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Model Key (internal)</Label>
            <Input
              value={form.modelKey}
              onChange={(e) => set('modelKey', e.target.value)}
              placeholder="wan27-t2v"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Provider Model Name</Label>
            <Input
              value={form.providerModelName}
              onChange={(e) => set('providerModelName', e.target.value)}
              placeholder="wan2.7"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Display Name (EN)</Label>
            <Input
              value={form.displayNameEn}
              onChange={(e) => set('displayNameEn', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Display Name (ZH)</Label>
            <Input
              value={form.displayNameZh}
              onChange={(e) => set('displayNameZh', e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-1.5">
          <Label className="text-xs">Supported Types (comma-separated)</Label>
          <Input
            value={form.supportedTypes.map((s) => `"${s}"`).join(',')}
            onChange={(e) =>
              set('supportedTypes', parseJsonArray(e.target.value, false))
            }
            placeholder='"text-to-video","image-to-video"'
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Supported Resolutions</Label>
          <Input
            value={form.supportedResolutions.map((s) => `"${s}"`).join(',')}
            onChange={(e) =>
              set('supportedResolutions', parseJsonArray(e.target.value, false))
            }
            placeholder='"480p","720p","1080p"'
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Supported Aspect Ratios</Label>
          <Input
            value={form.supportedAspectRatios.map((s) => `"${s}"`).join(',')}
            onChange={(e) =>
              set(
                'supportedAspectRatios',
                parseJsonArray(e.target.value, false)
              )
            }
            placeholder='"16:9","9:16","1:1"'
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Supported Durations (seconds)</Label>
          <Input
            value={form.supportedDurations.join(',')}
            onChange={(e) =>
              set(
                'supportedDurations',
                e.target.value
                  .split(',')
                  .map((s) => Number(s.trim()))
                  .filter(Boolean)
              )
            }
            placeholder="5,10"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Default Res</Label>
            <Input
              value={form.defaultResolution}
              onChange={(e) => set('defaultResolution', e.target.value)}
              placeholder="720p"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Default Dur (s)</Label>
            <Input
              type="number"
              value={form.defaultDuration}
              onChange={(e) => set('defaultDuration', Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Default AR</Label>
            <Input
              value={form.defaultAspectRatio}
              onChange={(e) => set('defaultAspectRatio', e.target.value)}
              placeholder="16:9"
            />
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Credits 480p/s</Label>
            <Input
              type="number"
              min={0}
              value={form.creditCost480p}
              onChange={(e) => set('creditCost480p', Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Credits 720p/s</Label>
            <Input
              type="number"
              min={0}
              value={form.creditCost720p}
              onChange={(e) => set('creditCost720p', Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Credits 1080p/s</Label>
            <Input
              type="number"
              min={0}
              value={form.creditCost1080p}
              onChange={(e) => set('creditCost1080p', Number(e.target.value))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Sort Order</Label>
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
          </div>
          <div className="flex items-end gap-2 pb-0.5">
            <Switch
              checked={form.enabled}
              onCheckedChange={(v) => set('enabled', v)}
            />
            <span className="text-sm text-muted-foreground">Enabled</span>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ── Delete confirm dialog ──────────────────────────────────────────────────────

function DeleteConfirmDialog({
  label,
  onConfirm,
  onClose,
  isPending,
}: {
  label: string;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <IconAlertTriangle className="size-5 text-destructive" />
          Confirm Delete
        </DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete <strong>{label}</strong>? This action
        cannot be undone.
      </p>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
          {isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ── Model row ──────────────────────────────────────────────────────────────────

function ModelRow({ model }: { model: ParsedModel }) {
  const qc = useQueryClient();
  const [dialog, setDialog] = useState<'edit' | 'delete' | null>(null);

  const toggleMut = useMutation({
    mutationFn: (enabled: boolean) =>
      toggleVideoModel({ data: { id: model.id, enabled } }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['admin-video-providers'] }),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteVideoModel({ data: { id: model.id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-video-providers'] });
      setDialog(null);
    },
  });

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
          model.enabled ? 'bg-card' : 'bg-muted/30 opacity-60'
        )}
      >
        <Switch
          checked={model.enabled}
          onCheckedChange={(v) => toggleMut.mutate(v)}
          disabled={toggleMut.isPending}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{model.displayNameEn}</span>
            <span className="text-xs text-muted-foreground">
              {model.displayNameZh}
            </span>
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              {model.providerModelName}
            </code>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {model.supportedTypes.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </div>
        <div className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
          <span className="rounded border px-1.5 py-0.5">
            480p: {model.creditCost480p}c/s
          </span>
          <span className="rounded border px-1.5 py-0.5">
            720p: {model.creditCost720p}c/s
          </span>
          <span className="rounded border px-1.5 py-0.5">
            1080p: {model.creditCost1080p}c/s
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setDialog('edit')}
            title="Edit model"
          >
            <IconEdit className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => setDialog('delete')}
            title="Delete model"
          >
            <IconTrash className="size-3.5" />
          </Button>
        </div>
      </div>

      <Dialog open={dialog === 'edit'} onOpenChange={() => setDialog(null)}>
        <ModelFormDialog
          initial={{
            id: model.id,
            providerId: model.providerId,
            modelKey: model.modelKey,
            providerModelName: model.providerModelName,
            displayNameEn: model.displayNameEn,
            displayNameZh: model.displayNameZh,
            enabled: model.enabled,
            supportedTypes: model.supportedTypes,
            supportedResolutions: model.supportedResolutions,
            supportedAspectRatios: model.supportedAspectRatios,
            supportedDurations: model.supportedDurations,
            defaultResolution: model.defaultResolution,
            defaultDuration: model.defaultDuration,
            defaultAspectRatio: model.defaultAspectRatio,
            creditCost480p: model.creditCost480p,
            creditCost720p: model.creditCost720p,
            creditCost1080p: model.creditCost1080p,
            sortOrder: model.sortOrder,
          }}
          providerId={model.providerId}
          onClose={() => setDialog(null)}
        />
      </Dialog>
      <Dialog open={dialog === 'delete'} onOpenChange={() => setDialog(null)}>
        <DeleteConfirmDialog
          label={model.displayNameEn}
          onConfirm={() => deleteMut.mutate()}
          onClose={() => setDialog(null)}
          isPending={deleteMut.isPending}
        />
      </Dialog>
    </>
  );
}

// ── Provider card ──────────────────────────────────────────────────────────────

function ProviderCard({ provider }: { provider: ProviderWithModels }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(true);
  const [dialog, setDialog] = useState<'edit' | 'addModel' | 'delete' | null>(
    null
  );

  const toggleMut = useMutation({
    mutationFn: (enabled: boolean) =>
      toggleVideoProvider({ data: { id: provider.id, enabled } }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['admin-video-providers'] }),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteVideoProvider({ data: { id: provider.id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-video-providers'] });
      setDialog(null);
    },
  });

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Provider header */}
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <IconChevronDown className="size-4" />
            ) : (
              <IconChevronRight className="size-4" />
            )}
          </button>
          <Switch
            checked={provider.enabled}
            onCheckedChange={(v) => toggleMut.mutate(v)}
            disabled={toggleMut.isPending}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{provider.displayName}</span>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {provider.key}
              </code>
              <Badge variant="outline" className="text-xs">
                {provider.models.length} model
                {provider.models.length !== 1 ? 's' : ''}
              </Badge>
              {!provider.enabled && (
                <Badge
                  variant="outline"
                  className="border-destructive/40 text-destructive text-xs"
                >
                  Disabled
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Env var:{' '}
              <code className="font-mono">{provider.apiKeyEnvVar}</code>
              {provider.notes ? ` — ${provider.notes}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setDialog('addModel')}
              title="Add model"
            >
              <IconPlus className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setDialog('edit')}
              title="Edit provider"
            >
              <IconEdit className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              onClick={() => setDialog('delete')}
              title="Delete provider"
            >
              <IconTrash className="size-4" />
            </Button>
          </div>
        </div>

        {/* Models list */}
        {expanded && (
          <div className="border-t px-5 py-4">
            {provider.models.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No models yet.{' '}
                <button
                  type="button"
                  className="underline hover:no-underline"
                  onClick={() => setDialog('addModel')}
                >
                  Add one
                </button>
              </p>
            ) : (
              <div className="space-y-2">
                {provider.models.map((m) => (
                  <ModelRow key={m.id} model={m} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={dialog === 'edit'} onOpenChange={() => setDialog(null)}>
        <ProviderFormDialog
          initial={{
            id: provider.id,
            key: provider.key,
            displayName: provider.displayName,
            enabled: provider.enabled,
            apiKeyEnvVar: provider.apiKeyEnvVar,
            baseUrl: provider.baseUrl ?? '',
            notes: provider.notes ?? '',
            sortOrder: provider.sortOrder,
          }}
          onClose={() => setDialog(null)}
        />
      </Dialog>
      <Dialog open={dialog === 'addModel'} onOpenChange={() => setDialog(null)}>
        <ModelFormDialog
          initial={EMPTY_MODEL}
          providerId={provider.id}
          onClose={() => setDialog(null)}
        />
      </Dialog>
      <Dialog open={dialog === 'delete'} onOpenChange={() => setDialog(null)}>
        <DeleteConfirmDialog
          label={`${provider.displayName} (and all its models)`}
          onConfirm={() => deleteMut.mutate()}
          onClose={() => setDialog(null)}
          isPending={deleteMut.isPending}
        />
      </Dialog>
    </>
  );
}

// ── Main content ───────────────────────────────────────────────────────────────

export function AdminVideoModelsContent() {
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    created: number;
    updated: number;
  } | null>(null);

  const qc = useQueryClient();

  const { data: providers, isLoading } = useQuery({
    queryKey: ['admin-video-providers'],
    queryFn: () => listProvidersWithModels(),
  });

  const syncMut = useMutation({
    mutationFn: () => syncModelsFromConfig(),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['admin-video-providers'] });
      setSyncResult(result);
      setTimeout(() => setSyncResult(null), 5000);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Video Providers & Models</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage API providers and their models. Disable a provider to hide
            all its models from users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncResult && (
            <span className="text-xs text-muted-foreground">
              Synced: +{syncResult.created} new, {syncResult.updated} updated
            </span>
          )}
          <Button
            variant="outline"
            onClick={() => syncMut.mutate()}
            disabled={syncMut.isPending}
          >
            <IconRefresh className="mr-1.5 size-4" />
            {syncMut.isPending ? 'Syncing…' : 'Sync from config'}
          </Button>
          <Button onClick={() => setShowAddProvider(true)}>
            <IconPlus className="mr-1.5 size-4" />
            Add Provider
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : providers?.length === 0 ? (
        <div className="rounded-xl border bg-muted/30 p-12 text-center text-muted-foreground">
          No providers configured yet.
        </div>
      ) : (
        <div className="space-y-4">
          {(providers ?? []).map((p) => (
            <ProviderCard key={p.id} provider={p as ProviderWithModels} />
          ))}
        </div>
      )}

      <Dialog open={showAddProvider} onOpenChange={setShowAddProvider}>
        <ProviderFormDialog
          initial={EMPTY_PROVIDER}
          onClose={() => setShowAddProvider(false)}
        />
      </Dialog>
    </div>
  );
}

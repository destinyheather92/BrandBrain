"use client";

import {
  ArrowLeft,
  Badge,
  BoxSelect,
  Clock3,
  History,
  MousePointer2,
  Save,
  Square,
  Trash2,
  Type
} from "lucide-react";
import Link from "next/link";
import {
  type ReactNode,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition
} from "react";

import { AiGenerationPanel } from "@/features/ai/components/ai-generation-panel";
import { initialAiGenerationActionState } from "@/features/ai/types/ai-generation-action-state";
import type {
  AiGenerationAction,
  AiGenerationActionState
} from "@/features/ai/types/ai-generation-action-state";
import { getCanvasElementsInPaintOrder } from "@/features/canvas/services/canvas-object-model.service";
import type { CanvasDocument, CanvasElement, CanvasSlide } from "@/features/canvas/types/canvas";
import { ExportPanel } from "@/features/exports/components/export-panel";
import { ThemeEnginePanel } from "@/features/themes/components/theme-engine-panel";
import { applyProjectThemeToCanvas } from "@/features/themes/services/theme-engine.service";
import { initialProjectThemeActionState } from "@/features/themes/types/project-theme-action-state";
import type { ProjectTheme } from "@/features/themes/types/project-theme";
import type {
  ProjectThemeAction,
  ProjectThemeActionState
} from "@/features/themes/types/project-theme-action-state";

import {
  addCanvasElementToSlide,
  createCanvasCtaElement,
  createCanvasShapeElement,
  createCanvasTextElement,
  normalizeEditorCanvas,
  removeCanvasElement,
  updateCanvasElement
} from "../services/project-editor-canvas.service";
import type { ContentProject } from "../types/content-project";
import type {
  ProjectEditorAutosaveAction,
  ProjectEditorRestoreAction,
  ProjectEditorSaveState
} from "../types/project-editor-form-state";
import {
  initialProjectEditorRestoreState,
  initialProjectEditorSaveState
} from "../types/project-editor-form-state";
import type { ProjectVersion, ProjectVersionSource } from "../types/project-version";

type ProjectEditorShellProps = {
  accountControl?: ReactNode;
  aiGenerationAction?: AiGenerationAction;
  autosaveAction?: ProjectEditorAutosaveAction;
  autosaveDelayMs?: number;
  initialAiGenerationState?: AiGenerationActionState;
  initialState: ProjectEditorSaveState;
  initialTheme?: ProjectTheme | null;
  initialThemeState?: ProjectThemeActionState;
  initialVersions?: ProjectVersion[];
  project: ContentProject;
  restoreVersionAction?: ProjectEditorRestoreAction;
  saveAction: (state: ProjectEditorSaveState, formData: FormData) => Promise<ProjectEditorSaveState>;
  themeAction?: ProjectThemeAction;
};

type EditableField = keyof Extract<CanvasElement, { type: "text" }> | keyof Extract<CanvasElement, { type: "cta" }>;

const canvasPreviewSize = 560;

const fallbackAiGenerationAction: AiGenerationAction = async () => initialAiGenerationActionState;
const fallbackAutosaveAction: ProjectEditorAutosaveAction = async () => initialProjectEditorSaveState;
const fallbackRestoreVersionAction: ProjectEditorRestoreAction = async () => initialProjectEditorRestoreState;
const fallbackThemeAction: ProjectThemeAction = async () => initialProjectThemeActionState;

export function ProjectEditorShell({
  accountControl,
  aiGenerationAction = fallbackAiGenerationAction,
  autosaveAction = fallbackAutosaveAction,
  autosaveDelayMs = 1200,
  initialAiGenerationState = initialAiGenerationActionState,
  initialState,
  initialTheme = null,
  initialThemeState = initialProjectThemeActionState,
  initialVersions = [],
  project,
  restoreVersionAction = fallbackRestoreVersionAction,
  saveAction,
  themeAction = fallbackThemeAction
}: ProjectEditorShellProps) {
  const [state, formAction, pending] = useActionState(saveAction, initialState);
  const [restoreState, restoreFormAction, restorePending] = useActionState(
    restoreVersionAction,
    initialProjectEditorRestoreState
  );
  const initialDocument = useMemo(() => normalizeEditorCanvas(project.canvasJson), [project.canvasJson]);
  const [document, setDocument] = useState<CanvasDocument>(initialDocument);
  const [activeTheme, setActiveTheme] = useState<ProjectTheme | null>(initialTheme);
  const [autosaveState, setAutosaveState] = useState<ProjectEditorSaveState>(initialProjectEditorSaveState);
  const [versionHistory, setVersionHistory] = useState<ProjectVersion[]>(initialVersions);
  const [, startAutosaveTransition] = useTransition();
  const documentJson = useMemo(() => JSON.stringify(document), [document]);
  const lastAutosavedJsonRef = useRef(JSON.stringify(initialDocument));
  const processedRestoreIdRef = useRef<string | null>(null);
  const sortedSlides = useMemo(
    () => [...document.slides].sort((first, second) => first.order - second.order),
    [document.slides]
  );
  const [activeSlideId, setActiveSlideId] = useState(sortedSlides[0]?.id ?? "");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const activeSlide = sortedSlides.find((slide) => slide.id === activeSlideId) ?? sortedSlides[0];
  const selectedElement = activeSlide?.elements.find((element) => element.id === selectedElementId) ?? null;

  const upsertVersion = useCallback((version: ProjectVersion) => {
    setVersionHistory((currentVersions) => [
      version,
      ...currentVersions.filter((currentVersion) => currentVersion.id !== version.id)
    ].slice(0, 8));
  }, []);
  const displayedVersions = useMemo(
    () => {
      const priorityVersions = [restoreState.version, state.version].filter(
        (version): version is ProjectVersion => Boolean(version)
      );
      const priorityVersionIds = new Set(priorityVersions.map((version) => version.id));

      return [
        ...priorityVersions,
        ...versionHistory.filter((version) => !priorityVersionIds.has(version.id))
      ].slice(0, 8);
    },
    [restoreState.version, state.version, versionHistory]
  );

  useEffect(() => {
    if (autosaveAction === fallbackAutosaveAction || documentJson === lastAutosavedJsonRef.current) {
      return;
    }

    const autosaveTimer = window.setTimeout(() => {
      const formData = new FormData();

      formData.set("projectId", project.id);
      formData.set("canvasJson", documentJson);
      setAutosaveState({
        message: "Autosaving...",
        status: "pending"
      });
      startAutosaveTransition(() => {
        void autosaveAction(initialProjectEditorSaveState, formData).then((result) => {
          setAutosaveState(result);

          if (result.status === "saved") {
            lastAutosavedJsonRef.current = documentJson;
          }

          if (result.version) {
            upsertVersion(result.version);
          }
        });
      });
    }, autosaveDelayMs);

    return () => window.clearTimeout(autosaveTimer);
  }, [autosaveAction, autosaveDelayMs, documentJson, project.id, upsertVersion]);

  useEffect(() => {
    const restoreId = restoreState.version?.id ?? restoreState.restoredVersionId;

    if (
      restoreState.status !== "saved" ||
      !restoreState.canvasJson ||
      !restoreId ||
      restoreId === processedRestoreIdRef.current
    ) {
      return;
    }

    const restoredDocument = normalizeEditorCanvas(restoreState.canvasJson);
    const restoredSlides = [...restoredDocument.slides].sort((first, second) => first.order - second.order);

    processedRestoreIdRef.current = restoreId;
    setDocument(restoredDocument);
    setActiveSlideId(restoredSlides[0]?.id ?? "");
    setSelectedElementId(null);
    lastAutosavedJsonRef.current = JSON.stringify(restoredDocument);
    setAutosaveState({
      message: restoreState.message ?? "Version restored.",
      status: "saved"
    });

  }, [restoreState]);

  function nextElementId(type: CanvasElement["type"]) {
    const randomId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);

    return `${type}_${randomId}`;
  }

  function addElement(type: "cta" | "shape" | "text") {
    if (!activeSlide) {
      return;
    }

    const element =
      type === "text"
        ? createCanvasTextElement(nextElementId("text"))
        : type === "shape"
          ? createCanvasShapeElement(nextElementId("shape"))
          : createCanvasCtaElement(nextElementId("cta"));
    const nextDocument = addCanvasElementToSlide(document, activeSlide.id, element);

    setDocument(nextDocument);
    setSelectedElementId(element.id);
  }

  function updateSelectedElement(changes: Partial<CanvasElement>) {
    if (!activeSlide || !selectedElement) {
      return;
    }

    setDocument(updateCanvasElement(document, activeSlide.id, selectedElement.id, changes));
  }

  function deleteSelectedElement() {
    if (!activeSlide || !selectedElement) {
      return;
    }

    setDocument(removeCanvasElement(document, activeSlide.id, selectedElement.id));
    setSelectedElementId(null);
  }

  function updateActiveSlideBackground(color: string) {
    if (!activeSlide) {
      return;
    }

    setDocument({
      ...document,
      slides: document.slides.map((slide) =>
        slide.id === activeSlide.id
          ? {
              ...slide,
              background: {
                ...slide.background,
                color
              }
            }
          : slide
      )
    });
  }

  function applyThemeToDocument(theme: ProjectTheme) {
    setActiveTheme(theme);
    setDocument(applyProjectThemeToCanvas(document, theme));
    setSelectedElementId(null);
  }

  function applyGeneratedDocument(generatedDocument: CanvasDocument) {
    setDocument(normalizeEditorCanvas(generatedDocument));
    setSelectedElementId(null);
  }

  return (
    <main className="min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      <header className="flex min-h-16 items-center justify-between border-b border-[#263244] bg-[#0B0F19] px-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            aria-label="Back to projects"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#263244] text-[#CBD5E1] hover:border-[#00E5FF] hover:text-[#F8FAFC]"
            href="/projects"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-[#F8FAFC]">{project.title}</h1>
            <p className="truncate text-sm text-[#94A3B8]">{project.brandName}</p>
          </div>
        </div>

        <form action={formAction} className="flex items-center gap-3">
          <input name="projectId" type="hidden" value={project.id} />
          <input
            data-testid="project-editor-canvas-json"
            name="canvasJson"
            type="hidden"
            value={documentJson}
          />
          <AutosaveStatus state={autosaveState} />
          {state.message ? (
            <span
              className={[
                "hidden rounded-full border px-3 py-1 text-sm md:inline-flex",
                state.status === "saved"
                  ? "border-[#22C55E] text-[#22C55E]"
                  : "border-[#EF4444] text-[#EF4444]"
              ].join(" ")}
            >
              {state.message}
            </span>
          ) : null}
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#00E5FF] px-4 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            {pending ? "Saving..." : "Save Project"}
          </button>
          {accountControl ? <div className="hidden md:block">{accountControl}</div> : null}
        </form>
      </header>

      <section className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[15rem_1fr_21rem]">
        <aside className="border-b border-[#263244] bg-[#0B0F19] p-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#CBD5E1]">
            <BoxSelect aria-hidden="true" className="h-4 w-4 text-[#00E5FF]" />
            Slides
          </div>
          <div className="mt-4 grid gap-3">
            {sortedSlides.map((slide) => (
              <button
                key={slide.id}
                className={[
                  "rounded-lg border p-3 text-left transition",
                  slide.id === activeSlide?.id
                    ? "border-[#00E5FF] bg-[#141A26]"
                    : "border-[#263244] bg-[#0B0F19] hover:border-[#00E5FF]"
                ].join(" ")}
                onClick={() => {
                  setActiveSlideId(slide.id);
                  setSelectedElementId(null);
                }}
                type="button"
              >
                <div className="aspect-square rounded-md border border-[#263244] bg-[#141A26] p-2">
                  <div
                    className="h-full rounded border border-[#263244]"
                    style={{
                      backgroundColor: slide.background.color
                    }}
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-[#F8FAFC]">{slide.name}</p>
                <p className="text-xs text-[#94A3B8]">{slide.elements.length} objects</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 bg-[#0B0F19]">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#263244] bg-[#141A26] px-4 py-3">
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#263244] px-3 py-2 text-sm font-semibold text-[#F8FAFC] hover:border-[#00E5FF]"
              onClick={() => addElement("text")}
              type="button"
            >
              <Type aria-hidden="true" className="h-4 w-4" />
              Add Text
            </button>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#263244] px-3 py-2 text-sm font-semibold text-[#F8FAFC] hover:border-[#00E5FF]"
              onClick={() => addElement("shape")}
              type="button"
            >
              <Square aria-hidden="true" className="h-4 w-4" />
              Add Shape
            </button>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#263244] px-3 py-2 text-sm font-semibold text-[#F8FAFC] hover:border-[#00E5FF]"
              onClick={() => addElement("cta")}
              type="button"
            >
              <Badge aria-hidden="true" className="h-4 w-4" />
              Add CTA
            </button>
          </div>

          <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-auto p-6">
            {activeSlide ? (
              <SlideCanvas
                activeElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                slide={activeSlide}
              />
            ) : null}
          </div>
        </section>

        <aside className="grid content-start gap-4 border-t border-[#263244] bg-[#141A26] p-4 lg:border-l lg:border-t-0">
          <ThemeEnginePanel
            initialState={initialThemeState}
            initialTheme={activeTheme}
            onApplyTheme={applyThemeToDocument}
            onThemeGenerated={setActiveTheme}
            projectId={project.id}
            themeAction={themeAction}
          />
          <AiGenerationPanel
            generationAction={aiGenerationAction}
            hasTheme={Boolean(activeTheme)}
            initialState={initialAiGenerationState}
            onGenerated={applyGeneratedDocument}
            projectId={project.id}
          />
          <ExportPanel document={document} projectTitle={project.title} />
          <VersionHistoryPanel
            projectId={project.id}
            restoreFormAction={restoreFormAction}
            restorePending={restorePending}
            versions={displayedVersions}
          />

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#CBD5E1]">
              <MousePointer2 aria-hidden="true" className="h-4 w-4 text-[#00E5FF]" />
              Properties
            </div>

            {selectedElement ? (
              <div className="mt-4 grid gap-4">
                <ElementProperties
                  element={selectedElement}
                  onDelete={deleteSelectedElement}
                  onUpdate={updateSelectedElement}
                />
              </div>
            ) : activeSlide ? (
              <div className="mt-4 grid gap-4">
                <SlideProperties
                  backgroundColor={activeSlide.background.color}
                  onChangeBackground={updateActiveSlideBackground}
                />
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-[#263244] bg-[#0B0F19] p-4 text-sm text-[#94A3B8]">
                No object selected
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

function AutosaveStatus({ state }: { state: ProjectEditorSaveState }) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <span
      className={[
        "hidden rounded-full border px-3 py-1 text-sm md:inline-flex",
        state.status === "error"
          ? "border-[#EF4444] text-[#EF4444]"
          : state.status === "pending"
            ? "border-[#F59E0B] text-[#F59E0B]"
            : "border-[#22C55E] text-[#22C55E]"
      ].join(" ")}
    >
      {state.message}
    </span>
  );
}

function VersionHistoryPanel({
  projectId,
  restoreFormAction,
  restorePending,
  versions
}: {
  projectId: string;
  restoreFormAction: (formData: FormData) => void;
  restorePending: boolean;
  versions: ProjectVersion[];
}) {
  return (
    <section className="rounded-lg border border-[#263244] bg-[#0B0F19] p-4" aria-label="Version History">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#F8FAFC]">
        <History aria-hidden="true" className="h-4 w-4 text-[#00E5FF]" />
        <h2>Version History</h2>
      </div>

      {versions.length > 0 ? (
        <ol className="mt-4 grid gap-2">
          {versions.map((version) => (
            <li
              className="rounded-lg border border-[#263244] bg-[#141A26] px-3 py-2"
              key={version.id}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#F8FAFC]">Version {version.versionNumber}</span>
                <span className="text-xs text-[#00E5FF]">{sourceLabel(version.source)}</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-[#94A3B8]">
                <Clock3 aria-hidden="true" className="h-3 w-3" />
                {formatVersionTime(version.createdAt)}
              </div>
              <form action={restoreFormAction} className="mt-3">
                <input name="projectId" type="hidden" value={projectId} />
                <input name="versionId" type="hidden" value={version.id} />
                <button
                  className="inline-flex min-h-8 w-full items-center justify-center rounded-lg border border-[#263244] px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:border-[#00E5FF] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={restorePending}
                  type="submit"
                >
                  Restore Version {version.versionNumber}
                </button>
              </form>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 rounded-lg border border-[#263244] bg-[#141A26] p-3 text-sm text-[#CBD5E1]">
          Versions appear after autosave.
        </p>
      )}
    </section>
  );
}

function sourceLabel(source: ProjectVersionSource): string {
  return source === "autosave" ? "Autosave" : source === "manual-save" ? "Manual save" : "Version restore";
}

function formatVersionTime(value: Date): string {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function SlideCanvas({
  activeElementId,
  onSelectElement,
  slide
}: {
  activeElementId: string | null;
  onSelectElement: (elementId: string) => void;
  slide: CanvasSlide;
}) {
  const paintOrder = getCanvasElementsInPaintOrder(slide);

  return (
    <div
      aria-label={`${slide.name} canvas`}
      className="relative shrink-0 overflow-hidden rounded-lg border border-[#263244]"
      style={{
        backgroundColor: slide.background.color,
        height: canvasPreviewSize,
        width: canvasPreviewSize
      }}
    >
      {paintOrder.map((element) => (
        <CanvasElementButton
          key={element.id}
          active={element.id === activeElementId}
          element={element}
          onSelect={() => onSelectElement(element.id)}
          slide={slide}
        />
      ))}
    </div>
  );
}

function CanvasElementButton({
  active,
  element,
  onSelect,
  slide
}: {
  active: boolean;
  element: CanvasElement;
  onSelect: () => void;
  slide: CanvasSlide;
}) {
  const baseStyle = {
    height: `${(element.height / slide.height) * 100}%`,
    left: `${(element.x / slide.width) * 100}%`,
    opacity: element.opacity,
    top: `${(element.y / slide.height) * 100}%`,
    transform: `rotate(${element.rotation}deg)`,
    width: `${(element.width / slide.width) * 100}%`,
    zIndex: element.zIndex
  };
  const canvasLayerClass = "border-0 appearance-none outline-none focus:outline-none focus-visible:outline-none";
  const activeClass = active ? "shadow-[0_0_0_1px_rgba(203,213,225,0.18)]" : "shadow-none";

  if (element.type === "shape") {
    return (
      <button
        aria-label={`${element.shape} shape`}
        className={`absolute ${canvasLayerClass} ${activeClass}`}
        onClick={onSelect}
        style={{
          ...baseStyle,
          backgroundColor: element.fill,
          ...(element.stroke
            ? {
                border: `${element.strokeWidth}px solid ${element.stroke}`
              }
            : {
                borderStyle: "none",
                borderWidth: 0
              }),
          borderRadius: element.borderRadius
        }}
        type="button"
      />
    );
  }

  if (element.type === "cta") {
    return (
      <button
        className={`absolute flex items-center justify-center overflow-hidden break-words px-3 text-center font-semibold leading-tight ${canvasLayerClass} ${activeClass}`}
        onClick={onSelect}
        style={{
          ...baseStyle,
          backgroundColor: element.backgroundColor,
          borderStyle: "none",
          borderWidth: 0,
          borderRadius: element.borderRadius,
          color: element.textColor,
          fontFamily: element.fontFamily,
          fontSize: `${Math.max(10, element.fontSize * (canvasPreviewSize / slide.width))}px`
        }}
        type="button"
      >
        {element.label}
      </button>
    );
  }

  if (element.type === "text") {
    return (
      <button
        className={`absolute overflow-hidden bg-transparent text-left ${canvasLayerClass} ${activeClass}`}
        onClick={onSelect}
        style={{
          ...baseStyle,
          borderStyle: "none",
          borderWidth: 0,
          color: element.color,
          fontFamily: element.fontFamily,
          fontSize: `${Math.max(10, element.fontSize * (canvasPreviewSize / slide.width))}px`,
          fontWeight: fontWeightValue(element.fontWeight),
          letterSpacing: element.letterSpacing,
          lineHeight: element.lineHeight,
          textAlign: element.textAlign
        }}
        type="button"
      >
        {element.content}
      </button>
    );
  }

  return (
    <button
      aria-label={element.type}
      className={`absolute border border-[#00E5FF] ${activeClass}`}
      onClick={onSelect}
      style={baseStyle}
      type="button"
    />
  );
}

function SlideProperties({
  backgroundColor,
  onChangeBackground
}: {
  backgroundColor: string;
  onChangeBackground: (color: string) => void;
}) {
  return (
    <>
      <div className="rounded-lg border border-[#263244] bg-[#0B0F19] p-4">
        <p className="text-sm font-semibold text-[#F8FAFC]">Slide</p>
        <p className="mt-1 text-xs text-[#94A3B8]">Canvas background</p>
      </div>
      <ColorField label="Canvas Background" value={backgroundColor} onChange={onChangeBackground} />
    </>
  );
}

function ElementProperties({
  element,
  onDelete,
  onUpdate
}: {
  element: CanvasElement;
  onDelete: () => void;
  onUpdate: (changes: Partial<CanvasElement>) => void;
}) {
  return (
    <>
      <div className="rounded-lg border border-[#263244] bg-[#0B0F19] p-4">
        <p className="text-sm font-semibold capitalize text-[#F8FAFC]">{element.type}</p>
        <p className="mt-1 truncate text-xs text-[#94A3B8]">{element.id}</p>
      </div>

      {element.type === "text" ? (
        <TextField label="Text" name="content" value={element.content} onChange={(content) => onUpdate({ content })} />
      ) : null}

      {element.type === "cta" ? (
        <TextField label="Label" name="label" value={element.label} onChange={(label) => onUpdate({ label })} />
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <NumberField label="X" value={element.x} onChange={(x) => onUpdate({ x })} />
        <NumberField label="Y" value={element.y} onChange={(y) => onUpdate({ y })} />
        <NumberField label="Width" value={element.width} onChange={(width) => onUpdate({ width })} />
        <NumberField label="Height" value={element.height} onChange={(height) => onUpdate({ height })} />
        <NumberField label="Layer" value={element.zIndex} onChange={(zIndex) => onUpdate({ zIndex })} />
      </div>

      {element.type === "text" ? (
        <>
          <NumberField label="Font Size" value={element.fontSize} onChange={(fontSize) => onUpdate({ fontSize })} />
          <ColorField label="Color" value={element.color} onChange={(color) => onUpdate({ color })} />
        </>
      ) : null}

      {element.type === "shape" ? (
        <ColorField label="Fill" value={element.fill} onChange={(fill) => onUpdate({ fill })} />
      ) : null}

      {element.type === "cta" ? (
        <>
          <ColorField
            label="Background"
            value={element.backgroundColor}
            onChange={(backgroundColor) => onUpdate({ backgroundColor })}
          />
          <ColorField label="Text Color" value={element.textColor} onChange={(textColor) => onUpdate({ textColor })} />
        </>
      ) : null}

      <button
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#EF4444] px-3 py-2 text-sm font-semibold text-[#EF4444] hover:bg-[#0B0F19]"
        onClick={onDelete}
        type="button"
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        Delete
      </button>
    </>
  );
}

function TextField({
  label,
  name,
  onChange,
  value
}: {
  label: string;
  name: EditableField;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#F8FAFC]">{label}</span>
      <textarea
        className="mt-2 min-h-24 w-full resize-y rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function NumberField({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#F8FAFC]">{label}</span>
      <input
        className="mt-2 min-h-10 w-full rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

function ColorField({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#F8FAFC]">{label}</span>
      <div className="mt-2 flex min-h-10 items-center gap-2 rounded-lg border border-[#263244] bg-[#0B0F19] p-2 focus-within:border-[#00E5FF]">
        <input
          aria-label={`${label} swatch`}
          className="h-7 w-9 shrink-0 cursor-pointer rounded border border-[#263244] bg-transparent"
          onChange={(event) => onChange(event.target.value)}
          type="color"
          value={value}
        />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-[#F8FAFC] outline-none"
          onChange={(event) => onChange(event.target.value)}
          type="text"
          value={value}
        />
      </div>
    </label>
  );
}

function fontWeightValue(weight: Extract<CanvasElement, { type: "text" }>["fontWeight"]) {
  return weight === "regular" ? 400 : weight === "medium" ? 500 : weight === "semibold" ? 600 : 700;
}

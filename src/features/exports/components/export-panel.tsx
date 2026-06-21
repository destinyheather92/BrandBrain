"use client";

import { ChevronDown, ChevronRight, Download, FileImage, FileText } from "lucide-react";
import { useState } from "react";

import type { CanvasDocument } from "@/features/canvas/types/canvas";

import { downloadCanvasDocument } from "../services/browser-canvas-export.service";
import type { CanvasExportFormat, CanvasExportRequest } from "../types/canvas-export";

type ExportPanelProps = {
  document: CanvasDocument;
  exportDocument?: (request: CanvasExportRequest) => Promise<void>;
  projectTitle: string;
};

const exportOptions = [
  {
    format: "png",
    icon: FileImage,
    label: "PNG"
  },
  {
    format: "jpg",
    icon: FileImage,
    label: "JPG"
  },
  {
    format: "pdf",
    icon: FileText,
    label: "PDF"
  }
] satisfies Array<{
  format: CanvasExportFormat;
  icon: typeof FileImage;
  label: string;
}>;

export function ExportPanel({
  document,
  exportDocument = downloadCanvasDocument,
  projectTitle
}: ExportPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingFormat, setPendingFormat] = useState<CanvasExportFormat | null>(null);
  const DisclosureIcon = expanded ? ChevronDown : ChevronRight;

  async function handleExport(format: CanvasExportFormat) {
    setPendingFormat(format);
    setMessage(null);

    try {
      await exportDocument({
        document,
        format,
        projectTitle
      });
      setMessage(`${format.toUpperCase()} export started.`);
    } catch (error) {
      console.error("Export failed.", error);
      setMessage(`${format.toUpperCase()} export could not be created.`);
    } finally {
      setPendingFormat(null);
    }
  }

  return (
    <section className="rounded-lg border border-[#263244] bg-[#0B0F19] p-3" aria-label="Export">
      <button
        aria-expanded={expanded}
        aria-label="Export"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#F8FAFC]">
          <Download aria-hidden="true" className="h-4 w-4 text-[#00E5FF]" />
          <span>Export</span>
        </span>
        <DisclosureIcon aria-hidden="true" className="h-4 w-4 text-[#94A3B8]" />
      </button>

      {expanded ? (
        <>
          <p className="mt-3 text-sm leading-6 text-[#CBD5E1]">
            Download the current canvas as image slides or a PDF deck.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {exportOptions.map(({ format, icon: Icon, label }) => (
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#263244] px-3 py-2 text-sm font-semibold text-[#F8FAFC] hover:border-[#00E5FF] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={pendingFormat !== null}
                key={format}
                onClick={() => void handleExport(format)}
                type="button"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {pendingFormat === format ? "Exporting..." : `Export ${label}`}
              </button>
            ))}
          </div>

          {message ? (
            <p
              aria-live="polite"
              className="mt-3 rounded-lg border border-[#263244] bg-[#141A26] p-3 text-sm text-[#CBD5E1]"
            >
              {message}
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

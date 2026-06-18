import { FileJson, Layers, SquareDashedMousePointer } from "lucide-react";

import { getCanvasElementsInPaintOrder } from "../services/canvas-object-model.service";
import type { CanvasDocument } from "../types/canvas";

type CanvasModelPreviewProps = {
  document: CanvasDocument;
};

export function CanvasModelPreview({ document }: CanvasModelPreviewProps) {
  const slides = [...document.slides].sort((first, second) => first.order - second.order);

  return (
    <section className="grid min-h-screen gap-6 bg-[#0B0F19] p-5 text-[#F8FAFC] lg:grid-cols-[20rem_1fr] lg:p-8">
      <aside className="rounded-lg border border-[#263244] bg-[#141A26] p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#263244] bg-[#1C2433] p-2 text-[#00E5FF]">
            <SquareDashedMousePointer aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-[#94A3B8]">{document.schemaVersion}</p>
            <h1 className="text-2xl font-semibold text-[#F8FAFC]">Canvas Object Model</h1>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div>
            <p className="text-[#94A3B8]">Document</p>
            <p className="mt-1 font-medium text-[#F8FAFC]">{document.title}</p>
          </div>
          <div>
            <p className="text-[#94A3B8]">Format</p>
            <p className="mt-1 font-medium text-[#F8FAFC]">{document.format}</p>
          </div>
          <div>
            <p className="text-[#94A3B8]">Size</p>
            <p className="mt-1 font-medium text-[#F8FAFC]">
              {document.width} x {document.height} {document.unit}
            </p>
          </div>
          <div>
            <p className="text-[#94A3B8]">Slides</p>
            <p className="mt-1 font-medium text-[#F8FAFC]">{document.slides.length} slides</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        <section className="rounded-lg border border-[#263244] bg-[#141A26] p-5" aria-label="Slide model preview">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#263244] bg-[#1C2433] p-2 text-[#00E5FF]">
              <Layers aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#F8FAFC]">Slides</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {slides.map((slide) => {
              const paintOrder = getCanvasElementsInPaintOrder(slide);

              return (
                <article key={slide.id} className="rounded-lg border border-[#263244] bg-[#0B0F19] p-4">
                  <div className="aspect-square rounded-md border border-[#263244] bg-[#0B0F19] p-4">
                    <div className="flex h-full items-center justify-center rounded-md border border-dashed border-[#263244] text-sm text-[#94A3B8]">
                      {slide.name}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="font-medium text-[#F8FAFC]">{slide.name}</p>
                    <p className="text-sm text-[#00E5FF]">{paintOrder.length} elements</p>
                  </div>
                  <p className="mt-1 text-sm text-[#94A3B8]">{slide.id}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-[#263244] bg-[#141A26] p-5" aria-label="Canvas JSON source">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#263244] bg-[#1C2433] p-2 text-[#00E5FF]">
              <FileJson aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#F8FAFC]">Canvas JSON</h2>
          </div>

          <pre className="mt-5 max-h-[26rem] overflow-auto rounded-lg border border-[#263244] bg-[#0B0F19] p-4 text-xs leading-5 text-[#CBD5E1]">
            {JSON.stringify(document, null, 2)}
          </pre>
        </section>
      </div>
    </section>
  );
}

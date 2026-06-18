import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { CanvasModelPreview } from "@/features/canvas/components/canvas-model-preview";
import { createBlankCanvasDocument } from "@/features/canvas/services/canvas-object-model.service";

export default async function CanvasPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const document = createBlankCanvasDocument({
    slideCount: 3,
    title: "BrandBrain Canvas Starter"
  });

  return <CanvasModelPreview document={document} />;
}

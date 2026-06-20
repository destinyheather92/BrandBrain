import { contentTemplateSchema } from "../schemas/template.schema";
import type { ContentTemplate } from "../types/template";

const templates = [
  {
    category: "Education",
    description: "A clear myth, truth, proof, and action sequence for correcting common customer beliefs.",
    id: "myth-buster-carousel",
    name: "Myth Buster Carousel",
    recommendedUse: "Use when your audience believes something that keeps them from taking action.",
    canvasJson: {
      documentId: "template_myth_buster",
      format: "instagram-carousel",
      height: 1080,
      schemaVersion: "1.0.0",
      slides: [
        {
          background: {
            color: "#FFFFFF",
            type: "solid"
          },
          elements: [
            {
              color: "#0B0F19",
              content: "The myth costing customers time",
              fontFamily: "Geist",
              fontSize: 82,
              fontWeight: "bold",
              height: 220,
              id: "myth_headline",
              letterSpacing: 0,
              lineHeight: 1.05,
              locked: false,
              opacity: 1,
              rotation: 0,
              textAlign: "left",
              type: "text",
              width: 760,
              x: 96,
              y: 150,
              zIndex: 2
            },
            {
              borderRadius: 36,
              fill: "#F1F5F9",
              height: 440,
              id: "myth_panel",
              locked: false,
              opacity: 1,
              rotation: 0,
              shape: "rectangle",
              stroke: null,
              strokeWidth: 0,
              type: "shape",
              width: 760,
              x: 96,
              y: 460,
              zIndex: 1
            },
            {
              backgroundColor: "#00E5FF",
              borderRadius: 18,
              fontFamily: "Geist",
              fontSize: 30,
              height: 86,
              id: "myth_cta",
              label: "See the truth",
              locked: false,
              opacity: 1,
              rotation: 0,
              textColor: "#0B0F19",
              type: "cta",
              width: 320,
              x: 128,
              y: 760,
              zIndex: 3
            }
          ],
          height: 1080,
          id: "myth_slide_1",
          name: "Hook",
          order: 1,
          width: 1080
        },
        {
          background: {
            color: "#0B0F19",
            type: "solid"
          },
          elements: [
            {
              color: "#F8FAFC",
              content: "What people usually hear",
              fontFamily: "Geist",
              fontSize: 72,
              fontWeight: "bold",
              height: 190,
              id: "myth_context_headline",
              letterSpacing: 0,
              lineHeight: 1.08,
              locked: false,
              opacity: 1,
              rotation: 0,
              textAlign: "left",
              type: "text",
              width: 790,
              x: 96,
              y: 150,
              zIndex: 2
            },
            {
              color: "#CBD5E1",
              content: "Name the outdated advice, assumption, or shortcut that creates confusion.",
              fontFamily: "Geist",
              fontSize: 40,
              fontWeight: "regular",
              height: 210,
              id: "myth_context_body",
              letterSpacing: 0,
              lineHeight: 1.25,
              locked: false,
              opacity: 1,
              rotation: 0,
              textAlign: "left",
              type: "text",
              width: 780,
              x: 96,
              y: 420,
              zIndex: 2
            }
          ],
          height: 1080,
          id: "myth_slide_2",
          name: "Context",
          order: 2,
          width: 1080
        },
        {
          background: {
            color: "#FFFFFF",
            type: "solid"
          },
          elements: [
            {
              color: "#0B0F19",
              content: "What is actually true",
              fontFamily: "Geist",
              fontSize: 76,
              fontWeight: "bold",
              height: 190,
              id: "myth_truth_headline",
              letterSpacing: 0,
              lineHeight: 1.08,
              locked: false,
              opacity: 1,
              rotation: 0,
              textAlign: "left",
              type: "text",
              width: 790,
              x: 96,
              y: 150,
              zIndex: 2
            },
            {
              borderRadius: 32,
              fill: "#E0F7FA",
              height: 300,
              id: "myth_truth_panel",
              locked: false,
              opacity: 1,
              rotation: 0,
              shape: "rectangle",
              stroke: null,
              strokeWidth: 0,
              type: "shape",
              width: 820,
              x: 96,
              y: 450,
              zIndex: 1
            }
          ],
          height: 1080,
          id: "myth_slide_3",
          name: "Truth",
          order: 3,
          width: 1080
        }
      ],
      themeId: null,
      title: "Myth Buster Carousel",
      unit: "px",
      width: 1080
    }
  },
  {
    category: "Conversion",
    description: "A practical checklist layout for turning one problem into a sequence of concrete actions.",
    id: "checklist-carousel",
    name: "Action Checklist",
    recommendedUse: "Use for how-to posts, readiness checklists, and service prep content.",
    canvasJson: {
      documentId: "template_checklist",
      format: "instagram-carousel",
      height: 1080,
      schemaVersion: "1.0.0",
      slides: [
        {
          background: {
            color: "#FFFFFF",
            type: "solid"
          },
          elements: [
            {
              borderRadius: 36,
              fill: "#141A26",
              height: 740,
              id: "checklist_panel",
              locked: false,
              opacity: 1,
              rotation: 0,
              shape: "rectangle",
              stroke: null,
              strokeWidth: 0,
              type: "shape",
              width: 760,
              x: 96,
              y: 170,
              zIndex: 1
            },
            {
              color: "#F8FAFC",
              content: "What to handle first",
              fontFamily: "Geist",
              fontSize: 76,
              fontWeight: "bold",
              height: 180,
              id: "checklist_headline",
              letterSpacing: 0,
              lineHeight: 1.08,
              locked: false,
              opacity: 1,
              rotation: 0,
              textAlign: "left",
              type: "text",
              width: 700,
              x: 145,
              y: 240,
              zIndex: 2
            },
            {
              backgroundColor: "#00E5FF",
              borderRadius: 18,
              fontFamily: "Geist",
              fontSize: 30,
              height: 86,
              id: "checklist_cta",
              label: "Start here",
              locked: false,
              opacity: 1,
              rotation: 0,
              textColor: "#0B0F19",
              type: "cta",
              width: 300,
              x: 145,
              y: 760,
              zIndex: 3
            }
          ],
          height: 1080,
          id: "checklist_slide_1",
          name: "Opening",
          order: 1,
          width: 1080
        },
        {
          background: {
            color: "#F8FAFC",
            type: "solid"
          },
          elements: [
            {
              color: "#0B0F19",
              content: "Step 1: Make the decision obvious",
              fontFamily: "Geist",
              fontSize: 68,
              fontWeight: "bold",
              height: 190,
              id: "checklist_step_1",
              letterSpacing: 0,
              lineHeight: 1.1,
              locked: false,
              opacity: 1,
              rotation: 0,
              textAlign: "left",
              type: "text",
              width: 780,
              x: 96,
              y: 170,
              zIndex: 2
            },
            {
              color: "#334155",
              content: "Give the audience one concrete action instead of several competing options.",
              fontFamily: "Geist",
              fontSize: 40,
              fontWeight: "regular",
              height: 230,
              id: "checklist_step_1_body",
              letterSpacing: 0,
              lineHeight: 1.25,
              locked: false,
              opacity: 1,
              rotation: 0,
              textAlign: "left",
              type: "text",
              width: 760,
              x: 96,
              y: 440,
              zIndex: 2
            }
          ],
          height: 1080,
          id: "checklist_slide_2",
          name: "Step 1",
          order: 2,
          width: 1080
        },
        {
          background: {
            color: "#0B0F19",
            type: "solid"
          },
          elements: [
            {
              color: "#F8FAFC",
              content: "Step 2: Show the next move",
              fontFamily: "Geist",
              fontSize: 68,
              fontWeight: "bold",
              height: 190,
              id: "checklist_step_2",
              letterSpacing: 0,
              lineHeight: 1.1,
              locked: false,
              opacity: 1,
              rotation: 0,
              textAlign: "left",
              type: "text",
              width: 780,
              x: 96,
              y: 170,
              zIndex: 2
            },
            {
              backgroundColor: "#00E5FF",
              borderRadius: 18,
              fontFamily: "Geist",
              fontSize: 30,
              height: 86,
              id: "checklist_final_cta",
              label: "Take action",
              locked: false,
              opacity: 1,
              rotation: 0,
              textColor: "#0B0F19",
              type: "cta",
              width: 300,
              x: 96,
              y: 760,
              zIndex: 3
            }
          ],
          height: 1080,
          id: "checklist_slide_3",
          name: "Step 2",
          order: 3,
          width: 1080
        }
      ],
      themeId: null,
      title: "Action Checklist",
      unit: "px",
      width: 1080
    }
  }
] satisfies ContentTemplate[];

export const contentTemplates = templates.map((template) => contentTemplateSchema.parse(template));

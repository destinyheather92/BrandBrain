export type CreativeBrief = {
  angle: string;
  audience: string;
  cta: string;
  goal: string;
  hook: string;
};

export type CreativeBriefResult =
  | {
      brief: CreativeBrief;
      ok: true;
      status: "generated";
    }
  | {
      error: {
        code:
          | "brand_not_found"
          | "creative_brief_failed"
          | "invalid_creative_brief"
          | "project_not_found";
        message: string;
      };
      ok: false;
      status: "failed";
    };

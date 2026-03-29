/**
 * JSON Schema for StressTestReport.
 * Used in the report generation prompt to instruct the model.
 */
export const STRESS_TEST_REPORT_SCHEMA = {
  type: "object",
  properties: {
    originalOpinion: {
      type: "string",
      description: "The user's original opinion, quoted verbatim",
    },
    buildSummary: {
      type: "string",
      description:
        "Analytical summary of the strongest arguments constructed in the build phase (NOT a transcript recap)",
    },
    demolishSummary: {
      type: "string",
      description:
        "Analytical summary of the most devastating attacks in the demolish phase (NOT a transcript recap)",
    },
    survivalAssessment: {
      type: "array",
      items: {
        type: "object",
        properties: {
          argument: {
            type: "string",
            description: "A specific argument from the build phase",
          },
          survived: {
            type: "boolean",
            description: "Whether this argument withstood the attacks",
          },
          explanation: {
            type: "string",
            description:
              "Why it survived or was destroyed — specific reasoning, not generic",
          },
        },
        required: ["argument", "survived", "explanation"],
      },
      description: "Assessment of each major argument's survival status",
    },
    blindSpots: {
      type: "array",
      items: { type: "string" },
      description:
        "Perspectives or angles that the user's original opinion completely failed to consider",
    },
    conclusion: {
      type: "string",
      description:
        "Final analytical verdict on the opinion after stress testing",
    },
    overallStrength: {
      type: "string",
      enum: ["strong", "moderate", "weak", "demolished"],
      description:
        "Overall strength rating after the stress test: strong (most arguments survived), moderate (mixed), weak (most destroyed), demolished (comprehensively refuted)",
    },
  },
  required: [
    "originalOpinion",
    "buildSummary",
    "demolishSummary",
    "survivalAssessment",
    "blindSpots",
    "conclusion",
    "overallStrength",
  ],
} as const;

import { z } from "zod";
import { validateD2 } from "../d2.js";

export const validateToolName = "validate";

export const validateToolDescription =
  "Validate D2 diagram source code without rendering. Returns whether the code is valid and any error messages.";

export const validateToolSchema = z.object({
  code: z
    .string()
    .describe("The D2 source code to validate"),
});

export type ValidateToolInput = z.infer<typeof validateToolSchema>;

export async function handleValidate(input: ValidateToolInput) {
  const result = await validateD2(input.code);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

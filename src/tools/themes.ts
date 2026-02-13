import { z } from "zod";

export const listThemesToolName = "list_themes";

export const listThemesToolDescription =
  "List all available D2 diagram themes with their IDs. Use these IDs with the compile tool's themeID parameter.";

export const listThemesToolSchema = z.object({});

// Theme data sourced from https://d2lang.com/tour/themes
const THEMES = [
  { id: 0, name: "Default", category: "regular" },
  { id: 1, name: "Neutral Grey", category: "regular" },
  { id: 3, name: "Flagship Terrastruct", category: "regular" },
  { id: 4, name: "Cool Classics", category: "regular" },
  { id: 5, name: "Mixed Berry Blue", category: "regular" },
  { id: 6, name: "Grape Soda", category: "regular" },
  { id: 7, name: "Aubergine", category: "regular" },
  { id: 8, name: "Colorblind Clear", category: "regular" },
  { id: 100, name: "Terminal", category: "dark" },
  { id: 101, name: "Terminal Grayscale", category: "dark" },
  { id: 102, name: "Terminal Mono", category: "dark" },
  { id: 103, name: "Dark Mauve", category: "dark" },
  { id: 104, name: "Dark Flagship Terrastruct", category: "dark" },
  { id: 200, name: "Origami", category: "special" },
];

export async function handleListThemes() {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            themes: THEMES,
            usage:
              "Pass the theme ID to the compile tool's 'themeID' parameter. Use 'darkThemeID' to set a theme for dark mode rendering.",
          },
          null,
          2
        ),
      },
    ],
  };
}

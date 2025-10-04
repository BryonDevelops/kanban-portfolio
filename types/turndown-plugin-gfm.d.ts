declare module 'turndown-plugin-gfm' {
  import TurndownService from 'turndown'
  export function gfm(service: TurndownService): void
  export const strikethrough: (service: TurndownService) => void
  export const tables: (service: TurndownService) => void
  export const taskListItems: (service: TurndownService) => void
}

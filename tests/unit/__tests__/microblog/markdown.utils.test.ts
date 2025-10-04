import { htmlTablesToMarkdown, tabularTextToMarkdown } from '@/presentation/utils/markdown'

describe('markdown table helpers', () => {
  it('converts HTML tables to GitHub flavoured markdown', () => {
    const html = `
      <table>
        <thead>
          <tr>
            <th>Framework</th>
            <th>Language</th>
            <th>Stars</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Next.js</td>
            <td>TypeScript</td>
            <td>110k</td>
          </tr>
          <tr>
            <td>Remix</td>
            <td>TypeScript</td>
            <td>25k</td>
          </tr>
        </tbody>
      </table>
    `

    expect(htmlTablesToMarkdown(html)).toEqual(
      `| Framework | Language | Stars |\n| --- | --- | --- |\n| Next.js | TypeScript | 110k |\n| Remix | TypeScript | 25k |`
    )
  })

  it('transforms tab separated text into a markdown table', () => {
    const tabSeparated = 'Name\tRole\tTeam\nKai\tPM\tAlpha\nDevon\tEngineer\tPlatform'

    expect(tabularTextToMarkdown(tabSeparated)).toEqual(
      `| Name | Role | Team |\n| --- | --- | --- |\n| Kai | PM | Alpha |\n| Devon | Engineer | Platform |`
    )
  })
})

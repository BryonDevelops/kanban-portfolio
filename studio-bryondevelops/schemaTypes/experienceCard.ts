import {defineType, defineField} from 'sanity'

export const experienceCard = defineType({
  name: 'experienceCard',
  title: 'Experience Card',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'City, State/Country or "Remote"'
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      description: 'Leave empty if this is your current position'
    }),
    defineField({
      name: 'isCurrent',
      title: 'Current Position',
      type: 'boolean',
      description: 'Check if this is your current job',
      initialValue: false
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Describe your responsibilities, achievements, and key learnings',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies Used',
      type: 'array',
      of: [{type: 'string'}],
      description: 'List of technologies, frameworks, and tools used in this role',
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'companyUrl',
      title: 'Company Website',
      type: 'url',
      description: 'Link to the company website (optional)'
    }),
    defineField({
      name: 'featured',
      title: 'Featured Experience',
      type: 'boolean',
      description: 'Highlight this experience on your about page',
      initialValue: false
    })
  ],
  preview: {
    select: {
      title: 'title',
      company: 'company',
      startDate: 'startDate',
      endDate: 'endDate',
      isCurrent: 'isCurrent'
    },
    prepare(selection) {
      const {title, company, startDate, endDate, isCurrent} = selection
      const start = new Date(startDate).getFullYear()
      const end = endDate ? new Date(endDate).getFullYear() : (isCurrent ? 'Present' : '')
      const dateRange = end ? `${start} - ${end}` : `${start} - Present`

      return {
        title: title,
        subtitle: `${company} • ${dateRange}`
      }
    }
  },
  orderings: [
    {
      title: 'Start Date (Newest First)',
      name: 'startDateDesc',
      by: [
        {field: 'startDate', direction: 'desc'}
      ]
    },
    {
      title: 'Start Date (Oldest First)',
      name: 'startDateAsc',
      by: [
        {field: 'startDate', direction: 'asc'}
      ]
    }
  ]
})
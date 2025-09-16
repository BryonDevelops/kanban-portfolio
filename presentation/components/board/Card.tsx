"use client"
import React, { useRef } from 'react'
import { useDrag } from 'react-dnd'
import { Project } from '../../../domain/project'
import { Task } from '../../../domain/task'

type Props = {
  project: Project
  fromCol: string
  index: number
}

export default function Card({ project, fromCol, index }: Props) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { id: project.id, fromCol, fromIndex: index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }), [project.id, fromCol, index])

  const ref = useRef<HTMLDivElement | null>(null)
  // Attach the drag source to the ref object (avoids ref typing issues)
  drag(ref as React.RefObject<HTMLDivElement>)

  return (
    <div ref={ref} className={`rounded-md border border-white/10 bg-white p-3 text-gray-900 shadow transition ${isDragging ? 'opacity-50' : ''}`}>
      <div className="font-medium">{project.title}</div>
      {project.description && <div className="text-sm text-gray-600">{project.description}</div>}
    </div>
  )
}

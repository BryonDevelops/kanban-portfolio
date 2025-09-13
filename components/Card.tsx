import React from 'react'
import { Task } from '../domain/task'

export default function Card({ task }: { task: Task }) {
  return (
    <div className="bg-white p-3 rounded-md shadow hover:shadow-md transition">
      <div className="font-medium">{task.title}</div>
      {task.description && <div className="text-sm text-muted">{task.description}</div>}
    </div>
  )
}

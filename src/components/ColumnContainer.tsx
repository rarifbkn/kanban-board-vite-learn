import { SortableContext, useSortable } from "@dnd-kit/sortable"
import TrashIcon from "../icons/TrashIcon"
import { Column, Id, Task } from "../types/types"
import { CSS } from "@dnd-kit/utilities"
import { useMemo, useState } from "react"
import PlusIcon from "../icons/PlusIcon"
import TaskCard from "./TaskCard"

interface Props {
    column: Column
    deleteColumn: (id: Id) => void
    updateColumn: (id: Id, title: string) => void
    deleteTask: (id: Id) => void
    updateTask: (id: Id, content: string) => void
    createTask: (columnId: Id) => void
    tasks: Task[]
}

const ColumnContainer = (props: Props) => {
    const {
        column,
        deleteColumn,
        updateColumn,
        createTask,
        tasks,
        deleteTask,
        updateTask
    } = props
    const [editMode, setEditMode] = useState(false)
    const tasksIds = useMemo(() => {
        return tasks.map((task) => task.id)
    }, [tasks])

    const {
        setNodeRef,
        attributes,
        transform,
        transition,
        listeners,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column
        },
        disabled: editMode,
    })
    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }

    if (isDragging) {
        return <div
            ref={setNodeRef}
            style={style}
            className="
        bg-columnBackgroundColor
        w-[350px] h-[500px] max-h-[500px]
        rounded-md
        flex
        flex-col
        opacity-60
        border-2 border-rose-500
        ">

        </div>
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="
        bg-columnBackgroundColor
        w-[350px] h-[500px] max-h-[500px]
        rounded-md
        flex
        flex-col
        "
        >
            {/* Columnt Title */}
            <div
                onClick={() => { setEditMode(true) }}
                className="
            bg-mainBackgroundColor
            h-[60px]
            text-md
            cursor-grab
            rounded-md
            rounded-b-none
            p-3
            font-bold
            border-4 border-columnBackgroundColor
            items-center justify-between
            flex
            "
            >
                <div className="flex gap-2">
                    <div className="
                    flex
                    justify-center
                    items-center
                    bg-columnBackgroundColor
                    px-2
                    py-1
                    text-sm
                    rounded-full
                    "
                    >0</div>
                    {!editMode && column.title}
                    {editMode &&
                        <input
                            className="
                            bg-black
                            focus:border-rose-500
                            border rounded outline-none px-2
                            "
                            value={column.title}
                            onChange={(e) => updateColumn(column.id, e.target.value)}
                            autoFocus
                            onBlur={() => { setEditMode(false) }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setEditMode(false)
                                }
                            }}
                        />}
                </div>
                <button
                    onClick={() => { deleteColumn(column.id) }}
                    className="
                    stroke-gray-500 
                    hover:stroke-white
                    hover:bg-columnBackgroundColor
                    rounded
                    px-1
                    py-2
                    "
                ><TrashIcon /></button>
            </div>
            {/* Column task Container */}
            <SortableContext
                items={tasksIds}
            >
                <div
                    className="
                flex flex-grow flex-col
                gap-2 p-2 overlflow-x-hidden overflow-y-auto
                
                ">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    ))}
                </div>
            </SortableContext>
            {/* Column footer */}
            <div
                className="
                flex gap-2 items-center
                border-columnBackgroundColor
                border-2 rounded-md p-4
                border-x-columnBackgroundColor
                hover:bg-mainBackgroundColor hover:text-rose-500
                active:bg-black
                "
                onClick={() => { createTask(column.id) }}
            ><PlusIcon />Add Task </div>
        </div>
    )
}

export default ColumnContainer
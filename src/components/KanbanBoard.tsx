import { useMemo, useState } from "react"
import PlusIcon from "../icons/PlusIcon"
import { Column, Id, Task } from "../types/types"
import ColumnContainer from "./ColumnContainer"
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import TaskCard from "./TaskCard"

const KanbanBoard = () => {

    const [columns, setColumns] = useState<Column[]>([])
    const [activeColumn, setActiveColumn] = useState<Column | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const columnsId = useMemo(() => columns.map((col) => col.id),
        [columns])

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 3
        }
    }))


    return (
        <div
            className="
            m-auto flex min-h-screen w-full
            items-center 
            overflow-x-auto
            overflow-y-hidden
            px-[40px]
            "
        >
            <DndContext
                sensors={sensors}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={OnDragOver}
            >
                <div className="m-auto flex gap-4">
                    <div className="flex gap-4">
                        <SortableContext items={columnsId}>
                            {columns.map(col => (
                                <ColumnContainer
                                    key={col.id}
                                    column={col}
                                    createTask={createTask}
                                    updateTask={updateTask}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumn}
                                    tasks={tasks.filter(task => task.columnId === col.id)}
                                    deleteTask={deleteTask}
                                />
                            ))}
                        </SortableContext>
                    </div>
                    <button
                        onClick={() => {
                            createNewColumn()
                        }}
                        className="
                    flex
                    gap-2
                    h-[60px] w-[350px] min-w-[350px]
                    cursor-pointer
                    rounded-lg
                    bg-mainBackgroundColor
                    border-2 border-columnBackgroundColor
                    p-4
                    ring-rose-500
                    hover:ring-2
                    "
                    > <PlusIcon />Add Column
                    </button>
                </div>
                {createPortal(
                    <DragOverlay>
                        {activeColumn && <ColumnContainer
                            updateColumn={updateColumn}
                            createTask={createTask}
                            column={activeColumn}
                            deleteColumn={deleteColumn}
                            updateTask={updateTask}
                            tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                            deleteTask={deleteTask}
                        />
                        }
                        {
                            activeTask &&
                            <TaskCard
                                task={activeTask}
                                deleteTask={deleteTask}
                                updateTask={updateTask}
                            />
                        }
                    </DragOverlay>, document.body
                )}

            </DndContext>
        </div>
    )

    function OnDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";

        if (!isActiveATask) return

        //Im dropping a task over another Task
        if (isActiveATask && isOverATask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((task) => task.id === activeId)
                const overIndex = tasks.findIndex((task) => task.id === overId)

                tasks[activeIndex].columnId = tasks[overIndex].columnId

                return arrayMove(tasks, activeIndex, overIndex)
            })
        }


        const isOverAColumn = over.data.current?.type === "Column"
        //Im dropping a task over a Column
        if (isActiveATask && isOverAColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((task) => task.id === activeId)

                tasks[activeIndex].columnId = overId

                return arrayMove(tasks, activeIndex, activeIndex)
            })
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null)
        setActiveTask(null)

        const { active, over } = event
        if (!over) return
        const activeColumnId = active.id
        const overColumnId = over.id

        if (activeColumnId === overColumnId) return
        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex(
                (col) => col.id === activeColumnId
            )

            const overColumnIndex = columns.findIndex(
                (col) => col.id === overColumnId
            )
            return arrayMove(columns, activeColumnIndex, overColumnIndex)
        })
    }

    function createTask(columnId: Id) {
        const newTask: Task = {
            id: genreateId(),
            columnId,
            content: `Task ${tasks.length + 1}`
        }
        setTasks([...tasks, newTask])
    }

    function deleteTask(id: Id) {
        const filteredTasks = tasks.filter((task) => task.id !== id)
        setTasks(filteredTasks)

    }
    function updateTask(id: Id, content: string) {
        const newTasks = tasks.map((task) => {
            if (task.id !== id) return task;
            return { ...task, content }
        })
        setTasks(newTasks)
    }

    function updateColumn(id: Id, title: string) {
        const newColumns = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title }
        })
        setColumns(newColumns)
    }

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column)
            return
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task)
            return
        }


    }

    function createNewColumn() {
        const createNewColumn: Column = {
            id: genreateId(),
            title: `Column ${columns.length + 1}`,
        }
        setColumns([...columns, createNewColumn])
    }
    function deleteColumn(id: Id) {
        const filteredColumn = columns.filter(col => col.id !== id)
        setColumns(filteredColumn)

        const newTasks = tasks.filter((task) => task.columnId !== id)
        setTasks(newTasks)
    }

    function genreateId() {
        return Math.floor(Math.random() * 1000)
    }

}

export default KanbanBoard
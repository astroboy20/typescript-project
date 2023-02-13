//creating a namsace to share the drag and drop interface

    //drag and drop
export interface Draggable{
    dragStartHandler(event:DragEvent):void
    dragEndHandler(event:DragEvent):void
}

export interface DragTarget{
    dragOverHandler(event:DragEvent):void
    dropHandler(event:DragEvent):void
    dragLeaveHandler(event:DragEvent):void
}

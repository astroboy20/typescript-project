// Code goes here!

//Autobind decorator
//the decorator will take 3 parameters  - 
//1- targert:any
//2- methodName:string
//descriptor:PropertyDescriptor
// function autobind(_:any,
//     _2:string, 
//     descriptor:PropertyDescriptor
// ) {
//     const originalMethod = descriptor.value
//     const adjDescriptor:PropertyDescriptor = {
//         configurable:true,
//         get(){
//             const boundFn = originalMethod.bind(this)
//             return boundFn
//         }
//     }
//     return adjDescriptor
// }

//drag and drop
interface Draggable{
    dragStartHandler(event:DragEvent):void
    dragEndHandler(event:DragEvent):void
}
interface DragTarget{
    dragOverHandler(event:DragEvent):void
    dropHandler(event:DragEvent):void
    dragLeaveHandler(event:DragEvent):void
}

//Project Types



//enum
enum ProjectStatus {Active,Finished}

class Project{
    constructor(
        public id:string,
        public title:string,
        public description:string,
        public people:number,
        public status:ProjectStatus){



    }
}

//Project State Management

type Listener<T> =(items:T[])=>void

class State<T>{
    protected listeners:Listener<T>[]=[]
    addlistener(listenerFn:Listener<T>){
        this.listeners.push(listenerFn)
    }
}

class ProjectState extends State<Project>{
    private projects:Project[]=[]
    private static instance:ProjectState
    private constructor(){
        super()
    }
    //Using singleton
    static getInstance(){
        if(this.instance){
            return this.instance
        }
        this.instance = new ProjectState()
        return this.instance
    }

   

    addProject(title:string, description:string, numOfPeople:number){
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
            )
        this.projects.push(newProject)
       this.updateListeners()

    }
    moveProject(projectId:string, newStatus:ProjectStatus){
        const project = this.projects.find(prj => prj.id == projectId)
        if(project && project.status != newStatus){
            project.status = newStatus
            this.updateListeners()
        }
    }

    private updateListeners(){
        for(const listenerFn of this.listeners){
            listenerFn(this.projects.slice())
        }
    }
}
const projectState = ProjectState.getInstance()

//validation
interface Validatable{
    value:string | number
    required?:boolean
    minLength?:number
    maxLength?:number
    min?:number
    max?:number
}

function validate(ValidatableInput: Validatable){
    let isValid = true

    if(ValidatableInput.required){
        isValid = isValid && ValidatableInput.value.toString().trim().length !== 0
    }
    if(ValidatableInput.minLength !=null && typeof ValidatableInput.value ==='string'){
        isValid = isValid && ValidatableInput.value.length >ValidatableInput.minLength
    }
    if(ValidatableInput.maxLength !=null && typeof ValidatableInput.value ==='string'){
        isValid = isValid && ValidatableInput.value.length < ValidatableInput.maxLength
    }
    if(ValidatableInput.min !=null && typeof ValidatableInput.value ==='number'){
        isValid = isValid && ValidatableInput.value >= ValidatableInput.min
    }
    if(ValidatableInput.max !=null && typeof ValidatableInput.value ==='number'){
        isValid = isValid && ValidatableInput.value <= ValidatableInput.max
    }
    return isValid
}


//Component Base Class

abstract class Component<T extends HTMLElement, U extends HTMLElement>{
    templateElement:HTMLTemplateElement
    hostElement:T
    element:U 

    constructor(
        templateId:string, 
        hostElementid:string, 
        insertAtStart:boolean,
        newElementId?: string,){
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement

        this.hostElement = document.getElementById(hostElementid)! as T

        const importedNode = document.importNode(this.templateElement.content,true)

        this.element = importedNode.firstElementChild as U
        if (newElementId){
            this.element.id = newElementId
        }
         
        this.attach(insertAtStart)
    }
     //render the list to the dom
     private attach(insertAtBeginning:boolean){
        this.hostElement.insertAdjacentElement
        (insertAtBeginning ? 'afterbegin':'beforeend', 
        this.element)
    }
    abstract configure():void
    abstract renderContent():void

}
//Projectitem class
class ProjectItem extends Component<HTMLUListElement,HTMLLIElement> implements Draggable{

    private project:Project

    get persons(){
        if (this.project.people ===1){
            return '1 person'
        }else{
            return `${this.project.people} persons`
        }
    }
    constructor(hostId:string,project:Project){
        super('single-project',hostId,false,project.id)
        this.project = project
        this.configure()
        this.renderContent()
    }

    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData('text/plain', this.project.id)
        event.dataTransfer!.effectAllowed='move'
    }
    dragEndHandler(_: DragEvent): void {
        console.log('e dey work')
    }
    //adding the drag eventlistener
    configure(): void {
        this.element.addEventListener('dragstart',this.dragStartHandler.bind(this))
        this.element.addEventListener('dragend',this.dragEndHandler.bind(this))
    }
    renderContent(): void {
        this.element.querySelector('h2')!.textContent = this.project.title
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned'
        this.element.querySelector('p')!.textContent = this.project.description
    }
}

//ProjectList class

class ProjectList extends Component<HTMLDivElement,HTMLElement> implements DragTarget{
    assignedProjects:Project[]
    constructor(private type: 'active' | 'finished' ){
        super('project-list','app',false,`${type}-projects`) 
        this.assignedProjects = []    
        this.configure()
        this.renderContent()
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement
        listEl.innerHTML = ''
        for (const prjItem of this.assignedProjects){
            new ProjectItem(this.element.querySelector('ul')!.id,prjItem )
        }
    }
    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0]==='text/plain'){
            event.preventDefault()
            const listEl = this.element.querySelector('ul')!
            listEl.classList.add('droppable')
        }
        
    }
    dropHandler(event: DragEvent): void {
        const prjId = event.dataTransfer!.getData('text/plain')
        projectState.moveProject(prjId, this.type ==='active' ? ProjectStatus.Active: ProjectStatus.Finished)

    }
    dragLeaveHandler(event: DragEvent): void {
        const listEl = this.element.querySelector('ul')!
        listEl.classList.remove('droppable')
    }
    configure(){
        this.element.addEventListener('dragover',this.dragOverHandler.bind(this))
        this.element.addEventListener('dragleave',this.dragLeaveHandler.bind(this))
        this.element.addEventListener('drop',this.dropHandler.bind(this))

        projectState.addlistener((projects:Project[])=>{
            //filter the project to active and finished 
            const relevantProjects = projects.filter(prj =>{
                if (this.type === 'active'){
                return prj.status===ProjectStatus.Active
                }
                return prj.status === ProjectStatus.Finished
            })
            this.assignedProjects = relevantProjects
            this.renderProjects()
        })
    }
    renderContent(){
        const listId =`${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
     }
}





//ProjectInput Class
class ProjectInput extends Component<HTMLDivElement,HTMLFormElement> {

    //registering the form input element
    titleInputElement:HTMLInputElement
    descriptionInputElement:HTMLInputElement
    peopleInputElement:HTMLInputElement

    constructor(){
        super('project-input','app',true,'user-input')
        //type casting
        
         //interacting with the form elements
         this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement
         this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement
         this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement
 
        this.configure()
    }
    //adding event listener to the button in a private methoth so that it can only be accessed in the class
    configure(){
        this.element.addEventListener('submit',this.submitHandler.bind(this))
    }
    renderContent(): void {
        
    }
    //adding a method to get the user input using the tuple type as validator
    //-a tuple is a type that allows a specific number of element
    private gatherUserInput():[string,string,number]|void{
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value

        const titleValidatable:Validatable ={
            value:enteredTitle,
            required:true
        }
        const descriptorValidatable:Validatable ={
            value:enteredDescription,
            required:true,
            minLength:5
        }
        const peopleValidatable:Validatable ={
            value:+enteredPeople,
            required:true,
            min:1,
            max:5
        }



        if(
            !validate(titleValidatable) ||
            !validate(descriptorValidatable) ||
            !validate(peopleValidatable) 
        ) {
            alert('Invalid input, please try again!')
            return
        }else{
            return[enteredTitle,enteredDescription,+enteredPeople]
        }
    }

    private clearInputs(){
        this.titleInputElement.value =''
        this.descriptionInputElement.value =''
        this.peopleInputElement.value = ''

    }

    //adding autobind
    // @autobind
    //button function
    private submitHandler(e:Event){
        e.preventDefault()
        const userInput = this.gatherUserInput()
        if(Array.isArray(userInput)){
            const [title,desc,people] = userInput
            projectState.addProject(title,desc,people)
            this.clearInputs()
        }
    }

    
   
}

const projectInput = new ProjectInput()
const activeProjectList = new ProjectList('active')
const finishedProjectList = new ProjectList('finished')

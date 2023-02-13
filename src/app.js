// Code goes here!
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//Project Types
//enum
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
var Project = /** @class */ (function () {
    function Project(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
    return Project;
}());
var State = /** @class */ (function () {
    function State() {
        this.listeners = [];
    }
    State.prototype.addlistener = function (listenerFn) {
        this.listeners.push(listenerFn);
    };
    return State;
}());
var ProjectState = /** @class */ (function (_super) {
    __extends(ProjectState, _super);
    function ProjectState() {
        var _this = _super.call(this) || this;
        _this.projects = [];
        return _this;
    }
    //Using singleton
    ProjectState.getInstance = function () {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    };
    ProjectState.prototype.addProject = function (title, description, numOfPeople) {
        var newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        this.updateListeners();
    };
    ProjectState.prototype.moveProject = function (projectId, newStatus) {
        var project = this.projects.find(function (prj) { return prj.id == projectId; });
        if (project && project.status != newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    };
    ProjectState.prototype.updateListeners = function () {
        for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
            var listenerFn = _a[_i];
            listenerFn(this.projects.slice());
        }
    };
    return ProjectState;
}(State));
var projectState = ProjectState.getInstance();
function validate(ValidatableInput) {
    var isValid = true;
    if (ValidatableInput.required) {
        isValid = isValid && ValidatableInput.value.toString().trim().length !== 0;
    }
    if (ValidatableInput.minLength != null && typeof ValidatableInput.value === 'string') {
        isValid = isValid && ValidatableInput.value.length > ValidatableInput.minLength;
    }
    if (ValidatableInput.maxLength != null && typeof ValidatableInput.value === 'string') {
        isValid = isValid && ValidatableInput.value.length < ValidatableInput.maxLength;
    }
    if (ValidatableInput.min != null && typeof ValidatableInput.value === 'number') {
        isValid = isValid && ValidatableInput.value >= ValidatableInput.min;
    }
    if (ValidatableInput.max != null && typeof ValidatableInput.value === 'number') {
        isValid = isValid && ValidatableInput.value <= ValidatableInput.max;
    }
    return isValid;
}
//Component Base Class
var Component = /** @class */ (function () {
    function Component(templateId, hostElementid, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementid);
        var importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    //render the list to the dom
    Component.prototype.attach = function (insertAtBeginning) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
    };
    return Component;
}());
//Projectitem class
var ProjectItem = /** @class */ (function (_super) {
    __extends(ProjectItem, _super);
    function ProjectItem(hostId, project) {
        var _this = _super.call(this, 'single-project', hostId, false, project.id) || this;
        _this.project = project;
        _this.configure();
        _this.renderContent();
        return _this;
    }
    Object.defineProperty(ProjectItem.prototype, "persons", {
        get: function () {
            if (this.project.people === 1) {
                return '1 person';
            }
            else {
                return "".concat(this.project.people, " persons");
            }
        },
        enumerable: false,
        configurable: true
    });
    ProjectItem.prototype.dragStartHandler = function (event) {
        event.dataTransfer.setData('text/plain', this.project.id);
        event.dataTransfer.effectAllowed = 'move';
    };
    ProjectItem.prototype.dragEndHandler = function (_) {
        console.log('e dey work');
    };
    //adding the drag eventlistener
    ProjectItem.prototype.configure = function () {
        this.element.addEventListener('dragstart', this.dragStartHandler.bind(this));
        this.element.addEventListener('dragend', this.dragEndHandler.bind(this));
    };
    ProjectItem.prototype.renderContent = function () {
        this.element.querySelector('h2').textContent = this.project.title;
        this.element.querySelector('h3').textContent = this.persons + ' assigned';
        this.element.querySelector('p').textContent = this.project.description;
    };
    return ProjectItem;
}(Component));
//ProjectList class
var ProjectList = /** @class */ (function (_super) {
    __extends(ProjectList, _super);
    function ProjectList(type) {
        var _this = _super.call(this, 'project-list', 'app', false, "".concat(type, "-projects")) || this;
        _this.type = type;
        _this.assignedProjects = [];
        _this.configure();
        _this.renderContent();
        return _this;
    }
    ProjectList.prototype.renderProjects = function () {
        var listEl = document.getElementById("".concat(this.type, "-projects-list"));
        listEl.innerHTML = '';
        for (var _i = 0, _a = this.assignedProjects; _i < _a.length; _i++) {
            var prjItem = _a[_i];
            new ProjectItem(this.element.querySelector('ul').id, prjItem);
        }
    };
    ProjectList.prototype.dragOverHandler = function (event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            var listEl = this.element.querySelector('ul');
            listEl.classList.add('droppable');
        }
    };
    ProjectList.prototype.dropHandler = function (event) {
        var prjId = event.dataTransfer.getData('text/plain');
        projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    };
    ProjectList.prototype.dragLeaveHandler = function (event) {
        var listEl = this.element.querySelector('ul');
        listEl.classList.remove('droppable');
    };
    ProjectList.prototype.configure = function () {
        var _this = this;
        this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
        this.element.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
        this.element.addEventListener('drop', this.dropHandler.bind(this));
        projectState.addlistener(function (projects) {
            //filter the project to active and finished 
            var relevantProjects = projects.filter(function (prj) {
                if (_this.type === 'active') {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            _this.assignedProjects = relevantProjects;
            _this.renderProjects();
        });
    };
    ProjectList.prototype.renderContent = function () {
        var listId = "".concat(this.type, "-projects-list");
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent = this.type.toUpperCase() + ' PROJECTS';
    };
    return ProjectList;
}(Component));
//ProjectInput Class
var ProjectInput = /** @class */ (function (_super) {
    __extends(ProjectInput, _super);
    function ProjectInput() {
        var _this = _super.call(this, 'project-input', 'app', true, 'user-input') || this;
        //type casting
        //interacting with the form elements
        _this.titleInputElement = _this.element.querySelector('#title');
        _this.descriptionInputElement = _this.element.querySelector('#description');
        _this.peopleInputElement = _this.element.querySelector('#people');
        _this.configure();
        return _this;
    }
    //adding event listener to the button in a private methoth so that it can only be accessed in the class
    ProjectInput.prototype.configure = function () {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    };
    ProjectInput.prototype.renderContent = function () {
    };
    //adding a method to get the user input using the tuple type as validator
    //-a tuple is a type that allows a specific number of element
    ProjectInput.prototype.gatherUserInput = function () {
        var enteredTitle = this.titleInputElement.value;
        var enteredDescription = this.descriptionInputElement.value;
        var enteredPeople = this.peopleInputElement.value;
        var titleValidatable = {
            value: enteredTitle,
            required: true
        };
        var descriptorValidatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        var peopleValidatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };
        if (!validate(titleValidatable) ||
            !validate(descriptorValidatable) ||
            !validate(peopleValidatable)) {
            alert('Invalid input, please try again!');
            return;
        }
        else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    };
    ProjectInput.prototype.clearInputs = function () {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    };
    //adding autobind
    // @autobind
    //button function
    ProjectInput.prototype.submitHandler = function (e) {
        e.preventDefault();
        var userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            var title = userInput[0], desc = userInput[1], people = userInput[2];
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    };
    return ProjectInput;
}(Component));
var projectInput = new ProjectInput();
var activeProjectList = new ProjectList('active');
var finishedProjectList = new ProjectList('finished');

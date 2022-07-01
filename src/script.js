class TodoList {
    constructor($el) {
        this.$el = $el;
        this.todos = [];

        this.$el.on('click', '.change-status', (event) => {
            let $item = $(event.target);
            this.changeStatus($item.closest('li').data('id'));
        })

        this.$el.on('click', '.delete-task', (event) => {
            let $item = $(event.target);
            this.removeTodo($item.closest('li').data('id'));
        })
    }

    getTodos() {
        $.ajax({
            url: 'http://localhost:3000/todos',
            type: 'get',
            dataType: 'json'
        })
            .done((todos) => {
                this.todos = todos;
                this.renderTodos(this.todos);
            })
            .fail((error) => {
                console.warn(error);
            })
    }

    createTodoItem(todo) {
         return `<li class="${todo.status ? 'done' : ''}" data-id="${todo.id}">${todo.task}<button class="change-status">Change status</button><button class="delete-task">Delete</button></li>`;
    }

    renderTodos(todos = []) {
        let list = '';
        for (let element of todos) {
            if (!element) {
                return;
            }
            list += this.createTodoItem(element);
        }
        this.$el.html(list);
    }

    addTodo(todo) {
        $.ajax({
            url: 'http://localhost:3000/todos',
            type: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                task: todo,
                status: false
            }),
        })
            .done((todo) => {
                this.todos.push(todo);
                let newTodo = this.createTodoItem(todo);
                this.$el.append(newTodo);
            })
            .fail((error) => {
                console.warn(error);
            })
    }

    changeStatus(id) {
        let index = this.todos.findIndex(element => element.id === id);
        this.todos[index].status = !this.todos[index].status;
        $.ajax({
            url: `http://localhost:3000/todos/${id}`,
            type: 'put',
            data: JSON.stringify({
                task: this.todos[index].task,
                status: !!this.todos[index].status
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .done(() => {
                $(`[data-id="${id}"]`).toggleClass('done');
            })
            .fail((error) => {
                console.warn(error);
            })
    }

    removeTodo(id) {
        this.todos = this.todos.filter((el) => el.id !== id);
        $.ajax({
            url: `http://localhost:3000/todos/${id}`,
            type: 'delete',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .done(() => {
                $(`[data-id="${id}"]`).remove();
            })
            .fail((error) => {
                console.warn(error);
            })
    }
}

const $listTodos = $('#list');
const $todoInput = $('#todo_input');
const $addTodoBtn = $('.add_todo');

const todoOne = new TodoList($listTodos);
todoOne.getTodos();

$addTodoBtn.on('click', () => {
    todoOne.addTodo($todoInput.val());
    $todoInput.val('');
});
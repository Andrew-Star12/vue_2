new Vue({
    el: '#app',
    data: {
        newNoteTitle: '',
        newNoteTasks: '',
        notes: []
    },
    methods: {
        // Метод для создания новой заметки
        createNote() {
            if (this.newNoteTitle.trim() && this.newNoteTasks.trim()) {
                // Разбиваем задачи на массив
                const tasks = this.newNoteTasks.split(',').map(task => ({
                    text: task.trim(),
                    completed: false
                }));

                // Создаем новую заметку
                const newNote = {
                    title: this.newNoteTitle,
                    tasks: tasks
                };

                // Добавляем новую заметку в массив
                this.notes.push(newNote);

                // Очищаем поля для ввода
                this.newNoteTitle = '';
                this.newNoteTasks = '';
            }
        }
    }
});
new Vue({
    el: '#app',
    data: {
        newNoteTitle: '',
        newNoteTasks: '',
        notes: []
    },
    computed: {
        // Разделяем заметки на 3 столбца
        firstColumn() {
            return this.notes.slice(0, 3);  // Первая колонка ограничена 3 заметками
        },
        secondColumn() {
            return this.notes.slice(3, 8);  // Вторая колонка ограничена 5 заметками
        },
        thirdColumn() {
            return this.notes.slice(8);  // Третья колонка без ограничения
        }
    },
    methods: {
        createNote() {
            if (this.newNoteTitle.trim() && this.newNoteTasks.trim()) {
                // Разбиваем задачи на массив
                const tasks = this.newNoteTasks.split(',').map(task => ({
                    text: task.trim(),
                    completed: false
                }));

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

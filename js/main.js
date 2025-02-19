new Vue({
    el: '#app',
    data: {
        newNoteTitle: '',
        newNoteTasks: '',
        notes: []
    },
    computed: {
        firstColumn() {
            return this.notes.filter(note => this.getTaskCompletionPercentage(note) < 50);  // Первая колонка: задачи с прогрессом < 50%
        },
        secondColumn() {
            return this.notes.filter(note => this.getTaskCompletionPercentage(note) >= 50 && this.getTaskCompletionPercentage(note) < 100);  // Вторая колонка: задачи с прогрессом от 50% до 100%
        },
        thirdColumn() {
            return this.notes.filter(note => this.getTaskCompletionPercentage(note) === 100);  // Третья колонка: задачи с прогрессом 100%
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
        },
        // Метод для вычисления процента выполненных задач в заметке
        getTaskCompletionPercentage(note) {
            const totalTasks = note.tasks.length;
            const completedTasks = note.tasks.filter(task => task.completed).length;
            return (completedTasks / totalTasks) * 100;
        }
    },
    watch: {
        // Слежение за изменениями в заметках и задачах для автоматического перемещения
        notes: {
            handler() {
                // После изменения заметок, необходимо заново распределить их по столбцам
                this.notes.forEach(note => {
                    const completionPercentage = this.getTaskCompletionPercentage(note);
                    if (completionPercentage >= 50 && completionPercentage < 100 && !this.secondColumn.includes(note)) {
                        // Если процент выполнения больше 50%, перемещаем в колонку 2
                        if (this.firstColumn.includes(note)) {
                            this.firstColumn.splice(this.firstColumn.indexOf(note), 1);
                            this.secondColumn.push(note);
                        }
                    } else if (completionPercentage === 100 && !this.thirdColumn.includes(note)) {
                        // Если процент выполнения 100%, перемещаем в колонку 3
                        if (this.secondColumn.includes(note)) {
                            this.secondColumn.splice(this.secondColumn.indexOf(note), 1);
                            this.thirdColumn.push(note);
                        } else if (this.firstColumn.includes(note)) {
                            this.firstColumn.splice(this.firstColumn.indexOf(note), 1);
                            this.thirdColumn.push(note);
                        }
                    }
                });
            },
            deep: true // Следим за вложенными изменениями (например, завершение задач)
        }
    }
});

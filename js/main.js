new Vue({
    el: '#app',
    data: {
        newNoteTitle: '',
        newNoteTasks: '',
        notes: [],
        alertMessage: '' // Добавляем переменную для отображения сообщения
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
            // Проверка, если в первой колонке уже 3 заметки
            if (this.firstColumn.length >= 3) {
                this.alertMessage = "В первом столбце не может быть больше 3-х заметок!";
                setTimeout(() => {
                    this.alertMessage = ''; // Скрываем сообщение через 3 секунды
                }, 3000);
                return;
            }

            // Проверка, если во второй колонке уже 5 заметок
            if (this.secondColumn.length >= 5) {
                this.alertMessage = "Во втором столбце не может быть больше 5-ти заметок!";
                setTimeout(() => {
                    this.alertMessage = ''; // Скрываем сообщение через 3 секунды
                }, 3000);
                return;
            }

            if (this.newNoteTitle.trim() && this.newNoteTasks.trim()) {
                // Разбиваем задачи на массив
                const tasks = this.newNoteTasks.split(',').map(task => ({
                    text: task.trim(),
                    completed: false
                }));

                // Создаем новую заметку с массивом задач
                const newNote = {
                    title: this.newNoteTitle,
                    tasks: tasks // Убедимся, что tasks всегда массив
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
            if (!note.tasks || !Array.isArray(note.tasks)) {
                return 0;
            }

            const totalTasks = note.tasks.length;
            const completedTasks = note.tasks.filter(task => task.completed).length;
            return (completedTasks / totalTasks) * 100;
        },
        // Функция для блокировки редактирования задачи
        isNoteCompleted(note) {
            return this.getTaskCompletionPercentage(note) === 100;
        }
    },
    watch: {
        // Слежение за изменениями в заметках и задачах для автоматического перемещения
        notes: {
            handler() {
                // После изменения заметок, необходимо заново распределить их по столбцам
                this.notes.forEach(note => {
                    const completionPercentage = this.getTaskCompletionPercentage(note);
                    if (completionPercentage > 50 && completionPercentage < 100 && !this.secondColumn.includes(note)) {
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

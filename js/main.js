new Vue({
    el: '#app',
    data: {
        newNoteTitle: '',
        newNoteTasks: '',
        notes: [],
        alertMessage: '' // Сообщение для уведомлений
    },
    computed: {
        firstColumn() {
            return this.notes.filter(note => this.getTaskCompletionPercentage(note) < 50); // Заметки с прогрессом < 50%
        },
        secondColumn() {
            return this.notes.filter(note => this.getTaskCompletionPercentage(note) >= 50 && this.getTaskCompletionPercentage(note) < 100); // Прогресс от 50% до 100%
        },
        thirdColumn() {
            return this.notes.filter(note => this.getTaskCompletionPercentage(note) === 100); // Прогресс 100%
        }
    },
    methods: {
        // Метод для вычисления процента выполненных задач
        getTaskCompletionPercentage(note) {
            const totalTasks = note.tasks.length;
            const completedTasks = note.tasks.filter(task => task.completed).length;
            return (completedTasks / totalTasks) * 100;
        },

        // Метод для перераспределения заметок по колонкам
        rearrangeColumns() {
            this.notes.forEach(note => {
                const completionPercentage = this.getTaskCompletionPercentage(note);

                // Перемещаем в первый столбец, если прогресс < 50%
                if (completionPercentage < 50 && !this.firstColumn.includes(note)) {
                    if (this.secondColumn.includes(note)) {
                        this.secondColumn.splice(this.secondColumn.indexOf(note), 1);
                    }
                    if (this.thirdColumn.includes(note)) {
                        this.thirdColumn.splice(this.thirdColumn.indexOf(note), 1);
                    }
                    this.notes.push(note); // Добавляем в общий список
                }

                // Перемещаем во второй столбец, если прогресс от 50% до 100%
                else if (completionPercentage >= 50 && completionPercentage < 100 && !this.secondColumn.includes(note)) {
                    if (this.secondColumn.length < 5) { // Проверяем, если во втором столбце есть место
                        if (this.firstColumn.includes(note)) {
                            this.firstColumn.splice(this.firstColumn.indexOf(note), 1);
                        }
                        this.secondColumn.push(note);
                    }
                }

                // Перемещаем в третий столбец, если прогресс 100%
                else if (completionPercentage === 100 && !this.thirdColumn.includes(note)) {
                    if (this.firstColumn.includes(note)) {
                        this.firstColumn.splice(this.firstColumn.indexOf(note), 1);
                    } else if (this.secondColumn.includes(note)) {
                        this.secondColumn.splice(this.secondColumn.indexOf(note), 1);
                    }
                    this.thirdColumn.push(note);
                }
            });
        },

        // Метод для создания новой заметки
        createNote() {
            // Проверка, что во втором столбце нет больше 5 заметок
            if (this.secondColumn.length >= 5) {
                this.alertMessage = "Во втором столбце не может быть больше 5-ти заметок!";
                setTimeout(() => {
                    this.alertMessage = ''; // Скрываем сообщение через 3 секунды
                }, 3000);
                return;
            }

            // Разбиваем задачи на массив
            const tasks = this.newNoteTasks.split(',').map(task => ({
                text: task.trim(),
                completed: false
            }));

            // Проверка на количество задач в заметке (от 3 до 5)
            if (tasks.length < 3 || tasks.length > 5) {
                this.alertMessage = "Каждая заметка должна содержать от 3 до 5 пунктов!";
                setTimeout(() => {
                    this.alertMessage = ''; // Скрываем сообщение через 3 секунды
                }, 3000);
                return;
            }

            // Создаем новую заметку
            const newNote = {
                title: this.newNoteTitle,
                tasks: tasks,
                lastCompletedTime: null
            };

            // Добавляем новую заметку в первый столбец (если там есть место)
            if (this.firstColumn.length < 3) {
                this.notes.push(newNote); // Добавляем заметку в основной массив
                this.rearrangeColumns();   // Перераспределяем по столбцам
                this.saveNotesToLocalStorage();

                // Очищаем поля ввода
                this.newNoteTitle = '';
                this.newNoteTasks = '';
            } else {
                this.alertMessage = "В первом столбце не может быть больше 3-х заметок!";
                setTimeout(() => {
                    this.alertMessage = ''; // Скрываем сообщение через 3 секунды
                }, 3000);
            }
        },

        // Сохранение заметок в Local Storage
        saveNotesToLocalStorage() {
            localStorage.setItem('notes', JSON.stringify(this.notes));
        },

        // Загрузка заметок из Local Storage
        loadNotesFromLocalStorage() {
            const savedNotes = localStorage.getItem('notes');
            if (savedNotes) {
                this.notes = JSON.parse(savedNotes);
            }
        }
    },

    mounted() {
        // Загружаем данные при старте приложения
        this.loadNotesFromLocalStorage();
    },

    watch: {
        notes: {
            handler() {
                this.rearrangeColumns();
            },
            deep: true
        }
    }
});

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

            // Если во втором столбце уже 5 заметок, перемещаем одну из первой в третью
            if (this.secondColumn.length >= 5) {
                // Перемещаем одну заметку из первого столбца в третий
                const noteToMove = this.firstColumn[0]; // Берем первую заметку из первого столбца
                this.firstColumn.splice(0, 1); // Удаляем ее из первого столбца
                this.thirdColumn.push(noteToMove); // Добавляем в третий столбец
            }

            // Проверка, если во второй колонке уже 5 заметок
            if (this.secondColumn.length < 5) {
                if (this.newNoteTitle.trim() && this.newNoteTasks.trim()) {
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

                    // Создаем новую заметку с массивом задач и с полем времени последнего завершения
                    const newNote = {
                        title: this.newNoteTitle,
                        tasks: tasks, // Убедимся, что tasks всегда массив
                        lastCompletedTime: null // Добавляем поле для времени последнего завершённого пункта
                    };

                    // Добавляем новую заметку в массив
                    this.notes.push(newNote);

                    // После добавления заметки сразу проверим и распределим по столбцам
                    this.rearrangeColumns();

                    // Сохраняем обновленный список заметок в localStorage
                    this.saveNotesToLocalStorage();

                    // Очищаем поля для ввода
                    this.newNoteTitle = '';
                    this.newNoteTasks = '';
                }
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
        },
        // Метод для перераспределения заметок по колонкам
        rearrangeColumns() {
            this.notes.forEach(note => {
                const completionPercentage = this.getTaskCompletionPercentage(note);

                // Перемещаем в первый столбец, если прогресс меньше 50%
                if (completionPercentage < 50 && !this.firstColumn.includes(note)) {
                    if (this.secondColumn.includes(note)) {
                        this.secondColumn.splice(this.secondColumn.indexOf(note), 1);
                    } else if (this.thirdColumn.includes(note)) {
                        this.thirdColumn.splice(this.thirdColumn.indexOf(note), 1);
                    }
                    this.firstColumn.push(note);
                }

                // Перемещаем во второй столбец, если прогресс от 50% до 100%
                else if (completionPercentage >= 50 && completionPercentage < 100 && !this.secondColumn.includes(note)) {
                    if (this.firstColumn.includes(note)) {
                        this.firstColumn.splice(this.firstColumn.indexOf(note), 1);
                    } else if (this.thirdColumn.includes(note)) {
                        this.thirdColumn.splice(this.thirdColumn.indexOf(note), 1);
                    }
                    this.secondColumn.push(note);
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
        // Метод для обновления времени последнего завершённого пункта задачи
        toggleTaskCompletion(note, task) {
            if (task.completed) {
                // Обновляем время, если задача была завершена
                note.lastCompletedTime = new Date().toLocaleString();
                // Сохраняем заметки в localStorage после изменения
                this.saveNotesToLocalStorage();
            }
        },
        // Метод для сохранения заметок в Local Storage
        saveNotesToLocalStorage() {
            localStorage.setItem('notes', JSON.stringify(this.notes));
        },
        // Метод для загрузки заметок из Local Storage
        loadNotesFromLocalStorage() {
            const savedNotes = localStorage.getItem('notes');
            if (savedNotes) {
                this.notes = JSON.parse(savedNotes);
            }
        }
    },
    mounted() {
        // Загружаем данные из Local Storage при инициализации
        this.loadNotesFromLocalStorage();
    },
    watch: {
        // Слежение за изменениями в заметках и задачах для автоматического перераспределения
        notes: {
            handler() {
                this.rearrangeColumns(); // Автоматически перераспределяем заметки
            },
            deep: true // Следим за вложенными изменениями (например, завершение задач)
        }
    }
});

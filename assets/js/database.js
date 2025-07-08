const db = {
    data: {
        courses: [],
        assignments: {}
    },

    init() {
        const saved = localStorage.getItem('scheduleDB_v3');
        if (saved) this.data = JSON.parse(saved);
        return this;
    },

    save() {
        localStorage.setItem('scheduleDB_v3', JSON.stringify(this.data));
    },

    // Gestión de cursos
    addCourse(course) {
        if (!this.data.courses.some(c => c.id === course.id)) {
            this.data.courses.push({
                id: `${course.code}-${course.group}`,
                ...course
            });
            this.save();
        }
    },

    getCourses() {
        return this.data.courses;
    },

    getCourseById(id) {
        return this.data.courses.find(c => c.id === id);
    },

    // Asignación de estudiantes
    assignStudent(student, courseIds) {
        this.data.assignments[student] = courseIds;
        this.save();
    },

    getStudentSchedule(student) {
        return this.data.assignments[student] || [];
    },

    // Exportación
    exportData() {
        return JSON.stringify(this.data, null, 2);
    },

    importData(json) {
        try {
            this.data = JSON.parse(json);
            this.save();
            return true;
        } catch (e) {
            console.error("Error importing data:", e);
            return false;
        }
    }
};

// Inicialización automática
db.init();

// Para uso en otros archivos
if (typeof module !== 'undefined') module.exports = db;
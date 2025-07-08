async function readExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                resolve(workbook);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

export async function processExcelFile(file) {
    try {
        const workbook = await readExcel(file);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (!jsonData.length) {
            throw new Error("El archivo está vacío o no tiene formato válido");
        }

        const requiredFields = ['CODIGO', 'ASIGNATURA', 'GRUPO'];
        const missingFields = requiredFields.filter(field => !(field in jsonData[0]));

        if (missingFields.length > 0) {
            throw new Error(`Faltan columnas requeridas: ${missingFields.join(', ')}`);
        }

        const courses = jsonData.map(row => ({
            id: `${row.CODIGO}-${row.GRUPO}`,
            code: row.CODIGO,
            name: row.ASIGNATURA,
            group: row.GRUPO,
            professor: row.PROFESOR || "Por asignar",
            day: row.DIA || "No definido",
            start: row.HORA_INICIO || "--:--",
            end: row.HORA_FIN || "--:--",
            classroom: row.AULA || "Por asignar"
        })).filter(course => course.code && course.name);

        return {
            success: true,
            courses,
            stats: {
                total: jsonData.length,
                imported: courses.length,
                skipped: jsonData.length - courses.length
            }
        };

    } catch (error) {
        return {
            success: false,
            error: error.message || "Error al procesar el archivo"
        };
    }
}
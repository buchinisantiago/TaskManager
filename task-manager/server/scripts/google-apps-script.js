/**
 * Google Apps Script - Daily Task Email Notifier
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Copia este código en script.google.com
 * 2. Cambia las variables de CONFIG abajo
 * 3. Ejecuta manualmente "sendDailyTaskEmail" la primera vez para autorizar permisos
 * 4. Configura un trigger diario en la sección de relojes (triggers)
 */

// ========== CONFIGURACIÓN ==========
const CONFIG = {
    // Tu email donde recibirás las notificaciones
    EMAIL_TO: "tu_email@gmail.com", // CAMBIAR ESTO

    // URL de tu API (puede ser ngrok, tu IP pública, o hosting)
    API_URL: "http://TU_URL_AQUI/APP-Prueba/task-manager/server/public/api/daily-summary.php", // CAMBIAR ESTO

    // Token secreto (el mismo que pusiste en daily-summary.php)
    SECRET_TOKEN: "tu_token_secreto_aqui_123", // CAMBIAR ESTO

    // Nombre que aparecerá en el asunto del email
    APP_NAME: "Task Manager"
};

/**
 * Función principal que se ejecuta diariamente
 */
function sendDailyTaskEmail() {
    try {
        Logger.log("Iniciando envío de email diario...");

        // Fetch tasks from API
        const tasks = fetchTasks();

        if (!tasks) {
            Logger.log("Error al obtener tareas de la API");
            sendErrorEmail("No se pudieron obtener las tareas de la API");
            return;
        }

        // Check if there are any tasks
        const hasTasksToday = tasks.today.count > 0;
        const hasTasksTomorrow = tasks.tomorrow.count > 0;

        if (!hasTasksToday && !hasTasksTomorrow) {
            Logger.log("No hay tareas pendientes para hoy ni mañana");
            // Opcional: Comentar la siguiente línea si no querés email cuando no hay tareas
            // sendNoTasksEmail();
            return;
        }

        // Generate email content
        const emailBody = generateEmailBody(tasks);
        const subject = `${CONFIG.APP_NAME} - Resumen de Tareas - ${formatDate(new Date())}`;

        // Send email
        GmailApp.sendEmail(CONFIG.EMAIL_TO, subject, emailBody);

        Logger.log("Email enviado exitosamente a " + CONFIG.EMAIL_TO);

    } catch (error) {
        Logger.log("Error en sendDailyTaskEmail: " + error.toString());
        sendErrorEmail(error.toString());
    }
}

/**
 * Obtiene las tareas desde la API PHP
 */
function fetchTasks() {
    try {
        const url = `${CONFIG.API_URL}?token=${CONFIG.SECRET_TOKEN}`;
        const response = UrlFetchApp.fetch(url, {
            muteHttpExceptions: true
        });

        const code = response.getResponseCode();
        if (code !== 200) {
            Logger.log(`API returned code ${code}: ${response.getContentText()}`);
            return null;
        }

        const data = JSON.parse(response.getContentText());

        if (!data.success) {
            Logger.log("API returned success=false");
            return null;
        }

        return data;

    } catch (error) {
        Logger.log("Error fetching tasks: " + error.toString());
        return null;
    }
}

/**
 * Genera el contenido del email en formato texto plano
 */
function generateEmailBody(data) {
    let body = `Hola!\n\n`;
    body += `Este es tu resumen diario de tareas.\n\n`;
    body += `${"=".repeat(50)}\n\n`;

    // Tasks for today
    if (data.today.count > 0) {
        body += `📅 TAREAS DE HOY (${formatDate(new Date(data.today.date))}):\n\n`;
        data.today.tasks.forEach(task => {
            body += formatTask(task);
        });
        body += `\n`;
    } else {
        body += `📅 TAREAS DE HOY: No hay tareas pendientes\n\n`;
    }

    body += `${"-".repeat(50)}\n\n`;

    // Tasks for tomorrow
    if (data.tomorrow.count > 0) {
        body += `📅 TAREAS DE MAÑANA (${formatDate(new Date(data.tomorrow.date))}):\n\n`;
        data.tomorrow.tasks.forEach(task => {
            body += formatTask(task);
        });
        body += `\n`;
    } else {
        body += `📅 TAREAS DE MAÑANA: No hay tareas pendientes\n\n`;
    }

    body += `${"=".repeat(50)}\n\n`;
    body += `Total: ${data.today.count + data.tomorrow.count} tarea(s) pendiente(s)\n\n`;
    body += `---\n`;
    body += `Generado: ${data.generated_at}\n`;
    body += `${CONFIG.APP_NAME}\n`;

    return body;
}

/**
 * Formatea una tarea individual
 */
function formatTask(task) {
    const priorityIcon = task.prioridad === 'Alta' ? '⚠️ ' : '• ';
    let formatted = `${priorityIcon}${task.prioridad} - ${task.titulo}\n`;

    if (task.descripcion && task.descripcion.trim()) {
        formatted += `   Notas: ${task.descripcion}\n`;
    }

    formatted += `   Vence: ${task.fecha_limite}\n`;
    formatted += `   Estado: ${task.estado}\n\n`;

    return formatted;
}

/**
 * Formatea una fecha en español
 */
function formatDate(date) {
    const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month} de ${year}`;
}

/**
 * Envía un email de error
 */
function sendErrorEmail(errorMessage) {
    try {
        const subject = `${CONFIG.APP_NAME} - Error en notificación diaria`;
        const body = `Hubo un error al generar el resumen diario:\n\n${errorMessage}\n\nPor favor revisa la configuración del script.`;

        GmailApp.sendEmail(CONFIG.EMAIL_TO, subject, body);
    } catch (e) {
        Logger.log("No se pudo enviar email de error: " + e.toString());
    }
}

/**
 * Envía un email cuando no hay tareas (opcional)
 */
function sendNoTasksEmail() {
    const subject = `${CONFIG.APP_NAME} - Sin tareas pendientes`;
    const body = `Hola!\n\nBuenas noticias: No tienes tareas pendientes para hoy ni mañana.\n\n¡Disfruta tu día! 🎉\n\n---\n${CONFIG.APP_NAME}`;

    GmailApp.sendEmail(CONFIG.EMAIL_TO, subject, body);
}

/**
 * Función de prueba - Ejecuta esto manualmente para probar
 */
function testEmailNow() {
    sendDailyTaskEmail();
}

import { getMensajes, sendMensaje, updateMensaje, deleteMensaje } from '../Services/chatService.js';

document.addEventListener("DOMContentLoaded", () => {
    const ID_CHAT_ACTUAL = 1; 
    const ID_CLIENTE_REMITENTE = 'DUI_CLIENTE_LOGUEADO';

    //1. --- REFERENCIAS A ELEMENTOS DEL HTML ---
    const container = document.getElementById('chat-messages-container'); 
    const messageInput = document.getElementById('chat-message-input');
    const sendBtn = document.getElementById('chat-send-btn');    

    //2. --- Eventos principales ---
    
    loadMensajes();

    sendBtn.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    /**
     * Carga todos los mensajes desde la API y los muestra en la pantalla.
     */
    async function loadMensajes() {
        try {
            // Llama a la función del servicio para obtener los mensajes y espera la respuesta.
            const mensajes = await getMensajes(ID_CHAT_ACTUAL);
            // Limpia el contenedor de mensajes para evitar duplicados al recargar.
            container.innerHTML = ""; 

            // Si no hay mensajes, muestra un texto indicándolo.
            if (!mensajes || mensajes.length === 0) {
                container.innerHTML = '<p class="text-center text-muted">Inicia la conversación.</p>';
                return; // Termina la ejecución de la función.
            }

            // Por cada mensaje recibido, llama a la función renderMensaje para crearlo en el HTML.
            mensajes.forEach(renderMensaje);
            // Hace que la vista del chat se desplace automáticamente hasta el último mensaje.
            container.scrollTop = container.scrollHeight; 
        } catch (error) {
            // Si ocurre un error al cargar los mensajes, lo muestra en la consola y en la pantalla.
            console.error("Error al cargar mensajes:", error);
            container.innerHTML = '<p class="text-center text-danger">No se pudieron cargar los mensajes.</p>';
        }
    }

    /**
     * Crea y añade un único mensaje al HTML.
     * @param {object} mensaje - El objeto del mensaje con sus datos (contenido, remitente, etc.).
     */
    function renderMensaje(mensaje) {
        const esMio = mensaje.duiClienteRemitente === ID_CLIENTE_REMITENTE;
        const row = document.createElement('div');
        // Le asigna las clases CSS para darle estilo y alineación.
        row.className = `message-row ${esMio ? 'is-me' : 'is-them'}`;

        // Crea el <div> para la burbuja del mensaje.
        const bubble = document.createElement('div');
        bubble.className = `bubble ${esMio ? 'is-me' : 'is-them'}`;
        bubble.textContent = mensaje.contenido; // Asigna el texto del mensaje.

        const meta = document.createElement('div');
        meta.className = 'meta';
        const fecha = new Date(mensaje.fechaHora);
        meta.textContent = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        //Añade los botones de editar y eliminar.
        if (esMio) {
            const editBtn = document.createElement('button'); // Crea el botón de editar.
            editBtn.className = 'btn btn-sm btn-link text-light p-0 ms-2'; 
            editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>'; // 
            editBtn.onclick = () => handleUpdateMessage(mensaje.idMensaje, mensaje.contenido); // Le asigna la función de actualizar.
            
            const deleteBtn = document.createElement('button'); // Crea el botón de eliminar.
            deleteBtn.className = 'btn btn-sm btn-link text-light p-0 ms-1'; 
            deleteBtn.innerHTML = '<i class="bi bi-trash3"></i>'; 
            deleteBtn.onclick = () => handleDeleteMessage(mensaje.idMensaje); // Le asigna la función de eliminar.
            
            // Añade los botones a los metadatos.
            meta.appendChild(editBtn);
            meta.appendChild(deleteBtn);
        }

        row.appendChild(bubble);
        bubble.appendChild(meta);
        container.appendChild(row);
    }

    /**
     * Maneja el proceso de enviar un nuevo mensaje.
     */
    async function handleSendMessage() {
        const contenido = messageInput.value.trim();
        if (!contenido) return;

        const messageData = {
            idChat: ID_CHAT_ACTUAL,
            duiClienteRemitente: ID_CLIENTE_REMITENTE,
            duiEmpleadoRemitente: null,
            contenido: contenido
        };

        try {
            await sendMensaje(messageData);
            messageInput.value = ""; 
            await loadMensajes(); 
        } catch (error) {
            // Muestra una alerta.
            Swal.fire('Error', 'No se pudo enviar tu mensaje.', 'error');
            console.error("Error al enviar mensaje:", error);
        }
    }

    /**
     * Maneja el proceso de actualizar un mensaje.
     * @param {number} id - El ID del mensaje a editar.
     * @param {string} contenidoActual - El texto actual del mensaje para mostrarlo en el cuadro de edición.
     */
    async function handleUpdateMessage(id, contenidoActual) {
        // Alerta de SweetAlert 
        const { value: nuevoContenido } = await Swal.fire({
            title: 'Editar Mensaje',
            input: 'textarea',
            inputValue: contenidoActual, 
            showCancelButton: true,
            confirmButtonText: 'Guardar Cambios',
            cancelButtonText: 'Cancelar'
        });

        
        if (nuevoContenido && nuevoContenido.trim() !== contenidoActual) {
            try {
                
                await updateMensaje(id, nuevoContenido.trim());
                await loadMensajes(); 
            } catch (error) {
                Swal.fire('Error', 'No se pudo actualizar el mensaje.', 'error');
                console.error("Error al actualizar:", error);
            }
        }
    }

    /**
     * Maneja el proceso de eliminar un mensaje.
     * @param {number} id - El ID del mensaje a eliminar.
     */
    async function handleDeleteMessage(id) {
        // Alerta de confirmación antes de eliminar.
        const result = await Swal.fire({
            title: '¿Eliminar mensaje?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        });

        
        if (result.isConfirmed) {
            try {
               
                await deleteMensaje(id);
                await loadMensajes();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el mensaje.', 'error');
                console.error("Error al eliminar:", error);
            }
        }
    }
});

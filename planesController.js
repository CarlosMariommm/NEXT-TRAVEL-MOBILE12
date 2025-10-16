import { getPlanes, addPlan, updatePlan, deletePlan } from '../Services/planesService.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Variables para paginación ---
    let currentPage = 0;
    const currentSize = 10; 

    // --- Referencias a elementos del DOM ---
    const tableBody = document.getElementById('planes-table-body');
    const modal = document.getElementById('plan-modal');
    const modalTitle = document.getElementById('modal-title');
    const addBtn = document.getElementById('add-plan-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const planForm = document.getElementById('plan-form');
    
    // --- Inputs del formulario ---
    const planIdInput = document.getElementById('plan-id');
    const nombreLugarInput = document.getElementById('nombreLugar');
    const descripcionInput = document.getElementById('descripcion');
    const ubicacionInput = document.getElementById('ubicacion');
    const tipoInput = document.getElementById('tipo');

    // Caché para almacenar los datos de la página actual y facilitar la edición
    let localPlanesCache = [];

    // --- Funciones del Modal ---
    const openModal = () => {
        if(modal) modal.classList.remove('hidden');
    }
    const closeModal = () => {
        if(modal) modal.classList.add('hidden');
    }

    const openModalForCreate = () => {
        planForm.reset();
        planIdInput.value = '';
        modalTitle.textContent = 'Añadir Nuevo Lugar';
        openModal();
    };

    const openModalForEdit = (id) => {
        const plan = localPlanesCache.find(p => p.id == id);
        if (plan) {
            planIdInput.value = plan.id;
            nombreLugarInput.value = plan.nombreLugar;
            descripcionInput.value = plan.descripcion || '';
            ubicacionInput.value = plan.ubicacion;
            tipoInput.value = plan.tipo;
            modalTitle.textContent = 'Editar Lugar';
            openModal();
        } else {
            Swal.fire('Error', 'No se pudieron cargar los datos para editar.', 'error');
        }
    };

    // --- Lógica de Renderizado ---
    const createTableRow = (plan) => {
        const id = plan.id ?? 'N/A';
        const nombre = plan.nombreLugar ?? 'Sin nombre';
        const ubicacion = plan.ubicacion ?? 'Sin ubicación';
        const tipo = plan.tipo ?? 'Sin tipo';

        const row = document.createElement('tr');
        row.dataset.id = id;
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${nombre}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ubicacion}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${tipo}</td>
            <td class="px-6 py-4 text-center text-sm font-medium space-x-2">
                <button title="Editar" class="edit-btn text-indigo-600 hover:text-indigo-900"><i class="bi bi-pencil-square text-lg"></i></button>
                <button title="Eliminar" class="delete-btn text-red-600 hover:text-red-900"><i class="bi bi-trash-fill text-lg"></i></button>
            </td>
        `;
        return row;
    };

    const renderPagination = (current, totalPages) => {
        const paginationContainer = document.getElementById("pagination-controls");
        if (!paginationContainer) return;
        paginationContainer.innerHTML = ''; 

        const createButton = (text, page, isDisabled = false, isCurrent = false) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.disabled = isDisabled;
            btn.className = `px-3 py-1 rounded-md text-sm font-medium ${isCurrent ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
            btn.addEventListener('click', () => {
                currentPage = page;
                loadPlanes();
            });
            return btn;
        };

        const controlsWrapper = document.createElement('div');
        controlsWrapper.className = 'flex items-center gap-2';
        controlsWrapper.appendChild(createButton('Anterior', current - 1, current === 0));

        // Lógica para mostrar un número limitado de páginas
        for (let i = 0; i < totalPages; i++) {
             controlsWrapper.appendChild(createButton(i + 1, i, false, i === current));
        }

        controlsWrapper.appendChild(createButton('Siguiente', current + 1, current >= totalPages - 1));
        paginationContainer.appendChild(controlsWrapper);

        const pageInfo = document.createElement('span');
        pageInfo.className = 'text-sm text-gray-600';
        pageInfo.textContent = `Página ${current + 1} de ${totalPages}`;
        paginationContainer.appendChild(pageInfo);
    };

    const loadPlanes = async () => {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-gray-500">Cargando...</td></tr>';
        try {
            const data = await getPlanes(currentPage, currentSize);
            const planes = data.content;
            localPlanesCache = planes;
            tableBody.innerHTML = '';

            if (planes && planes.length > 0) {
                planes.forEach(plan => {
                    const row = createTableRow(plan);
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-gray-500">No se encontraron lugares.</td></tr>';
            }
            renderPagination(data.number, data.totalPages);
            attachActionListeners();
        } catch (error) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-red-500">Error al cargar los datos.</td></tr>';
            console.error("Error detallado:", error);
        }
    };

    // --- Manejo de Eventos ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const id = planIdInput.value;
        const planData = {
            id: id ? parseInt(id, 10) : null,
            nombreLugar: nombreLugarInput.value,
            descripcion: descripcionInput.value,
            ubicacion: ubicacionInput.value,
            tipo: tipoInput.value,
        };

        try {
            if (id) {
                await updatePlan(id, planData);
                Swal.fire('¡Actualizado!', 'El lugar ha sido actualizado.', 'success');
            } else {
                await addPlan(planData);
                Swal.fire('¡Guardado!', 'El nuevo lugar ha sido agregado.', 'success');
            }
            closeModal();
            loadPlanes();
        } catch (error) {
            Swal.fire('Error', `No se pudo guardar: ${error.message}`, 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?', text: "Esta acción no se puede revertir.",
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deletePlan(id);
                Swal.fire('¡Eliminado!', 'El lugar ha sido eliminado.', 'success');
                // Si la última fila de una página es eliminada, retrocede
                if (tableBody.rows.length === 1 && currentPage > 0) {
                    currentPage--;
                }
                loadPlanes();
            } catch (error) {
                Swal.fire('Error', `No se pudo eliminar: ${error.message}`, 'error');
            }
        }
    };
    
    const attachActionListeners = () => {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openModalForEdit(btn.closest('tr').dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => handleDelete(btn.closest('tr').dataset.id));
        });
    };

    // --- Inicialización ---
    if(addBtn) addBtn.addEventListener('click', openModalForCreate);
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    if(planForm) planForm.addEventListener('submit', handleFormSubmit);

    loadPlanes();
});


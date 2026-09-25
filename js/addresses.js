import { supabase } from "./supabase.js";

console.log("RJ7 ADDRESSES: módulo carregado");
function rj7Notify(message) {

    let container =
        document.getElementById("rj7Notifications");

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "rj7Notifications";

        document.body.appendChild(
            container
        );
    }

    const notification =
        document.createElement("div");

    notification.className =
        "rj7-notification";

    notification.textContent =
        message;

    container.appendChild(
        notification
    );

    requestAnimationFrame(() => {

        notification.classList.add(
            "show"
        );

    });

    setTimeout(() => {

        notification.classList.remove(
            "show"
        );

        setTimeout(() => {

            notification.remove();

        }, 250);

    }, 3000);
}
const form = document.getElementById("address-form");
const list = document.getElementById("addresses-list");


// ==========================================
// VERIFICAR UTILIZADOR
// ==========================================

const {
    data: { user },
    error: userError
} = await supabase.auth.getUser();


if (userError || !user) {

    console.error(
        "RJ7 ADDRESSES — utilizador não autenticado:",
        userError
    );

    window.location.href = "login.html";

}


// ==========================================
// VARIÁVEL DE EDIÇÃO
// ==========================================

let editingAddressId = null;


// ==========================================
// CARREGAR ENDEREÇOS
// ==========================================

async function loadAddresses() {

    if (!list) return;


    const {
        data: addresses,
        error
    } = await supabase

        .from("addresses")

        .select(
            "id, email, full_name, phone, address, created_at"
        )

        .eq(
            "email",
            user.email
        )

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "RJ7 ADDRESSES — erro ao carregar:",
            error
        );

        list.innerHTML = `
            <p>
                Erro ao carregar os endereços.
            </p>
        `;

        return;
    }


    if (
        !addresses ||
        addresses.length === 0
    ) {

        list.innerHTML = `
            <p>
                Nenhum endereço guardado.
            </p>
        `;

        return;
    }


    list.innerHTML = "";


    addresses.forEach(address => {

        const card =
            document.createElement("div");

        card.className =
            "address-card";


        card.innerHTML = `

            <h3>

                <i class="fa-solid fa-location-dot"></i>

                ${escapeHTML(address.full_name)}

            </h3>


            <p>

                <strong>
                    Telefone:
                </strong>

                ${escapeHTML(address.phone)}

            </p>


            <p>

                <strong>
                    Endereço:
                </strong>

                ${escapeHTML(address.address)}

            </p>


            <div class="address-actions">

                <button
                    type="button"
                    class="address-edit-btn"
                    data-id="${address.id}"
                >

                    <i class="fa-solid fa-pen"></i>

                    Editar

                </button>


                <button
                    type="button"
                    class="address-delete-btn"
                    data-id="${address.id}"
                >

                    <i class="fa-solid fa-trash"></i>

                    Apagar

                </button>

            </div>

        `;


        list.appendChild(card);

    });


    // ==========================================
    // BOTÕES EDITAR
    // ==========================================

    document
        .querySelectorAll(".address-edit-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    startEditing(id);

                }
            );

        });


    // ==========================================
    // BOTÕES APAGAR
    // ==========================================

    document
        .querySelectorAll(".address-delete-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    deleteAddress(id);

                }
            );

        });

}


// ==========================================
// INICIAR EDIÇÃO
// ==========================================

async function startEditing(id) {

    const {
        data: address,
        error
    } = await supabase

        .from("addresses")

        .select(
            "id, full_name, phone, address"
        )

        .eq(
            "id",
            id
        )

        .eq(
            "email",
            user.email
        )

        .maybeSingle();


    if (error) {

        console.error(
            "RJ7 ADDRESSES — erro ao carregar endereço:",
            error
        );

        rj7Notify(
            "Não foi possível carregar este endereço."
        );

        return;
    }


    if (!address) {

        rj7Notify(
            "Endereço não encontrado."
        );

        return;
    }


    document.getElementById(
        "full_name"
    ).value =
        address.full_name || "";


    document.getElementById(
        "phone"
    ).value =
        address.phone || "";


    document.getElementById(
        "address"
    ).value =
        address.address || "";


    editingAddressId =
        address.id;


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.innerHTML = `

            <i class="fa-solid fa-check"></i>

            Atualizar Endereço

        `;

    }


    form.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ==========================================
// GUARDAR / ATUALIZAR
// ==========================================

form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        const full_name =
            document
                .getElementById("full_name")
                .value
                .trim();


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        const address =
            document
                .getElementById("address")
                .value
                .trim();


        if (
            !full_name ||
            !phone ||
            !address
        ) {

            rj7Notify(
                "Preenche todos os campos."
            );

            return;
        }


        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.textContent =
                editingAddressId
                    ? "A atualizar..."
                    : "A guardar...";

        }


        try {

            // ======================================
            // ATUALIZAR
            // ======================================

            if (editingAddressId) {

                const {
                    error
                } = await supabase

                    .from("addresses")

                    .update({

                        full_name:
                            full_name,

                        phone:
                            phone,

                        address:
                            address

                    })

                    .eq(
                        "id",
                        editingAddressId
                    )

                    .eq(
                        "email",
                        user.email
                    );


                if (error) {

                    console.error(
                        "RJ7 ADDRESSES — erro ao atualizar:",
                        error
                    );

                    rj7Notify(
                        "Não foi possível atualizar o endereço: " +
                        error.message
                    );

                    return;
                }


                rj7Notify(
                    "Endereço atualizado com sucesso!"
                );


            }

            // ======================================
            // NOVO ENDEREÇO
            // ======================================

            else {

                const {
                    error
                } = await supabase

                    .from("addresses")

                    .insert([{

                        email:
                            user.email,

                        full_name:
                            full_name,

                        phone:
                            phone,

                        address:
                            address

                    }]);


                if (error) {

                    console.error(
                        "RJ7 ADDRESSES — erro ao guardar:",
                        error
                    );

                    rj7Notify(
                        "Não foi possível guardar o endereço: " +
                        error.message
                    );

                    return;
                }


                rj7Notify(
                    "Endereço guardado com sucesso!"
                );

            }


            // ======================================
            // LIMPAR MODO DE EDIÇÃO
            // ======================================

            editingAddressId =
                null;


            form.reset();


            if (submitButton) {

                submitButton.innerHTML = `

                    <i class="fa-solid fa-location-dot"></i>

                    Guardar Endereço

                `;

            }


            await loadAddresses();


        } catch (error) {

            console.error(
                "RJ7 ADDRESSES — erro inesperado:",
                error
            );

            rj7Notify(
                "Erro: " +
                (
                    error?.message ||
                    error
                )
            );


        } finally {

            if (submitButton) {

                submitButton.disabled =
                    false;

                if (!editingAddressId) {

                    submitButton.innerHTML = `

                        <i class="fa-solid fa-location-dot"></i>

                        Guardar Endereço

                    `;

                }

            }

        }

    }
);


// ==========================================
// APAGAR ENDEREÇO
// ==========================================

async function deleteAddress(id) {

    const confirmDelete =
        confirm(
            "Tens a certeza que queres apagar este endereço?"
        );


    if (!confirmDelete) {

        return;

    }


    const {
        error
    } = await supabase

        .from("addresses")

        .delete()

        .eq(
            "id",
            id
        )

        .eq(
            "email",
            user.email
        );


    if (error) {

        console.error(
            "RJ7 ADDRESSES — erro ao apagar:",
            error
        );

        rj7Notify(
            "Não foi possível apagar o endereço: " +
            error.message
        );

        return;
    }


    rj7Notify(
        "Endereço apagado com sucesso!"
    );


    // Se estava a editar este endereço,
    // sair do modo de edição.

    if (
        editingAddressId === id
    ) {

        editingAddressId =
            null;

        form.reset();

    }


    await loadAddresses();

}


// ==========================================
// SEGURANÇA — ESCAPAR TEXTO HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ==========================================
// INICIAR
// ==========================================

loadAddresses();
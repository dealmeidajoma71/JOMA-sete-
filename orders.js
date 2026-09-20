import { supabase } from "./supabase.js";

console.log("RJ7 ORDERS: módulo carregado");


const ordersList =
    document.getElementById("orders-list");


// ======================================================
// VERIFICAR ELEMENTO
// ======================================================

if (!ordersList) {

    console.error(
        "RJ7 ORDERS: elemento #orders-list não encontrado."
    );

} else {

    carregarEncomendas();

}


// ======================================================
// ESCAPAR HTML
// ======================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================================
// FORMATAR PREÇO
// ======================================================

function formatarPreco(value) {

    const numero = Number(value);

    if (Number.isNaN(numero)) {

        return "0,00 Kz";

    }

    return numero.toLocaleString(
        "pt-PT",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + " Kz";

}


// ======================================================
// FORMATAR DATA
// ======================================================

function formatarData(value) {

    if (!value) {

        return "Data desconhecida";

    }

    const data =
        new Date(value);

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return "Data desconhecida";

    }

    return data.toLocaleDateString(
        "pt-PT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// ======================================================
// ESTADO DA ENCOMENDA
// ======================================================

function obterEstado(status) {

    const estado =
        String(status || "")
            .toLowerCase()
            .trim();


    const estados = {

        pending: {
            texto: "Pendente",
            classe: "pending",
            icone: "fa-clock"
        },

        pendente: {
            texto: "Pendente",
            classe: "pending",
            icone: "fa-clock"
        },

        processing: {
            texto: "Em processamento",
            classe: "processing",
            icone: "fa-box"
        },

        processando: {
            texto: "Em processamento",
            classe: "processing",
            icone: "fa-box"
        },

        shipped: {
            texto: "Enviada",
            classe: "shipped",
            icone: "fa-truck"
        },

        enviada: {
            texto: "Enviada",
            classe: "shipped",
            icone: "fa-truck"
        },

        delivered: {
            texto: "Entregue",
            classe: "delivered",
            icone: "fa-circle-check"
        },

        entregue: {
            texto: "Entregue",
            classe: "delivered",
            icone: "fa-circle-check"
        },

        cancelled: {
            texto: "Cancelada",
            classe: "cancelled",
            icone: "fa-circle-xmark"
        },

        cancelada: {
            texto: "Cancelada",
            classe: "cancelled",
            icone: "fa-circle-xmark"
        }

    };


    return estados[estado] || {

        texto:
            status ||
            "Pendente",

        classe:
            "pending",

        icone:
            "fa-clock"

    };

}


// ======================================================
// CARREGAR ENCOMENDAS
// ======================================================

async function carregarEncomendas() {

    try {

        // ==================================================
        // UTILIZADOR AUTENTICADO
        // ==================================================

        const {
            data: {
                user
            },
            error: userError
        } =
            await supabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            console.error(
                "RJ7 ORDERS — utilizador não autenticado:",
                userError
            );

            window.location.href =
                "login.html";

            return;

        }


        console.log(
            "RJ7 ORDERS — utilizador:",
            user.id
        );


        // ==================================================
        // LOADING
        // ==================================================

        ordersList.innerHTML = `

            <div class="orders-loading">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <p>
                    A carregar as tuas encomendas...
                </p>

            </div>

        `;


        // ==================================================
        // BUSCAR ENCOMENDAS
        // ==================================================

        const {
            data: orders,
            error: ordersError
        } =
            await supabase

                .from("orders")

                .select(`
                    id,
                    user_id,
                    customer_name,
                    customer_phone,
                    customer_address,
                    total,
                    status,
                    created_at
                `)

                .eq(
                    "user_id",
                    user.id
                )

                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        // ==================================================
        // ERRO
        // ==================================================

        if (ordersError) {

            console.error(
                "RJ7 ORDERS — erro:",
                ordersError
            );


            ordersList.innerHTML = `

                <div class="orders-empty">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>
                        Não foi possível carregar
                    </h3>

                    <p>
                        Ocorreu um erro ao carregar
                        as tuas encomendas.
                    </p>

                </div>

            `;

            return;

        }


        // ==================================================
        // NENHUMA ENCOMENDA
        // ==================================================

        if (
            !orders ||
            orders.length === 0
        ) {

            ordersList.innerHTML = `

                <div class="orders-empty">

                    <i class="fa-solid fa-box-open"></i>

                    <h3>
                        Ainda não tens encomendas
                    </h3>

                    <p>
                        Quando fizeres a tua primeira
                        compra, ela aparecerá aqui.
                    </p>

                </div>

            `;

            return;

        }


        // ==================================================
        // LIMPAR
        // ==================================================

        ordersList.innerHTML = "";


        // ==================================================
        // RENDERIZAR ENCOMENDAS
        // ==================================================

        orders.forEach(
            order => {

                const estado =
                    obterEstado(
                        order.status
                    );


                const orderId =
                    escapeHTML(
                        order.id
                    );


                const customerName =
                    escapeHTML(
                        order.customer_name
                    );


                const customerPhone =
                    escapeHTML(
                        order.customer_phone
                    );


                const customerAddress =
                    escapeHTML(
                        order.customer_address
                    );


                const total =
                    formatarPreco(
                        order.total
                    );


                const date =
                    formatarData(
                        order.created_at
                    );


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "order-card";


                card.innerHTML = `

                    <!-- =================================
                         CABEÇALHO
                    ================================== -->

                    <div class="order-card-top">

                        <div class="order-main">

                            <span class="order-label">
                                ENCOMENDA
                            </span>

                            <h3>
                                #${orderId}
                            </h3>

                        </div>


                        <span
                            class="
                                order-status
                                ${estado.classe}
                            "
                        >

                            <i
                                class="
                                    fa-solid
                                    ${estado.icone}
                                "
                            ></i>

                            ${escapeHTML(
                                estado.texto
                            )}

                        </span>

                    </div>


                    <!-- =================================
                         INFORMAÇÕES
                    ================================== -->

                    <div class="order-info">

                        <!-- DATA -->

                        <div class="order-info-row">

                            <i
                                class="
                                    fa-regular
                                    fa-calendar
                                "
                            ></i>

                            <div>

                                <span class="order-info-label">
                                    Data
                                </span>

                                <strong>
                                    ${date}
                                </strong>

                            </div>

                        </div>


                        <!-- NOME -->

                        <div class="order-info-row">

                            <i
                                class="
                                    fa-solid
                                    fa-user
                                "
                            ></i>

                            <div>

                                <span class="order-info-label">
                                    Nome
                                </span>

                                <strong>
                                    ${customerName || "—"}
                                </strong>

                            </div>

                        </div>


                        <!-- TELEFONE -->

                        <div class="order-info-row">

                            <i
                                class="
                                    fa-solid
                                    fa-phone
                                "
                            ></i>

                            <div>

                                <span class="order-info-label">
                                    Telefone
                                </span>

                                <strong>
                                    ${customerPhone || "—"}
                                </strong>

                            </div>

                        </div>


                        <!-- ENDEREÇO -->

                        <div class="order-info-row">

                            <i
                                class="
                                    fa-solid
                                    fa-location-dot
                                "
                            ></i>

                            <div>

                                <span class="order-info-label">
                                    Endereço de entrega
                                </span>

                                <strong>
                                    ${customerAddress || "—"}
                                </strong>

                            </div>

                        </div>

                    </div>


                    <!-- =================================
                         TOTAL
                    ================================== -->

                    <div class="order-card-bottom">

                        <span>
                            Total da encomenda
                        </span>

                        <strong>
                            ${total}
                        </strong>

                    </div>

                `;


                ordersList.appendChild(
                    card
                );

            }
        );


        console.log(
            "RJ7 ORDERS — encomendas carregadas:",
            orders.length
        );


    } catch (error) {

        console.error(
            "RJ7 ORDERS — erro inesperado:",
            error
        );


        ordersList.innerHTML = `

            <div class="orders-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    Ocorreu um erro
                </h3>

                <p>
                    Não foi possível carregar
                    as encomendas.
                </p>

            </div>

        `;

    }

}
import { supabase } from "./supabase.js";

const container = document.getElementById("order-details");
const orderNumber = document.getElementById("order-number");


// ==========================================
// VERIFICAR UTILIZADOR
// ==========================================

const {
    data: { user },
    error: userError
} = await supabase.auth.getUser();


if (userError) {

    console.error(
        "Erro ao verificar utilizador:",
        userError
    );

    container.innerHTML = `
        <p>Erro ao verificar a sessão.</p>
    `;

} else if (!user) {

    window.location.href = "login.html";

} else {

    // ==========================================
    // ID DA ENCOMENDA
    // ==========================================

    const orderId =
        localStorage.getItem("RJ7_selectedOrder");


    if (!orderId) {

        container.innerHTML = `
            <p>
                Nenhuma encomenda foi selecionada.
            </p>
        `;

    } else {

        // ==========================================
        // BUSCAR ENCOMENDA
        // ==========================================

        const {
            data: order,
            error
        } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .eq("user_id", user.id)
            .maybeSingle();


        if (error) {

            console.error(
                "Erro ao carregar encomenda:",
                error
            );

            container.innerHTML = `
                <p>
                    Erro ao carregar os detalhes da encomenda.
                </p>
            `;

        } else if (!order) {

            container.innerHTML = `
                <p>
                    Esta encomenda não foi encontrada.
                </p>
            `;

        } else {

            // ======================================
            // DADOS
            // ======================================

            const date =
                new Date(
                    order.created_at
                ).toLocaleDateString("pt-PT");


            const status =
                (order.status || "Pendente")
                .toLowerCase()
                .trim();


            orderNumber.textContent =
                `Encomenda #${order.id}`;


            // ======================================
            // DETERMINAR PROGRESSO
            // ======================================

            let progress = 1;


            if (
                status === "confirmada" ||
                status === "confirmado"
            ) {

                progress = 1;

            } else if (
                status === "em preparação" ||
                status === "em preparacao"
            ) {

                progress = 2;

            } else if (
                status === "enviada" ||
                status === "enviado"
            ) {

                progress = 3;

            } else if (
                status === "entregue"
            ) {

                progress = 4;

            }


            // ======================================
            // FUNÇÃO PARA CLASSE DO PASSO
            // ======================================

            function stepClass(step) {

                if (step < progress) {
                    return "completed";
                }

                if (step === progress) {
                    return "active";
                }

                return "";
            }


            // ======================================
            // MOSTRAR DETALHES
            // ======================================

            container.innerHTML = `

                <div class="order-detail-section">

                    <h3>
                        <i class="fa-solid fa-circle-info"></i>
                        Informações da encomenda
                    </h3>


                    <div class="order-detail-row">

                        <span>Número</span>

                        <strong>
                            #${order.id}
                        </strong>

                    </div>


                    <div class="order-detail-row">

                        <span>Data</span>

                        <strong>
                            ${date}
                        </strong>

                    </div>


                    <div class="order-detail-row">

                        <span>Estado</span>

                        <strong>
                            ${order.status || "Pendente"}
                        </strong>

                    </div>


                    <div class="order-detail-row">

                        <span>Total</span>

                        <strong>
                            ${Number(order.total)
                                .toLocaleString("pt-PT")}
                            Kz
                        </strong>

                    </div>

                </div>


                <div class="order-detail-section">

                    <h3>
                        <i class="fa-solid fa-user"></i>
                        Dados de entrega
                    </h3>


                    <div class="order-detail-row">

                        <span>Nome</span>

                        <strong>
                            ${order.customer_name}
                        </strong>

                    </div>


                    <div class="order-detail-row">

                        <span>Telefone</span>

                        <strong>
                            ${order.customer_phone || "-"}
                        </strong>

                    </div>


                    <div class="order-detail-row">

                        <span>Endereço</span>

                        <strong>
                            ${order.customer_address || "-"}
                        </strong>

                    </div>

                </div>


                <div class="order-tracking">

                    <h3>
                        Estado da encomenda
                    </h3>


                    <div class="
                        tracking-step
                        ${stepClass(1)}
                    ">

                        <i class="fa-solid fa-check"></i>

                        <span>
                            Pedido recebido
                        </span>

                    </div>


                    <div class="
                        tracking-step
                        ${stepClass(2)}
                    ">

                        <i class="fa-solid fa-box"></i>

                        <span>
                            Em preparação
                        </span>

                    </div>


                    <div class="
                        tracking-step
                        ${stepClass(3)}
                    ">

                        <i class="fa-solid fa-truck"></i>

                        <span>
                            Enviado
                        </span>

                    </div>


                    <div class="
                        tracking-step
                        ${stepClass(4)}
                    ">

                        <i class="fa-solid fa-house"></i>

                        <span>
                            Entregue
                        </span>

                    </div>

                </div>

            `;

        }

    }

}


console.log(
    "RJ7 — rastreamento dinâmico carregado."
);
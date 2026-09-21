import { supabase } from "./supabase.js";

const ordersList = document.getElementById("admin-orders");


// ==========================================
// CARREGAR ENCOMENDAS
// ==========================================

async function loadAdminOrders() {

    ordersList.innerHTML = `
        <p>A carregar encomendas...</p>
    `;


    const {
        data: orders,
        error
    } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Erro ao carregar encomendas:",
            error
        );

        ordersList.innerHTML = `
            <p>
                Erro ao carregar as encomendas.
            </p>
        `;

        return;
    }


    if (!orders || orders.length === 0) {

        ordersList.innerHTML = `
            <p>
                Ainda não existem encomendas.
            </p>
        `;

        return;
    }


    ordersList.innerHTML = "";


    orders.forEach(order => {

        const date = new Date(
            order.created_at
        ).toLocaleDateString("pt-PT");


        ordersList.innerHTML += `

            <article class="admin-order-card">

                <div class="admin-order-header">

                    <div>

                        <span>
                            ENCOMENDA
                        </span>

                        <h3>
                            #${order.id}
                        </h3>

                    </div>


                    <strong>
                        ${order.status || "Pendente"}
                    </strong>

                </div>


                <div class="admin-order-info">

                    <p>
                        <span>Cliente</span>
                        <strong>
                            ${order.customer_name}
                        </strong>
                    </p>


                    <p>
                        <span>Telefone</span>
                        <strong>
                            ${order.customer_phone || "-"}
                        </strong>
                    </p>


                    <p>
                        <span>Endereço</span>
                        <strong>
                            ${order.customer_address || "-"}
                        </strong>
                    </p>


                    <p>
                        <span>Total</span>
                        <strong>
                            ${Number(order.total)
                                .toLocaleString("pt-PT")}
                            Kz
                        </strong>
                    </p>


                    <p>
                        <span>Data</span>
                        <strong>
                            ${date}
                        </strong>
                    </p>

                </div>

            </article>

        `;

    });

}


loadAdminOrders();


console.log(
    "RJ7 — Painel administrativo carregado."
);
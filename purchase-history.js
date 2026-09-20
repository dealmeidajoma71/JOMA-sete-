import { supabase } from "./supabase.js";

const list = document.getElementById("purchase-history-list");


// ==========================================
// VERIFICAR UTILIZADOR
// ==========================================

const {
    data: { user },
    error: userError
} = await supabase.auth.getUser();


if (userError) {

    console.error(
        "Erro ao obter utilizador:",
        userError
    );

    list.innerHTML = `
        <p>Erro ao verificar a sessão.</p>
    `;

    throw userError;
}


if (!user) {

    window.location.href = "login.html";

}


// ==========================================
// CARREGAR HISTÓRICO
// ==========================================

async function loadPurchaseHistory() {

    const {
        data: orders,
        error
    } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false
        });


    // ==========================================
    // ERRO
    // ==========================================

    if (error) {

        console.error(
            "Erro ao carregar histórico:",
            error
        );

        list.innerHTML = `
            <p>
                Erro ao carregar o histórico de compras.
            </p>
        `;

        return;
    }


    // ==========================================
    // SEM COMPRAS
    // ==========================================

    if (!orders || orders.length === 0) {

        list.innerHTML = `
            <p>
                Ainda não tens compras registadas.
            </p>
        `;

        return;
    }


    // ==========================================
    // MOSTRAR COMPRAS
    // ==========================================

    list.innerHTML = "";


    orders.forEach(order => {

        const date = new Date(
            order.created_at
        ).toLocaleDateString("pt-PT");


        list.innerHTML += `

            <div class="purchase-card">

                <h3>

                    <i class="fa-solid fa-bag-shopping"></i>

                    Compra #${order.id}

                </h3>


                <p>

                    <strong>Data:</strong>

                    ${date}

                </p>


                <p>

                    <strong>Total:</strong>

                    ${Number(order.total)
                        .toLocaleString("pt-PT")}
                    Kz

                </p>


                <p>

                    <strong>Estado:</strong>

                    ${order.status || "Pendente"}

                </p>

            </div>

        `;

    });

}


loadPurchaseHistory();


console.log(
    "RJ7 — purchase-history.js carregado."
);
import { supabase } from "./supabase.js";

const orderInfo = document.getElementById("orderInfo");
const confirmOrder = document.getElementById("confirmOrder");

if (orderInfo && confirmOrder) {

    const checkoutData = JSON.parse(
        localStorage.getItem("RJ7_checkout")
    );

    if (!checkoutData) {

        orderInfo.innerHTML = `
            <p>Não existe nenhuma compra para confirmar.</p>
        `;

        confirmOrder.style.display = "none";

    } else {

        let productsHTML = "";

        checkoutData.items.forEach(item => {

            const itemTotal = item.price * item.quantity;

            productsHTML += `
                <div class="confirmation-item">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                    <div>

                        <h3>${item.name}</h3>

                        <p>
                            Quantidade:
                            ${item.quantity}
                        </p>

                        <p>
                            ${itemTotal.toLocaleString("pt-PT")} Kz
                        </p>

                    </div>

                </div>
            `;
        });

        orderInfo.innerHTML = `
            <div class="order-summary">

                <h3>Resumo do pedido</h3>

                ${productsHTML}

                <div class="confirmation-customer">

                    <p>
                        <strong>Nome:</strong>
                        ${checkoutData.customerName}
                    </p>

                    <p>
                        <strong>Telefone:</strong>
                        ${checkoutData.customerPhone}
                    </p>

                    <p>
                        <strong>Endereço:</strong>
                        ${checkoutData.customerAddress}
                    </p>

                    <p>
                        <strong>Pagamento:</strong>
                        ${checkoutData.paymentMethod || "Não selecionado"}
                    </p>

                </div>

                <h2>
                    Total:
                    ${checkoutData.total.toLocaleString("pt-PT")}
                    Kz
                </h2>

            </div>
        `;
    }


    confirmOrder.addEventListener("click", async () => {

        const checkoutData = JSON.parse(
            localStorage.getItem("RJ7_checkout")
        );

        if (!checkoutData) {
            alert("Não existe nenhuma compra para confirmar.");
            return;
        }

        confirmOrder.disabled = true;
        confirmOrder.textContent = "A processar...";

        try {

            // Obter utilizador autenticado
            const {
                data: { user },
                error: userError
            } = await supabase.auth.getUser();

            if (userError) {
                throw userError;
            }

            if (!user) {

                alert(
                    "Precisas iniciar sessão antes de confirmar a compra."
                );

                confirmOrder.disabled = false;
                confirmOrder.textContent = "Confirmar Pedido";

                return;
            }

            console.log("AUTH USER ID:", user.id);
            console.log("AUTH EMAIL:", user.email);


            // Criar encomenda
            const { data: order, error } = await supabase
                .from("orders")
                .insert([
                    {
                        user_id: user.id,
                        customer_name: checkoutData.customerName,
                        customer_phone: checkoutData.customerPhone,
                        customer_address: checkoutData.customerAddress,
                        total: checkoutData.total,
                        status: "Pendente"
                    }
                ])
                .select()
                .single();


            if (error) {

                console.error(
                    "Erro ao criar encomenda:",
                    error
                );

                alert(
                    "Erro ao criar encomenda: " +
                    error.message
                );

                confirmOrder.disabled = false;
                confirmOrder.textContent = "Confirmar Pedido";

                return;
            }


            console.log("ENCOMENDA CRIADA:", order);


            localStorage.setItem(
                "RJ7_lastOrder",
                JSON.stringify(order)
            );

            localStorage.removeItem("RJ7_cart");
            localStorage.removeItem("RJ7_checkout");


            alert("Pedido confirmado com sucesso!");

            window.location.href = "dashboard.html";


        } catch (error) {

            console.error(
                "Erro inesperado:",
                error
            );

            alert(
                "Erro ao processar o pedido: " +
                (error?.message || error)
            );

            confirmOrder.disabled = false;
            confirmOrder.textContent = "Confirmar Pedido";
        }

    });
}


console.log(
    "RJ7 — confirmation.js carregado."
);
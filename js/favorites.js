// ======================================================
// RJ7 — FAVORITOS
// ======================================================

import { supabase } from "./supabase.js";
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

// ======================================================
// ELEMENTOS
// ======================================================

const favoritesList =
    document.getElementById(
        "favoritesList"
    );


const favoritesCount =
    document.getElementById(
        "favoritesCount"
    );


// ======================================================
// CAMINHO DA IMAGEM
// ======================================================

function getImagePath(product) {

    if (!product || !product.image_url) {
        return "";
    }

    return "../" + product.image_url;

}


// ======================================================
// CARREGAR FAVORITOS
// ======================================================

async function loadFavorites() {

    if (!favoritesList) {
        return;
    }


    try {

        // ------------------------------------------
        // VERIFICAR UTILIZADOR
        // ------------------------------------------

        const {
            data: {
                user
            }
        } = await supabase.auth.getUser();


        if (!user) {

            favoritesList.innerHTML = `

                <div class="rj7-favorites-empty">

                    <h2>
                        Inicia sessão
                    </h2>

                    <p>
                        Inicia sessão para veres os teus produtos favoritos.
                    </p>

                    <a href="login.html">
                        Entrar
                    </a>

                </div>

            `;

            if (favoritesCount) {
                favoritesCount.textContent =
                    "0 produtos";
            }

            return;
        }


        // ------------------------------------------
        // BUSCAR FAVORITOS + PRODUTOS
        // ------------------------------------------

        const {
            data: favorites,
            error
        } = await supabase
            .from("favorites")
            .select(`
                id,
                product_id,
                created_at,
                products (
                    id,
                    name,
                    description,
                    price,
                    category,
                    image_url,
                    stock
                )
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


        if (error) {

            console.error(
                "RJ7 FAVORITOS — erro:",
                error
            );

            favoritesList.innerHTML = `

                <p class="rj7-favorites-loading">
                    Não foi possível carregar os favoritos.
                </p>

            `;

            return;
        }


        const favoriteData =
            favorites || [];


        // ------------------------------------------
        // CONTADOR
        // ------------------------------------------

        if (favoritesCount) {

            favoritesCount.textContent =
                favoriteData.length === 1
                    ? "1 produto"
                    : `${favoriteData.length} produtos`;

        }


        // ------------------------------------------
        // NENHUM FAVORITO
        // ------------------------------------------

        if (!favoriteData.length) {

            favoritesList.innerHTML = `

                <div class="rj7-favorites-empty">

                    <div class="rj7-empty-heart">
                        ♡
                    </div>

                    <h2>
                        Ainda não tens favoritos
                    </h2>

                    <p>
                        Guarda os produtos que mais gostas
                        para os encontrares facilmente depois.
                    </p>

                    <a href="shop.html">
                        Explorar produtos
                    </a>

                </div>

            `;

            return;
        }


        // ------------------------------------------
        // RENDERIZAR
        // ------------------------------------------

        favoritesList.innerHTML = "";


        favoriteData.forEach(
            favorite => {

                const product =
                    favorite.products;


                if (!product) {
                    return;
                }


                favoritesList.innerHTML += `

                    <article
                        class="rj7-favorite-card"
                        data-favorite-id="${favorite.id}"
                    >

                        <div class="rj7-favorite-image">

                            <img
                                src="${getImagePath(product)}"
                                alt="${product.name}"
                            >

                        </div>


                        <div class="rj7-favorite-info">

                            <p class="rj7-favorite-category">
                                ${product.category || ""}
                            </p>


                            <h2>
                                ${product.name}
                            </h2>


                            <p class="rj7-favorite-price">
                                ${Number(product.price).toLocaleString("pt-PT")} Kz
                            </p>


                            <div class="rj7-favorite-actions">

                                <button
                                    type="button"
                                    class="rj7-view-favorite"
                                    data-product-id="${product.id}"
                                >
                                    Ver produto
                                </button>


                                <button
                                    type="button"
                                    class="rj7-remove-favorite"
                                    data-favorite-id="${favorite.id}"
                                >
                                    ♡ Remover
                                </button>

                            </div>

                        </div>

                    </article>

                `;

            }
        );


    } catch (error) {

        console.error(
            "RJ7 FAVORITOS — erro inesperado:",
            error
        );

        favoritesList.innerHTML = `

            <p class="rj7-favorites-loading">
                Ocorreu um erro ao carregar os favoritos.
            </p>

        `;

    }

}


// ======================================================
// CLICAR NOS BOTÕES
// ======================================================

document.addEventListener(
    "click",
    async function (event) {


        // ==========================================
        // VER PRODUTO
        // ==========================================

        const viewButton =
            event.target.closest(
                ".rj7-view-favorite"
            );


        if (viewButton) {

            const productId =
                viewButton.dataset.productId;


            const {
                data: product,
                error
            } = await supabase
                .from("products")
                .select(
                    "id, name, description, price, category, image_url, stock"
                )
                .eq(
                    "id",
                    productId
                )
                .single();


            if (error || !product) {

                console.error(
                    "RJ7 FAVORITOS — produto não encontrado:",
                    error
                );

                return;
            }


            const selectedProduct = {

                id:
                    product.id,

                name:
                    product.name,

                description:
                    product.description || "",

                price:
                    Number(product.price),

                category:
                    product.category || "",

                image:
                    product.image_url || "",

                stock:
                    Number(product.stock || 0)

            };


            localStorage.setItem(
                "RJ7_selectedProduct",
                JSON.stringify(selectedProduct)
            );


            window.location.href =
                "product.html";


            return;
        }


        // ==========================================
        // REMOVER FAVORITO
        // ==========================================

        const removeButton =
            event.target.closest(
                ".rj7-remove-favorite"
            );


        if (removeButton) {

            const favoriteId =
                removeButton.dataset.favoriteId;


            const {
                error
            } = await supabase
                .from("favorites")
                .delete()
                .eq(
                    "id",
                    favoriteId
                );


            if (error) {

                console.error(
                    "RJ7 FAVORITOS — erro ao remover:",
                    error
                );

                rj7Notify(
                    "Não foi possível remover o favorito."
                );

                return;
            }


            await loadFavorites();

        }

    }
);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

loadFavorites();


console.log(
    "RJ7 — favoritos carregados corretamente."
);
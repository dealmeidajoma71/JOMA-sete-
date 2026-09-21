// ======================================================
// RJ7 — BUILD YOUR LOOK
// Produtos reais vindos do Supabase
// ======================================================

import { supabase } from "./supabase.js";


// ======================================================
// ELEMENTOS
// ======================================================

const styleButtons =
    document.querySelectorAll(
        ".rj7-build-style"
    );

const results =
    document.getElementById(
        "rj7BuildResults"
    );


// ======================================================
// PRODUTOS
// ======================================================

let products = [];


// ======================================================
// NORMALIZAR TEXTO
// Remove acentos e facilita a pesquisa
// ======================================================

function normalizeText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}


// ======================================================
// CARREGAR PRODUTOS DO SUPABASE
// ======================================================

async function loadProducts() {

    try {

        const {
            data,
            error
        } = await supabase
            .from("products")
            .select(
                "id, name, description, price, category, image_url, stock"
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "RJ7 BUILD — erro no Supabase:",
                error
            );

            showError();

            return;

        }


        products =
            (data || []).map(
                product => ({

                    id:
                        product.id,

                    name:
                        product.name || "",

                    description:
                        product.description || "",

                    price:
                        Number(
                            product.price || 0
                        ),

                    category:
                        product.category || "",

                    image:
                        product.image_url || "",

                    stock:
                        Number(
                            product.stock || 0
                        )

                })
            );


        console.log(
            "RJ7 BUILD — produtos carregados:",
            products
        );


    } catch (error) {

        console.error(
            "RJ7 BUILD — erro inesperado:",
            error
        );

        showError();

    }

}


// ======================================================
// PALAVRAS-CHAVE
// ======================================================

const styleKeywords = {

    casual: [
        "casual",
        "t-shirt",
        "tshirt",
        "camisola",
        "camiseta",
        "hoodie",
        "sweatshirt",
        "shirt",
        "street",
        "basic"
    ],

    sport: [
        "sport",
        "sports",
        "desporto",
        "treino",
        "training",
        "fitness",
        "gym",
        "academia",
        "running",
        "corrida",
        "performance",
        "athletic",
        "jogger",
        "shorts"
    ],

    premium: [
        "premium",
        "luxury",
        "luxo",
        "elegante",
        "elegant",
        "sofisticado",
        "sophisticated",
        "exclusive",
        "quality",
        "qualidade",
        "signature"
    ],

    minimal: [
        "minimal",
        "minimalista",
        "minimalist",
        "clean",
        "essential",
        "essencial",
        "basic",
        "simple",
        "simples"
    ],

    night: [
        "night",
        "noite",
        "evening",
        "party",
        "saida",
        "saída",
        "black",
        "preto",
        "preta",
        "dark"
    ],

    everyday: [
        "everyday",
        "daily",
        "dia",
        "diario",
        "diário",
        "casual",
        "basic",
        "essencial",
        "essential",
        "t-shirt",
        "camisola",
        "shirt"
    ]

};


// ======================================================
// TEXTO DO PRODUTO
// ======================================================

function getProductText(product) {

    return normalizeText(

        [
            product.name,
            product.description,
            product.category
        ]
            .filter(Boolean)
            .join(" ")

    );

}


// ======================================================
// ENCONTRAR PRODUTOS
// ======================================================

function findProductsByStyle(style) {

    const keywords =
        styleKeywords[style] || [];


    const normalizedKeywords =
        keywords.map(
            keyword =>
                normalizeText(keyword)
        );


    return products
        .filter(
            product =>
                Number(product.stock) > 0
        )
        .map(
            product => {

                const text =
                    getProductText(product);


                let score = 0;


                normalizedKeywords.forEach(
                    keyword => {

                        if (
                            text.includes(
                                keyword
                            )
                        ) {

                            score++;

                        }

                    }
                );


                return {

                    product,
                    score

                };

            }
        )
        .filter(
            item =>
                item.score > 0
        )
        .sort(
            (a, b) =>
                b.score - a.score
        )
        .slice(
            0,
            6
        )
        .map(
            item =>
                item.product
        );

}


// ======================================================
// MOSTRAR RESULTADOS
// ======================================================

function renderResults(
    style,
    matchedProducts
) {

    if (!results) {
        return;
    }


    results.innerHTML = "";


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "rj7-build-result-header";


    title.innerHTML = `

        <span>
            RJ7 STYLE MATCH
        </span>

        <h2>
            ${style}
        </h2>

        <p>
            Peças selecionadas para o teu estilo.
        </p>

    `;


    results.appendChild(
        title
    );


    if (
        matchedProducts.length === 0
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.textContent =
            "Ainda não encontramos peças classificadas para este estilo.";


        results.appendChild(
            empty
        );


        return;

    }


    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "rj7-build-products";


    matchedProducts.forEach(
        product => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "rj7-build-product";


            card.innerHTML = `

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <div>

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ${Number(
                            product.price
                        ).toLocaleString(
                            "pt-PT"
                        )} Kz
                    </p>

                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    localStorage.setItem(
                        "RJ7_selectedProduct",
                        JSON.stringify(
                            product
                        )
                    );


                    window.location.href =
                        "product.html";

                }
            );


            grid.appendChild(
                card
            );

        }
    );


    results.appendChild(
        grid
    );

}


// ======================================================
// CLICAR NO ESTILO
// ======================================================

styleButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                const style =
                    this.dataset.style;


                if (!style) {
                    return;
                }


                styleButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                this.classList.add(
                    "active"
                );


                if (
                    !products.length
                ) {

                    results.innerHTML = `

                        <p>
                            Os produtos ainda estão a carregar...
                        </p>

                    `;

                    return;

                }


                const matchedProducts =
                    findProductsByStyle(
                        style
                    );


                renderResults(
                    style,
                    matchedProducts
                );

            }
        );

    });


// ======================================================
// ERRO
// ======================================================

function showError() {

    if (!results) {
        return;
    }


    results.innerHTML = `

        <p>
            Não foi possível carregar os produtos RJ7.
        </p>

    `;

}


// ======================================================
// INICIAR
// ======================================================

loadProducts();


console.log(
    "RJ7 — Build Your Look iniciado."
);
// ======================================================
// RJ7 BUILD YOUR LOOK — CARTÕES + GALERIA
// ======================================================

function renderRJ7BuildLookGallery() {

    const container =
        document.getElementById(
            "rj7BuildLookProducts"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        
    }


    container.innerHTML = "";


    products.forEach(
        function(product) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "rj7-byl-card";


            const image =
                product.image || "";


            card.innerHTML = `

                <img
                    class="rj7-byl-main-image"
                    src="${image}"
                    alt="${product.name || "Produto RJ7"}"
                >


                <div class="rj7-byl-gallery"></div>


                <div class="rj7-byl-info">

                    <span>
                        ${product.category || "RJ7"}
                    </span>

                    <h3>
                        ${product.name || "Produto RJ7"}
                    </h3>

                    <p>
                        ${Number(
                            product.price || 0
                        ).toLocaleString("pt-PT")} Kz
                    </p>

                </div>

            `;


            container.appendChild(card);


            // ==========================================
            // GALERIA
            // ==========================================

            const gallery =
                card.querySelector(
                    ".rj7-byl-gallery"
                );


            const mainImage =
                card.querySelector(
                    ".rj7-byl-main-image"
                );


            const images = [];


            if (product.image) {

                images.push(
                    product.image
                );

            }


            /*
             * Quando o produto tiver várias imagens
             * no Supabase, elas serão adicionadas aqui.
             *
             * Por enquanto, usamos a imagem principal.
             */


            images.forEach(
                function(image, index) {

                    const thumb =
                        document.createElement(
                            "button"
                        );


                    thumb.type =
                        "button";


                    thumb.className =
                        "rj7-byl-thumb";


                    if (index === 0) {

                        thumb.classList.add(
                            "active"
                        );

                    }


                    thumb.innerHTML = `

                        <img
                            src="${image}"
                            alt=""
                        >

                    `;


                    thumb.addEventListener(
                        "click",
                        function(event) {

                            event.stopPropagation();


                            mainImage.src =
                                image;


                            gallery
                                .querySelectorAll(
                                    ".rj7-byl-thumb"
                                )
                                .forEach(
                                    function(item) {

                                        item.classList.remove(
                                            "active"
                                        );

                                    }
                                );


                            thumb.classList.add(
                                "active"
                            );

                        }
                    );


                    gallery.appendChild(
                        thumb
                    );

                }
            );


            // ==========================================
            // ABRIR PRODUTO
            // ==========================================

            card.addEventListener(
                "click",
                function() {

                    localStorage.setItem(
                        "RJ7_selectedProduct",
                        JSON.stringify(
                            product
                        )
                    );


                    window.location.href =
                        "product.html";

                }
            );

        }
    );

}


// ======================================================
// INICIAR
// ======================================================

renderRJ7BuildLookGallery();
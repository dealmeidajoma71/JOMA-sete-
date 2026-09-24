/* =========================================
   RJ7 NOTIFICATIONS
========================================= */

function rj7Notify(message) {

    let container = document.getElementById("rj7Notifications");

    if (!container) {
        container = document.createElement("div");
        container.id = "rj7Notifications";

        container.style.position = "fixed";
        container.style.bottom = "25px";
        container.style.right = "25px";
        container.style.zIndex = "99999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "10px";
        container.style.maxWidth = "calc(100% - 40px)";

        document.body.appendChild(container);
    }

    const notification = document.createElement("div");

    notification.textContent = message;

    notification.className = "rj7-notification";

    container.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateY(0)";
    });

    setTimeout(() => {
        notification.classList.add("show");

        setTimeout(() => {
            notification.remove();

            if (container.children.length === 0) {
                container.remove();
            }
        }, 250);

    }, 3000);
}
// ======================================================
// RJ7 — SCRIPT PRINCIPAL LIMPO
// SEM SUPABASE
// ======================================================


// ======================================================
// 1. PRODUTOS — SUPABASE
// ======================================================

import { supabase } from "./supabase.js";

let products = [];


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
                "id, name, description, price, category, image_url, stock, department, subcategory, brand, gender"
            )
            .order("created_at", {
                ascending: true
            });


        if (error) {

            console.error(
                "RJ7 — erro ao carregar produtos:",
                error
            );

            products = [];

            renderProducts([]);
            renderFeaturedProducts();

            return;
        }


        // ==================================================
        // CARREGAR TODOS OS PRODUTOS
        // ==================================================

        products = (data || []).map(product => ({

            id: product.id,

            name: product.name,

            description:
                product.description || "",

            price:
                Number(product.price),

            category:
                product.category || "",

            image:
                product.image_url || "",

            stock:
                Number(product.stock || 0),

            department:
                product.department || "",

            subcategory:
                product.subcategory || "",

            brand:
                product.brand || "",

            gender:
                product.gender || ""

        }));


        console.log(
            "RJ7 — produtos carregados do Supabase:",
            products
        );


        // ==================================================
        // RJ7 — CATÁLOGO ROTATIVO DA SHOP
        // ==================================================

        const shopDisplayCounts = [
            5,
            10,
            15,
            20
        ];


        // Escolher aleatoriamente quantos produtos mostrar
        const randomCount =
            shopDisplayCounts[
                Math.floor(
                    Math.random() *
                    shopDisplayCounts.length
                )
            ];


        // Copiar todos os produtos
        let shuffledProducts =
            [...products];


        // Embaralhar produtos
        for (
            let i = shuffledProducts.length - 1;
            i > 0;
            i--
        ) {

            const randomIndex =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );


            [
                shuffledProducts[i],
                shuffledProducts[randomIndex]
            ] = [
                shuffledProducts[randomIndex],
                shuffledProducts[i]
            ];

        }


        // ==================================================
        // EVITAR REPETIR IMEDIATAMENTE OS MESMOS PRODUTOS
        // ==================================================

        let previousProductIds = [];

        try {

            previousProductIds =
                JSON.parse(
                    sessionStorage.getItem(
                        "rj7PreviousShopProducts"
                    )
                ) || [];

        } catch (error) {

            previousProductIds = [];

        }


        let newShopProducts =
            shuffledProducts.filter(
                product =>
                    !previousProductIds.includes(
                        product.id
                    )
            );


        // Se não houver produtos suficientes
        // que sejam diferentes dos anteriores,
        // usamos novamente o catálogo completo.

        if (
            newShopProducts.length <
            randomCount
        ) {

            newShopProducts =
                shuffledProducts;

        }


        // Selecionar somente a quantidade definida
        const shopProducts =
            newShopProducts.slice(
                0,
                Math.min(
                    randomCount,
                    newShopProducts.length
                )
            );


        // Guardar os produtos mostrados nesta entrada
        try {

            sessionStorage.setItem(
                "rj7PreviousShopProducts",
                JSON.stringify(
                    shopProducts.map(
                        product =>
                            product.id
                    )
                )
            );

        } catch (error) {

            console.warn(
                "RJ7 — não foi possível guardar a rotação da Shop."
            );

        }


        console.log(
            "RJ7 — quantidade desta entrada:",
            shopProducts.length
        );


        console.log(
            "RJ7 — produtos desta entrada:",
            shopProducts
        );


        // ==================================================
        // MOSTRAR SOMENTE OS PRODUTOS DESTA ENTRADA
        // ==================================================

        renderProducts(
            shopProducts
        );


        renderFeaturedProducts();

        updateCartCount();

    } catch (error) {

        console.error(
            "RJ7 — erro inesperado ao carregar produtos:",
            error
        );

        products = [];

        renderProducts([]);

        renderFeaturedProducts();

        renderNewArrivals();

        renderBuildYourLook();

    }

}
// ======================================================
// 2. CARRINHO
// ======================================================

function getCart() {

    try {

        return JSON.parse(
            localStorage.getItem("RJ7_cart")
        ) || [];

    } catch (error) {

        console.error(
            "Erro ao carregar carrinho:",
            error
        );

        return [];
    }
}


function saveCart(cart) {

    localStorage.setItem(
        "RJ7_cart",
        JSON.stringify(cart)
    );

}


// ======================================================
// 3. CONTADOR DO CARRINHO
// ======================================================

function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");

    if (!cartCount) return;

    const cart = getCart();

    const total = cart.reduce(
        (sum, item) =>
            sum + Number(item.quantity || 0),
        0
    );

    cartCount.textContent = total;

}


// ======================================================
// 4. CAMINHO DAS IMAGENS
// ======================================================

function getImagePath(product) {

    const currentPath =
        window.location.pathname;

    // Se estamos dentro de /pages/
    if (currentPath.includes("/pages/")) {

        return "../" + product.image;

    }

    // Se estamos na raiz
    return product.image;

}


// ======================================================
// 5. RENDERIZAR PRODUTOS
// ======================================================

function renderProducts(list) {

    const productList =
        document.getElementById("productList");

    if (!productList) return;

    productList.innerHTML = "";

    if (!list.length) {

        productList.innerHTML = `
            <p class="no-products">
                Nenhum produto encontrado.
            </p>
        `;

        return;
    }


    list.forEach(product => {

        productList.innerHTML += `

            <article
    class="product-card"
    data-id="${product.id}"
>

                <div class="product-image">

                    <img
                        src="${getImagePath(product)}"
                        alt="${product.name}"
                    >

                </div>

                <div class="product-info">

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ${product.price.toLocaleString("pt-PT")} Kz
                    </p>

                    

                </div>

            </article>

        `;

    });

}


// ======================================================
// 6. RJ7 WORLD — CURRENT COLLECTION
// ======================================================

function renderFeaturedProducts() {

    const container =
        document.getElementById(
            "featuredProducts"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    // --------------------------------------------------
    // LIMITAR PRODUTOS NA HOME
    // --------------------------------------------------

    const featuredProducts =
        products.slice(0, 4);


    // --------------------------------------------------
    // CASO NÃO EXISTAM PRODUTOS
    // --------------------------------------------------

    if (!featuredProducts.length) {

        container.innerHTML = `

            <div class="rj7-empty-collection">

                <p>
                    A próxima coleção RJ7 está a chegar.
                </p>

            </div>

        `;

        return;
    }


    // --------------------------------------------------
    // RENDERIZAR PRODUTOS
    // --------------------------------------------------

    featuredProducts.forEach(
        product => {

            const price =
                Number(
                    product.price
                );


            const formattedPrice =
                Number.isFinite(price)

                    ? price.toLocaleString(
                        "pt-PT"
                    ) + " Kz"

                    : "Preço indisponível";


            container.innerHTML += `

                <article
                    class="product-card"
                    data-id="${product.id}"
                >

                    <div class="product-image">

                        <img
                            src="${getImagePath(product)}"
                            alt="${product.name}"
                            loading="lazy"
                        >

                    </div>


                    <div class="product-info">

                        <h3>
                            ${product.name}
                        </h3>


                        <p>
                            ${formattedPrice}
                        </p>

                    </div>

                </article>

            `;

        }
    );

}
// ======================================================
// 6.1. RJ7 — NEW ARRIVALS
// ======================================================

function renderNewArrivals() {

    const container =
        document.getElementById(
            "newArrivalsProducts"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    // --------------------------------------------------
    // COPIAR PRODUTOS
    // --------------------------------------------------

    const newestProducts =
        [...products]
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.created_at || 0
                        );

                    const dateB =
                        new Date(
                            b.created_at || 0
                        );

                    return dateB - dateA;

                }
            )
            .slice(0, 4);


    // --------------------------------------------------
    // SEM PRODUTOS
    // --------------------------------------------------

    if (!newestProducts.length) {

        container.innerHTML = `

            <div class="rj7-empty-collection">

                <p>
                    Novidades em breve.
                </p>

            </div>

        `;

        return;
    }


    // --------------------------------------------------
    // RENDERIZAR
    // --------------------------------------------------

    newestProducts.forEach(
        product => {

            const price =
                Number(
                    product.price
                );


            const formattedPrice =
                Number.isFinite(price)

                    ? price.toLocaleString(
                        "pt-PT"
                    ) + " Kz"

                    : "Preço indisponível";


            container.innerHTML += `

                <article
                    class="product-card"
                    data-id="${product.id}"
                >

                    <div class="product-image">

                        <img
                            src="${getImagePath(product)}"
                            alt="${product.name}"
                            loading="lazy"
                        >

                        <span class="rj7-new-badge">
                            NEW
                        </span>

                    </div>


                    <div class="product-info">

                        <h3>
                            ${product.name}
                        </h3>

                        <p>
                            ${formattedPrice}
                        </p>

                    </div>

                </article>

            `;

        }
    );

}
// ======================================================
// 6.2. RJ7 — BUILD YOUR LOOK
// ======================================================

function renderBuildYourLook() {

    const mainContainer =
        document.getElementById(
            "buildLookMain"
        );

    const complementsContainer =
        document.getElementById(
            "buildLookComplements"
        );

    const totalContainer =
        document.getElementById(
            "buildLookTotal"
        );


    if (
        !mainContainer ||
        !complementsContainer ||
        !totalContainer
    ) {
        return;
    }


    // --------------------------------------------------
    // LIMPAR
    // --------------------------------------------------

    mainContainer.innerHTML = "";

    complementsContainer.innerHTML = "";

    totalContainer.innerHTML = "";


    // --------------------------------------------------
    // PRODUTOS DISPONÍVEIS
    // --------------------------------------------------

    if (!products || !products.length) {

        mainContainer.innerHTML = `
            <p>
                Looks RJ7 em breve.
            </p>
        `;

        return;
    }


    // --------------------------------------------------
    // ESCOLHER PEÇA PRINCIPAL
    // --------------------------------------------------

    const mainProduct =
        products.find(
            product =>
                product.category === "homem"
                ||
                product.category === "mulher"
        )
        ||
        products[0];


    if (!mainProduct) {
        return;
    }


    // --------------------------------------------------
    // PRODUTOS COMPLEMENTARES
    // --------------------------------------------------

    const complementaryProducts =
        products
            .filter(
                product =>
                    product.id !==
                    mainProduct.id
            )
            .filter(
                product =>
                    product.category ===
                        "acessorios"
                    ||
                    product.name
                        .toLowerCase()
                        .includes("calça")
                    ||
                    product.name
                        .toLowerCase()
                        .includes("calções")
            )
            .slice(0, 2);


    // --------------------------------------------------
    // PREÇOS
    // --------------------------------------------------

    const mainPrice =
        Number(
            mainProduct.price
        ) || 0;


    let total =
        mainPrice;


    // --------------------------------------------------
    // PRODUTO PRINCIPAL
    // --------------------------------------------------

    mainContainer.innerHTML = `

        <article
            class="rj7-look-product"
            data-id="${mainProduct.id}"
        >

            <div class="rj7-look-image">

                <img
                    src="${getImagePath(mainProduct)}"
                    alt="${mainProduct.name}"
                    loading="lazy"
                >

            </div>


            <div class="rj7-look-info">

                <span>
                    START WITH
                </span>

                <h3>
                    ${mainProduct.name}
                </h3>

                <p>
                    ${mainPrice.toLocaleString("pt-PT")}
                    Kz
                </p>

            </div>

        </article>

    `;


    // --------------------------------------------------
    // COMPLEMENTOS
    // --------------------------------------------------

    complementaryProducts.forEach(
        product => {

            const price =
                Number(
                    product.price
                ) || 0;


            total += price;


            complementsContainer.innerHTML += `

                <article
                    class="rj7-look-product"
                    data-id="${product.id}"
                >

                    <div class="rj7-look-image">

                        <img
                            src="${getImagePath(product)}"
                            alt="${product.name}"
                            loading="lazy"
                        >

                    </div>


                    <div class="rj7-look-info">

                        <span>
                            COMPLETE WITH
                        </span>

                        <h3>
                            ${product.name}
                        </h3>

                        <p>
                            ${price.toLocaleString("pt-PT")}
                            Kz
                        </p>

                    </div>

                </article>

            `;

        }
    );


    // --------------------------------------------------
    // TOTAL
    // --------------------------------------------------

    totalContainer.innerHTML = `

        <span>
            YOUR COMPLETE LOOK
        </span>

        <strong>
            ${total.toLocaleString("pt-PT")} Kz
        </strong>

    `;

}
// ======================================================
// 7. ABRIR PRODUTO
// ======================================================

document.addEventListener(
    "click",
    function (event) {

        const card =
    event.target.closest(
        ".product-card"
    );

if (!card) return;

const id =
    card.dataset.id;



const product =
    products.find(
        item => String(item.id) === String(id)
    );


if (!product) {

    console.error(
        "RJ7 — produto não encontrado:",
        id
    );

    return;
}


localStorage.setItem(
    "RJ7_selectedProduct",
    JSON.stringify(product)
);


window.location.href =
    window.location.pathname.includes("/pages/")
        ? "product.html"
        : "pages/product.html";

    }
);


// ======================================================
// 8. RJ7 — SISTEMA INTELIGENTE DE PESQUISA E FILTROS
// ======================================================

// Estado atual dos filtros

const rj7Filters = {

    search: "",

    category: "all",

    color: "all",

    size: "all",

    availability: "all",

    minPrice: 0,

    maxPrice: Infinity,

    sort: "relevance"

};


// ======================================================
// NORMALIZAR TEXTO
// ======================================================

function normalizeSearchText(value) {

    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();

}

// ======================================================
// RJ7 — CORREÇÃO INTELIGENTE DE PESQUISA
// ======================================================

const rj7SearchAliases = {

    // =========================
    // TÉNIS / CALÇADO
    // =========================
    "tens": "tenis",
    "tenis": "tenis",
    "tenis": "tenis",
    "sapatilhas": "tenis",
    "sapatilha": "tenis",
    "sneakers": "tenis",
    "sneaker": "tenis",

    // =========================
    // MARCAS
    // =========================
    "nikee": "nike",
    "nik": "nike",
    "nikey": "nike",

    "adiddas": "adidas",
    "adidas": "adidas",
    "addidas": "adidas",

    // =========================
    // HOODIE / CASACOS
    // =========================
    "hood": "hoodie",
    "hoodies": "hoodie",
    "moletom": "hoodie",
    "moletons": "hoodie",

    // =========================
    // T-SHIRT
    // =========================
    "tshirt": "tshirt",
    "t-shirt": "tshirt",
    "tshirts": "tshirt",
    "tee": "tshirt",
    "tees": "tshirt",
    "camiseta": "tshirt",
    "camisetas": "tshirt",

    // =========================
    // CAMISA
    // =========================
    "camisas": "camisa",

    // =========================
    // CALÇAS
    // =========================
    "calca": "calca",
    "calcas": "calca",
    "calças": "calca",
    "pants": "calca",
    "trousers": "calca",

    // =========================
    // BONÉS
    // =========================
    "bone": "bone",
    "bones": "bone",
    "boné": "bone",
    "bonés": "bone",
    "cap": "bone",
    "caps": "bone",

    // =========================
    // TOUCAS
    // =========================
    "touca": "touca",
    "toucas": "touca",
    "beanie": "touca",
    "beanies": "touca",

    // =========================
    // CORES
    // =========================
    "black": "preto",
    "preta": "preto",
    "pretos": "preto",
    "pretas": "preto",

    "white": "branco",
    "branca": "branco",
    "brancos": "branco",
    "brancas": "branco",

    "grey": "cinzento",
    "gray": "cinzento",
    "cinza": "cinzento",
    "cinzenta": "cinzento",

    "red": "vermelho",
    "vermelha": "vermelho",

    "blue": "azul",
    "green": "verde",
    "yellow": "amarelo",
    "orange": "laranja",
    "purple": "roxo",

    // =========================
    // GÉNERO
    // =========================
    "masculino": "homem",
    "masculina": "homem",
    "male": "homem",
    "men": "homem",
    "man": "homem",

    "feminino": "mulher",
    "feminina": "mulher",
    "female": "mulher",
    "women": "mulher",
    "woman": "mulher"
};


// ======================================================
// NORMALIZAR TERMOS DA PESQUISA
// ======================================================

function normalizeRJ7SearchQuery(search) {

    const normalized =
        normalizeSearchText(
            search
        );

    if (!normalized) {
        return "";
    }

    return normalized
        .split(/\s+/)
        .map(
            term =>
                rj7SearchAliases[term] ||
                term
        )
        .join(" ");

}
// ======================================================
// PESQUISA INTELIGENTE
// ======================================================

function productMatchesSearch(
    product,
    search
) {

    // --------------------------------------------------
    // SEM PESQUISA
    // --------------------------------------------------

    if (!search || !search.trim()) {

        return true;

    }


    // --------------------------------------------------
    // TEXTO PESQUISADO
    // --------------------------------------------------

    const normalizedSearch =
    normalizeRJ7SearchQuery(
        search
    );


    // --------------------------------------------------
    // TEXTO PRINCIPAL DO PRODUTO
    // --------------------------------------------------

    const productText =
    normalizeSearchText(
        [
            product.name,
            product.description,
            product.category,
            product.department,
            product.subcategory,
            product.brand,
            product.gender
        ]
            .filter(Boolean)
            .join(" ")
    );
const productIntentText =
    normalizeSearchText(
        [
            product.name,
            product.description,
            product.category,
            product.subcategory
        ]
            .filter(Boolean)
            .join(" ")
    );
    

    // --------------------------------------------------
    // SINÓNIMOS / INTENÇÕES RJ7
    // --------------------------------------------------

    const searchGroups = {

        sport: [
            "sport",
            "esportivo",
            "esportiva",
            "desporto",
            "treino",
            "treinar",
            "academia",
            "fitness",
            "active",
            "performance",
            "corrida",
            "gym"
        ],

        premium: [
            "premium",
            "luxo",
            "elegante",
            "elegancia",
            "sofisticado",
            "sofisticada",
            "classe"
        ],

        casual: [
            "casual",
            "simples",
            "dia a dia",
            "everyday",
            "confortavel",
            "conforto"
        ],

        night: [
            "night",
            "noite",
            "sair",
            "festa",
            "jantar",
            "balada",
            "evento"
        ],

        minimal: [
            "minimal",
            "minimalista",
            "clean",
            "basico",
            "basica",
            "simples"
        ],

        black: [
            "preto",
            "preta",
            "pretos",
            "pretas",
            "black"
        ],

        white: [
            "branco",
            "branca",
            "brancos",
            "brancas",
            "white"
        ],

        grey: [
            "cinza",
            "cinzento",
            "cinzenta",
            "grey",
            "gray"
        ],

        navy: [
            "navy",
            "azul marinho",
            "azul escuro"
        ],

        tshirt: [
            "tshirt",
            "t-shirt",
            "tee",
            "camiseta",
            "camisa"
        ],

        hoodie: [
            "hoodie",
            "moletom",
            "sweatshirt",
            "casaco"
        ],

        pants: [
            "calca",
            "calcas",
            "pants",
            "trouser"
        ],

        hat: [
            "bone",
            "boné",
            "cap",
            "chapeu",
            "chapéu"
        ]

    };


    // --------------------------------------------------
    // FUNÇÃO PARA VERIFICAR GRUPO
    // --------------------------------------------------

    function containsAny(
        text,
        terms
    ) {

        return terms.some(
            term =>
                text.includes(
                    normalizeSearchText(term)
                )
        );

    }


    // --------------------------------------------------
    // PALAVRAS DA PESQUISA
    // --------------------------------------------------

    const rj7StopWords = [
    "quero",
    "quero um",
    "um",
    "uma",
    "uns",
    "umas",
    "para",
    "pra",
    "de",
    "do",
    "da",
    "dos",
    "das",
    "com",
    "sem",
    "em",
    "no",
    "na",
    "nos",
    "nas",
    "por",
    "me",
    "mostra",
    "mostrar",
    "procuro",
    "procurar",
    "preciso",
    "gostaria",
    "roupa",
"roupas",
"peca",
"pecas",
"produto",
"produtos",
"item",
"itens",
"look",
"looks",
"algo",
"algum",
"alguma",
"coisa",
"coisas",
"ir",
"dia"
];

// ======================================================
// RJ7 — NORMALIZAÇÃO DE INTENÇÕES
// ======================================================

const rj7IntentAliases = {

    // Sport
    "academia": "sport",
    "fitness": "sport",
    "treino": "sport",
    "treinar": "sport",
    "esportivo": "sport",
    "esportiva": "sport",
    "desporto": "sport",
    "corrida": "sport",
    "gym": "sport",

    // Premium
    "luxo": "premium",
    "elegante": "premium",
    "elegancia": "premium",
    "sofisticado": "premium",
    "sofisticada": "premium",
    "classe": "premium",

    // Casual
    "casual": "casual",
    "confortavel": "casual",
    "conforto": "casual",
    "everyday": "casual",

    // Night
    "noite": "night",
    "sair": "night",
    "festa": "night",
    "jantar": "night",
    "balada": "night",
    "evento": "night",

    // Minimal
    "minimal": "minimal",
    "minimalista": "minimal",
    "clean": "minimal",
    "basico": "minimal",
    "basica": "minimal",
    "simples": "minimal",
        // =========================
    // GÉNERO
    // =========================

    "masculino": "homem",
    "masculina": "homem",
    "male": "homem",
    "men": "homem",
    "man": "homem",

    "feminino": "mulher",
    "feminina": "mulher",
    "female": "mulher",
    "women": "mulher",
    "woman": "mulher"
};


const searchTerms =
    normalizedSearch
        .split(/\s+/)
        .filter(
            term =>
                term.length >= 2 &&
                !rj7StopWords.includes(term)
        )
        .map(
            term =>
                rj7IntentAliases[term] ||
                term
        );

// --------------------------------------------------
// RJ7 — TERMOS DE PESQUISA COMBINADOS
// --------------------------------------------------

const hasMultipleSearchTerms =
    searchTerms.length > 1;

const searchCombination =
    searchTerms.join(" ");
    // --------------------------------------------------
// RJ7 — VERIFICAR TODOS OS TERMOS
// --------------------------------------------------

function allSearchTermsMatch(text) {

    return searchTerms.every(
        term =>
            text.includes(term)
    );

}
// ======================================================
// RJ7 — PESQUISA MULTI-CRITÉRIO COM VARIANTES
// ======================================================

if (hasMultipleSearchTerms) {

    const variants =
        Array.isArray(product.variants)
            ? product.variants
            : [];

    function variantMatchesTerm(
        variant,
        term
    ) {

        const color =
            normalizeSearchText(
                variant.color
            );

        const size =
            normalizeSearchText(
                variant.size
            );

        // Tamanho
        if (size === term) {
            return true;
        }

        // Cor
        if (
            color &&
            (
                color === term ||
                color.includes(term) ||
                term.includes(color)
            )
        ) {
            return true;
        }

        return false;
    }

    const variantTerms =
        searchTerms.filter(
            term =>
                variants.some(
                    variant =>
                        variantMatchesTerm(
                            variant,
                            term
                        )
                )
        );

    const productTerms =
        searchTerms.filter(
            term =>
                !variantTerms.includes(term)
        );

    const productTermsMatch =
        productTerms.every(
            term =>
                productText.includes(term)
        );

    const variantTermsMatch =
        variantTerms.length === 0 ||
        variants.some(
            variant =>
                variantTerms.every(
                    term =>
                        variantMatchesTerm(
                            variant,
                            term
                        )
                )
        );

    return (
        productTermsMatch &&
        variantTermsMatch
    );
}
    // --------------------------------------------------
    // 1. CORRESPONDÊNCIA DIRETA
    // --------------------------------------------------

    // --------------------------------------------------
// 1. CORRESPONDÊNCIA DIRETA
// --------------------------------------------------

const directMatch =
    hasMultipleSearchTerms
        ? allSearchTermsMatch(productText)
        : searchTerms.some(
            term =>
                productText.includes(term)
        );


    if (directMatch) {

        return true;

    }


    // --------------------------------------------------
    // 2. PESQUISA POR INTENÇÃO
    // --------------------------------------------------

    for (
        const groupName in searchGroups
    ) {

        const groupTerms =
            searchGroups[groupName];


        // O cliente está procurando esta intenção?
        const userWantsGroup =
            containsAny(
                normalizedSearch,
                groupTerms
            );


        if (!userWantsGroup) {

            continue;

        }


        // O produto possui essa intenção?
        if (
            containsAny(
                productText,
                groupTerms
            )
        ) {

            return true;

        }

    }


    // --------------------------------------------------
    // 3. CATEGORIA INTELIGENTE
    // --------------------------------------------------

    const category =
        normalizeSearchText(
            product.category
        );


    if (
        normalizedSearch.includes(
            category
        )
        &&
        category
    ) {

        return true;

    }


    // --------------------------------------------------
    // 4. DESCRIÇÃO
    // --------------------------------------------------

    const description =
        normalizeSearchText(
            product.description
        );


    if (
        searchTerms.some(
            term =>
                description.includes(term)
        )
    ) {

        return true;

    }


    // --------------------------------------------------
    // 5. NOME DO PRODUTO
    // --------------------------------------------------

    const productName =
        normalizeSearchText(
            product.name
        );


    if (
        searchTerms.some(
            term =>
                productName.includes(term)
        )
    ) {

        return true;

    }


    // --------------------------------------------------
    // NADA ENCONTRADO
    // --------------------------------------------------

    return false;

}
// ======================================================
// RJ7 — SUGESTÕES INTELIGENTES DE PESQUISA
// ======================================================

const rj7SearchBox =
    document.querySelector(".shop-search");

const rj7SearchInput =
    document.getElementById("searchInput");

let rj7SuggestionsBox = null;


// ======================================================
// CRIAR ÁREA DE SUGESTÕES
// ======================================================

if (
    rj7SearchBox &&
    rj7SearchInput
) {

    rj7SuggestionsBox =
        document.createElement("div");

    rj7SuggestionsBox.className =
        "rj7-search-suggestions";

    rj7SuggestionsBox.setAttribute(
        "role",
        "listbox"
    );

    rj7SearchBox.appendChild(
        rj7SuggestionsBox
    );


    // ==================================================
    // SUGESTÕES
    // ==================================================

    rj7SearchInput.addEventListener(
        "input",
        function () {

            const value =
                normalizeSearchText(
                    this.value
                );

            rj7SuggestionsBox.innerHTML =
                "";

            if (!value) {

                rj7SuggestionsBox
                    .classList.remove(
                        "active"
                    );

                return;
            }

            const suggestions = [];


// ------------------------------------------
// INTENÇÕES
// ------------------------------------------

const intelligentSuggestions = [

    {
        label: "Sport",
        keywords: [
            "sport",
            "esportivo",
            "esportiva",
            "treino",
            "treinar",
            "academia",
            "fitness",
            "gym",
            "corrida"
        ]
    },

    {
        label: "Premium",
        keywords: [
            "premium",
            "luxo",
            "elegante",
            "elegancia",
            "sofisticado",
            "sofisticada",
            "classe"
        ]
    },

    {
        label: "Casual",
        keywords: [
            "casual",
            "simples",
            "everyday",
            "confortavel",
            "conforto",
            "dia a dia"
        ]
    },

    {
        label: "Minimal",
        keywords: [
            "minimal",
            "minimalista",
            "clean",
            "basico",
            "basica"
        ]
    },

    {
        label: "Night",
        keywords: [
            "night",
            "noite",
            "sair",
            "saida",
            "festa",
            "jantar",
            "balada",
            "evento"
        ]
    },

    {
        label: "Black",
        keywords: [
            "black",
            "preto",
            "preta",
            "pretos",
            "pretas"
        ]
    },

    {
        label: "White",
        keywords: [
            "white",
            "branco",
            "branca",
            "brancos",
            "brancas"
        ]
    },

    {
        label: "Grey",
        keywords: [
            "grey",
            "gray",
            "cinza",
            "cinzento",
            "cinzenta"
        ]
    },

    {
        label: "T-Shirts",
        keywords: [
            "tshirt",
            "t-shirt",
            "tshirts",
            "tee",
            "tees",
            "camiseta",
            "camisetas",
            "camisa",
            "camisas"
        ]
    },

    {
        label: "Hoodies",
        keywords: [
            "hood",
            "hoodie",
            "hoodies",
            "moletom",
            "moletons",
            "sweatshirt",
            "casaco"
        ]
    },

    {
        label: "Calças",
        keywords: [
            "calca",
            "calcas",
            "pants",
            "trouser",
            "trousers"
        ]
    },

    {
        label: "Ténis",
        keywords: [
            "tenis",
            "tens",
            "sapatilha",
            "sapatilhas",
            "sneaker",
            "sneakers"
        ]
    },

    {
        label: "Bonés",
        keywords: [
            "bone",
            "boné",
            "bones",
            "bonés",
            "cap",
            "caps"
        ]
    },

    {
        label: "Toucas",
        keywords: [
            "touca",
            "toucas",
            "beanie",
            "beanies"
        ]
    }

];


            intelligentSuggestions.forEach(
                suggestion => {

                    const match =
                        suggestion.keywords.some(
                            keyword =>
                                normalizeSearchText(
                                    keyword
                                ).includes(value) ||
                                value.includes(
                                    normalizeSearchText(
                                        keyword
                                    )
                                )
                        );


                    if (
                        match &&
                        suggestions.length < 5
                    ) {

                        suggestions.push(
                            suggestion.label
                        );

                    }

                }
            );


// ------------------------------------------
// PRODUTOS REAIS
// ------------------------------------------

if (
    Array.isArray(products)
) {

    products.forEach(
        product => {

            if (
                suggestions.length >= 5
            ) {
                return;
            }

            const productSearchText =
                normalizeSearchText(
                    [
                        product.name,
                        product.brand,
                        product.category,
                        product.subcategory,
                        product.department,
                        product.gender
                    ]
                        .filter(Boolean)
                        .join(" ")
                );

            if (
                productSearchText.includes(
                    value
                ) &&
                !suggestions.includes(
                    product.name
                )
            ) {

                suggestions.push(
                    product.name
                );

            }

        }
    );

}


            // ------------------------------------------
            // MOSTRAR SUGESTÕES
            // ------------------------------------------

            suggestions.forEach(
                suggestion => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";

                    button.className =
                        "rj7-search-suggestion";

                    button.innerHTML = `

                        <i class="fa-solid fa-magnifying-glass"></i>

                        <span>
                            ${suggestion}
                        </span>

                    `;


                    button.addEventListener(
                        "click",
                        function () {

                            rj7SearchInput.value =
                                suggestion;


                            rj7Filters.search =
                                suggestion;


                            applyRJ7Filters();


                            rj7SuggestionsBox
                                .classList.remove(
                                    "active"
                                );

                        }
                    );


                    rj7SuggestionsBox
                        .appendChild(
                            button
                        );

                }
            );


            if (
                suggestions.length
            ) {

                rj7SuggestionsBox
                    .classList.add(
                        "active"
                    );

            } else {

                rj7SuggestionsBox
                    .classList.remove(
                        "active"
                    );

            }

        }
    );


    // ==================================================
    // FECHAR AO CLICAR FORA
    // ==================================================

    document.addEventListener(
        "click",
        function (event) {

            if (
                !rj7SearchBox.contains(
                    event.target
                )
            ) {

                rj7SuggestionsBox
                    .classList.remove(
                        "active"
                    );

            }

        }
    );

}

// ======================================================
// MOTOR PRINCIPAL DE FILTROS
// ======================================================

function applyRJ7Filters() {

    let filteredProducts =
        [...products];


    // --------------------------------------------------
    // PESQUISA
    // --------------------------------------------------

    filteredProducts =
        filteredProducts.filter(
            product =>
                productMatchesSearch(
                    product,
                    rj7Filters.search
                )
        );


    // --------------------------------------------------
    // CATEGORIA
    // --------------------------------------------------

    if (
        rj7Filters.category !==
        "all"
    ) {

        filteredProducts =
            filteredProducts.filter(
                product =>

                    normalizeSearchText(
                        product.category
                    ) ===
                    normalizeSearchText(
                        rj7Filters.category
                    )
            );

    }


    // --------------------------------------------------
    // COR
    // --------------------------------------------------

    if (
        rj7Filters.color !==
        "all"
    ) {

        filteredProducts =
            filteredProducts.filter(
                product =>

                    normalizeSearchText(
                        product.color
                    ) ===
                    normalizeSearchText(
                        rj7Filters.color
                    )
            );

    }


    // --------------------------------------------------
    // TAMANHO
    // --------------------------------------------------

    if (
        rj7Filters.size !==
        "all"
    ) {

        filteredProducts =
            filteredProducts.filter(
                product =>

                    normalizeSearchText(
                        product.size
                    ) ===
                    normalizeSearchText(
                        rj7Filters.size
                    )
            );

    }


    // --------------------------------------------------
    // DISPONIBILIDADE
    // --------------------------------------------------

    if (
        rj7Filters.availability ===
        "available"
    ) {

        filteredProducts =
            filteredProducts.filter(
                product =>
                    Number(
                        product.stock
                    ) > 0
            );

    }


    if (
        rj7Filters.availability ===
        "out"
    ) {

        filteredProducts =
            filteredProducts.filter(
                product =>
                    Number(
                        product.stock
                    ) <= 0
            );

    }


    // --------------------------------------------------
    // PREÇO MÍNIMO
    // --------------------------------------------------

    filteredProducts =
        filteredProducts.filter(
            product =>

                Number(
                    product.price
                ) >=
                Number(
                    rj7Filters.minPrice
                )
        );


    // --------------------------------------------------
    // PREÇO MÁXIMO
    // --------------------------------------------------

    filteredProducts =
        filteredProducts.filter(
            product =>

                Number(
                    product.price
                ) <=
                Number(
                    rj7Filters.maxPrice
                )
        );


    // ==================================================
    // ORDENAÇÃO
    // ==================================================

    if (
        rj7Filters.sort ===
        "price-low"
    ) {

        filteredProducts.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );

    }


    if (
        rj7Filters.sort ===
        "price-high"
    ) {

        filteredProducts.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );

    }


    if (
        rj7Filters.sort ===
        "newest"
    ) {

        filteredProducts.sort(
            (a, b) =>
                new Date(
                    b.created_at || 0
                ) -
                new Date(
                    a.created_at || 0
                )
        );

    }


    // ==================================================
    // MOSTRAR RESULTADOS
    // ==================================================

    renderProducts(
        filteredProducts
    );

}


// ======================================================
// PESQUISA
// ======================================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            rj7Filters.search =
                this.value;

            applyRJ7Filters();

        }
    );

}


// ======================================================
// CATEGORIAS
// ======================================================

const categoryButtons =
    document.querySelectorAll(
        ".category-filter button"
    );


categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                categoryButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                this.classList.add(
                    "active"
                );


                rj7Filters.category =
                    this.dataset.category;


                applyRJ7Filters();

            }
        );

    }
);
// ======================================================
// 8.1. RJ7 — INTERFACE DOS FILTROS
// ======================================================

const openFilters =
    document.getElementById("openFilters");

const closeFilters =
    document.getElementById("closeFilters");

const filtersPanel =
    document.getElementById("filtersPanel");

const clearFilters =
    document.getElementById("clearFilters");

const applyFilters =
    document.getElementById("applyFilters");


// ======================================================
// CONTADOR DE FILTROS
// ======================================================

function updateRJ7FilterCount() {

    if (!openFilters) {
        return;
    }


    let count = 0;


    // Pesquisa
    if (
        rj7Filters.search &&
        rj7Filters.search.trim()
    ) {

        count++;

    }


    // Categoria
    if (
        rj7Filters.category !== "all"
    ) {

        count++;

    }


    // Cor
    if (
        rj7Filters.color !== "all"
    ) {

        count++;

    }


    // Tamanho
    if (
        rj7Filters.size !== "all"
    ) {

        count++;

    }


    // Disponibilidade
    if (
        rj7Filters.availability !== "all"
    ) {

        count++;

    }


    // Preço mínimo
    if (
        Number(rj7Filters.minPrice) > 0
    ) {

        count++;

    }


    // Preço máximo
    if (
        rj7Filters.maxPrice !== Infinity
    ) {

        count++;

    }


    const text =
        count > 0
            ? `Filtros (${count})`
            : "Filtros";


    openFilters.innerHTML = `
        <i class="fa-solid fa-sliders"></i>
        <span>${text}</span>
    `;

}


// ======================================================
// ABRIR FILTROS
// ======================================================

if (
    openFilters &&
    filtersPanel
) {

    openFilters.addEventListener(
        "click",
        function () {

            filtersPanel.classList.add(
                "active"
            );

        }
    );

}


// ======================================================
// FECHAR FILTROS
// ======================================================

if (
    closeFilters &&
    filtersPanel
) {

    closeFilters.addEventListener(
        "click",
        function () {

            filtersPanel.classList.remove(
                "active"
            );

        }
    );

}


// ======================================================
// CATEGORIA
// ======================================================

document
    .querySelectorAll(
        "[data-filter-category]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            "[data-filter-category]"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    this.classList.add(
                        "active"
                    );


                    rj7Filters.category =
                        this.dataset.filterCategory;


                    updateRJ7FilterCount();

                }
            );

        }
    );


// ======================================================
// DISPONIBILIDADE
// ======================================================

document
    .querySelectorAll(
        "[data-availability]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            "[data-availability]"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    this.classList.add(
                        "active"
                    );


                    rj7Filters.availability =
                        this.dataset.availability;


                    updateRJ7FilterCount();

                }
            );

}
);


// ======================================================
// APLICAR FILTROS
// ======================================================

if (applyFilters) {

    applyFilters.addEventListener(
        "click",
        function () {

            const minPrice =
                document.getElementById(
                    "minPrice"
                );

            const maxPrice =
                document.getElementById(
                    "maxPrice"
                );

            const sortProducts =
                document.getElementById(
                    "sortProducts"
                );


            // ------------------------------------------
            // PREÇO MÍNIMO
            // ------------------------------------------

            rj7Filters.minPrice =
                minPrice?.value
                    ? Number(
                        minPrice.value
                    )
                    : 0;


            // ------------------------------------------
            // PREÇO MÁXIMO
            // ------------------------------------------

            rj7Filters.maxPrice =
                maxPrice?.value
                    ? Number(
                        maxPrice.value
                    )
                    : Infinity;


            // ------------------------------------------
            // ORDENAÇÃO
            // ------------------------------------------

            rj7Filters.sort =
                sortProducts?.value ||
                "relevance";


// ------------------------------------------
// APLICAR TUDO
// ------------------------------------------

applyRJ7VariantAwareFilters();
            // ------------------------------------------
            // ATUALIZAR CONTADOR
            // ------------------------------------------

            updateRJ7FilterCount();


            // ------------------------------------------
            // FECHAR PAINEL
            // ------------------------------------------

            if (filtersPanel) {

                filtersPanel.classList.remove(
                    "active"
                );

            }

        }
    );

}


// ======================================================
// LIMPAR TODOS OS FILTROS
// ======================================================

if (clearFilters) {

    clearFilters.addEventListener(
        "click",
        function () {

            // ------------------------------------------
            // RESETAR ESTADO
            // ------------------------------------------

            rj7Filters.search =
                "";

            rj7Filters.category =
                "all";

            rj7Filters.color =
                "all";

            rj7Filters.size =
                "all";

            rj7Filters.availability =
                "all";

            rj7Filters.minPrice =
                0;

            rj7Filters.maxPrice =
                Infinity;

            rj7Filters.sort =
                "relevance";


            // ------------------------------------------
            // LIMPAR PESQUISA
            // ------------------------------------------

            if (searchInput) {

                searchInput.value =
                    "";

            }


            // ------------------------------------------
            // LIMPAR PREÇOS
            // ------------------------------------------

            const minPrice =
                document.getElementById(
                    "minPrice"
                );

            const maxPrice =
                document.getElementById(
                    "maxPrice"
                );

            const sortProducts =
                document.getElementById(
                    "sortProducts"
                );


            if (minPrice) {

                minPrice.value =
                    "";

            }


            if (maxPrice) {

                maxPrice.value =
                    "";

            }


            if (sortProducts) {

                sortProducts.value =
                    "relevance";

            }


            // ------------------------------------------
            // REMOVER ESTADOS VISUAIS
            // ------------------------------------------

            document
                .querySelectorAll(
                    "[data-filter-category], [data-availability]"
                )
                .forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


            // ------------------------------------------
            // VOLTAR PARA TODOS
            // ------------------------------------------

            const allCategory =
                document.querySelector(
                    '[data-filter-category="all"]'
                );


            if (allCategory) {

                allCategory.classList.add(
                    "active"
                );

            }


            const allAvailability =
                document.querySelector(
                    '[data-availability="all"]'
                );


            if (allAvailability) {

                allAvailability.classList.add(
                    "active"
                );

            }


            // ------------------------------------------
            // ATUALIZAR PRODUTOS
            // ------------------------------------------

            applyRJ7Filters();


            // ------------------------------------------
            // ATUALIZAR CONTADOR
            // ------------------------------------------

            updateRJ7FilterCount();

        }
    );

}


// ======================================================
// PESQUISA → ATUALIZAR CONTADOR
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            rj7Filters.search =
                this.value;


            applyRJ7Filters();


            updateRJ7FilterCount();

        }
    );

}


// ======================================================
// ESTADO INICIAL
// ======================================================

updateRJ7FilterCount();
// ======================================================
// 8.2. RJ7 — CORES, TAMANHOS E VARIANTES
// ======================================================

const colorFilterOptions =
    document.getElementById("colorFilterOptions");

const sizeFilterOptions =
    document.getElementById("sizeFilterOptions");


// ======================================================
// VARIANTES DOS PRODUTOS
// ======================================================

let rj7ProductVariants = [];


// ======================================================
// NORMALIZAR COR
// ======================================================

function normalizeRJ7Color(color) {

    return normalizeSearchText(
        String(color || "")
    )
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


// ======================================================
// GRUPOS DE CORES
// ======================================================

const RJ7_COLOR_GROUPS = {

    black: [
        "black",
        "preto",
        "preta",
        "pretos",
        "pretas"
    ],

    white: [
        "white",
        "branco",
        "branca",
        "brancos",
        "brancas"
    ],

    grey: [
        "grey",
        "gray",
        "cinza",
        "cinzento",
        "cinzenta"
    ],

    navy: [
        "navy",
        "azul marinho",
        "azul escuro",
        "azul-marinho",
        "azul-escuro"
    ]

};


// ======================================================
// VERIFICAR SE DUAS CORES CORRESPONDEM
// ======================================================

function rj7ColorMatches(
    productColor,
    selectedColor
) {

    const product =
        normalizeRJ7Color(
            productColor
        );

    const selected =
        normalizeRJ7Color(
            selectedColor
        );


    if (!product || !selected) {

        return false;

    }


    // ------------------------------------------
    // COR EXATA
    // ------------------------------------------

    if (product === selected) {

        return true;

    }


    // ------------------------------------------
    // GRUPO DA COR
    // ------------------------------------------

    const group =
        RJ7_COLOR_GROUPS[selected];


    if (!group) {

        return false;

    }


    return group.some(
        color =>
            normalizeRJ7Color(color) ===
            product
    );

}


// ======================================================
// CARREGAR VARIANTES DO SUPABASE
// ======================================================

async function loadRJ7VariantFilters() {

    try {

        const {
            data,
            error
        } = await supabase
            .from("product_variants")
            .select(
                "product_id, color, size, stock"
            );


        if (error) {

            console.error(
                "RJ7 — erro ao carregar variantes:",
                error
            );

            return;

        }


        rj7ProductVariants =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "RJ7 — variantes carregadas:",
            rj7ProductVariants
        );


        renderRJ7VariantFilters();

    } catch (error) {

        console.error(
            "RJ7 — erro inesperado:",
            error
        );

    }

}


// ======================================================
// CRIAR FILTROS DE COR E TAMANHO
// ======================================================

function renderRJ7VariantFilters() {

    if (
        !colorFilterOptions ||
        !sizeFilterOptions
    ) {

        return;

    }


    // ==================================================
    // CORES EXISTENTES NAS VARIANTES
    // ==================================================

    const colors =
        [
            ...new Set(
                rj7ProductVariants
                    .map(
                        variant =>
                            variant.color
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    colorFilterOptions.innerHTML = `

        <button
            type="button"
            data-filter-color="all"
            class="active"
        >
            Todas
        </button>

    `;


    colors.forEach(
        color => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.dataset.filterColor =
                color;


            button.textContent =
                color;


            colorFilterOptions.appendChild(
                button
            );

        }
    );


    // ==================================================
    // TAMANHOS EXISTENTES NAS VARIANTES
    // ==================================================

    const sizes =
        [
            ...new Set(
                rj7ProductVariants
                    .map(
                        variant =>
                            variant.size
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b),
                    "pt"
                )
        );


    sizeFilterOptions.innerHTML = `

        <button
            type="button"
            data-filter-size="all"
            class="active"
        >
            Todos
        </button>

    `;


    sizes.forEach(
        size => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.dataset.filterSize =
                size;


            button.textContent =
                size;


            sizeFilterOptions.appendChild(
                button
            );

        }
    );


    setupRJ7VariantFilterEvents();

}
// ======================================================
// VERIFICAR SE PRODUTO TEM A VARIANTE ESCOLHIDA
// ======================================================

function productHasSelectedVariant(product) {

    const variants = product.variants || [];

    if (!variants.length) {
        return false;
    }

    let matchingVariants = variants;


    // ==================================================
    // COR
    // ==================================================

    if (rj7Filters.color !== "all") {

        matchingVariants =
            matchingVariants.filter(
                variant =>
                    rj7ColorMatches(
                        variant.color,
                        rj7Filters.color
                    )
            );

    }


    // ==================================================
    // TAMANHO
    // ==================================================

    if (rj7Filters.size !== "all") {

        matchingVariants =
            matchingVariants.filter(
                variant =>
                    normalizeSearchText(
                        variant.size
                    ) ===
                    normalizeSearchText(
                        rj7Filters.size
                    )
            );

    }


    // ==================================================
    // DISPONIBILIDADE
    // ==================================================

    if (rj7Filters.availability === "available") {

        matchingVariants =
            matchingVariants.filter(
                variant =>
                    Number(variant.stock) > 0
            );

    }


    if (rj7Filters.availability === "out") {

        matchingVariants =
            matchingVariants.filter(
                variant =>
                    Number(variant.stock) <= 0
            );

    }


    return matchingVariants.length > 0;
}
// ======================================================
// FILTROS COM VARIANTES
// ======================================================

function applyRJ7VariantAwareFilters() {

    let filteredProducts =
        [...products];


    // ==================================================
    // PESQUISA
    // ==================================================

    filteredProducts =
        filteredProducts.filter(
            product =>
                productMatchesSearch(
                    product,
                    rj7Filters.search
                )
        );


    // ==================================================
    // CATEGORIA
    // ==================================================

    if (
        rj7Filters.category !==
        "all"
    ) {

        filteredProducts =
            filteredProducts.filter(
                product =>

                    normalizeSearchText(
                        product.category
                    ) ===
                    normalizeSearchText(
                        rj7Filters.category
                    )
            );

    }


    // ==================================================
    // VARIANTES
    // ==================================================

    if (
        rj7Filters.color !== "all" ||
        rj7Filters.size !== "all" ||
        rj7Filters.availability !== "all"
    ) {

        filteredProducts =
            filteredProducts.filter(
                product =>
                    productHasSelectedVariant(
                        product
                    )
            );

    }


    // ==================================================
    // PREÇO MÍNIMO
    // ==================================================

    filteredProducts =
        filteredProducts.filter(
            product =>
                Number(product.price) >=
                Number(rj7Filters.minPrice)
        );


    // ==================================================
    // PREÇO MÁXIMO
    // ==================================================

    filteredProducts =
        filteredProducts.filter(
            product =>
                Number(product.price) <=
                Number(rj7Filters.maxPrice)
        );


    // ==================================================
    // ORDENAÇÃO
    // ==================================================

    if (
        rj7Filters.sort ===
        "price-low"
    ) {

        filteredProducts.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );

    }


    if (
        rj7Filters.sort ===
        "price-high"
    ) {

        filteredProducts.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );

    }


    if (
        rj7Filters.sort ===
        "newest"
    ) {

        filteredProducts.sort(
            (a, b) =>
                new Date(
                    b.created_at || 0
                ) -
                new Date(
                    a.created_at || 0
                )
        );

    }


    // ==================================================
    // MOSTRAR PRODUTOS
    // ==================================================

    renderProducts(
        filteredProducts
    );


    updateRJ7FilterCount();

}


// ======================================================
// EVENTOS DOS FILTROS DE COR E TAMANHO
// ======================================================

function setupRJ7VariantFilterEvents() {


    // ==================================================
    // COR
    // ==================================================

    document
        .querySelectorAll(
            "[data-filter-color]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {


                        document
                            .querySelectorAll(
                                "[data-filter-color]"
                            )
                            .forEach(
                                item =>
                                    item.classList
                                        .remove(
                                            "active"
                                        )
                            );


                        this.classList.add(
                            "active"
                        );


                        rj7Filters.color =
                            this.dataset.filterColor;


                        applyRJ7VariantAwareFilters();

                    }
                );

            }
        );


    // ==================================================
    // TAMANHO
    // ==================================================

    document
        .querySelectorAll(
            "[data-filter-size]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {


                        document
                            .querySelectorAll(
                                "[data-filter-size]"
                            )
                            .forEach(
                                item =>
                                    item.classList
                                        .remove(
                                            "active"
                                        )
                            );


                        this.classList.add(
                            "active"
                        );


                        rj7Filters.size =
                            this.dataset.filterSize;


                        applyRJ7VariantAwareFilters();

                    }
                );

            }
        );

}


// ======================================================
// 8.3. RJ7 — COLOR MATCH
// ======================================================

const rj7ColorMatchOptions =
    document.querySelectorAll(
        "[data-color-match]"
    );


rj7ColorMatchOptions.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {


                // ------------------------------------------
                // ATUALIZAR BOTÃO ATIVO
                // ------------------------------------------

                rj7ColorMatchOptions.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                this.classList.add(
                    "active"
                );


                // ------------------------------------------
                // COR ESCOLHIDA
                // ------------------------------------------

                const selectedColor =
                    this.dataset.colorMatch;


                // ------------------------------------------
                // TODAS
                // ------------------------------------------

                if (
                    selectedColor ===
                    "all"
                ) {

                    rj7Filters.color =
                        "all";


                } else {

                    rj7Filters.color =
                        selectedColor;

                }


                // ------------------------------------------
                // APLICAR FILTROS
                // ------------------------------------------

                applyRJ7VariantAwareFilters();

            }
        );

    }
);


// ======================================================
// INICIAR FILTROS DE VARIANTES
// ======================================================

loadRJ7VariantFilters();
// ======================================================
// 10. MENU
// ======================================================

const menuBtn =
    document.getElementById("menuBtn");

const closeMenu =
    document.getElementById("closeMenu");

const sideMenu =
    document.getElementById("sideMenu");


if (menuBtn && sideMenu) {

    menuBtn.addEventListener(
        "click",
        function () {

            sideMenu.classList.add(
                "active"
            );

        }
    );

}


if (closeMenu && sideMenu) {

    closeMenu.addEventListener(
        "click",
        function () {

            sideMenu.classList.remove(
                "active"
            );

        }
    );

}


// ======================================================
// MINHA CONTA — LOGIN OU CONTA
// ======================================================

const accountLinks =
    document.querySelectorAll(
        'a[href*="login.html"]'
    );


accountLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();


                try {

                    const {
                        data,
                        error
                    } =
                        await supabase.auth.getSession();


                    if (error) {

                        console.error(
                            "RJ7 ACCOUNT — erro ao verificar sessão:",
                            error
                        );

                        // Sem conseguir verificar:
                        // vai para o login normalmente
                        window.location.href =
                            this.href;

                        return;
                    }


                    // ==================================================
                    // UTILIZADOR JÁ ESTÁ LOGADO
                    // ==================================================

                    if (data?.session) {

                        const dashboardPath =
                            window.location.pathname.includes(
                                "/pages/"
                            )
                                ? "dashboard.html"
                                : "pages/dashboard.html";


                        window.location.href =
                            dashboardPath;

                        return;
                    }


                    // ==================================================
                    // UTILIZADOR NÃO ESTÁ LOGADO
                    // ==================================================

                    window.location.href =
                        this.href;


                } catch (error) {

                    console.error(
                        "RJ7 ACCOUNT — erro inesperado:",
                        error
                    );


                    // Em caso de erro,
                    // mantém o comportamento normal
                    window.location.href =
                        this.href;

                }

            }
        );

    }
);
// ======================================================
// 10.1. RJ7 — CARROSSEL DA HOMEPAGE
// ======================================================

const homeBanners =
    document.querySelector(".home-banners");

const homeBannerItems =
    document.querySelectorAll(".home-banner");


let currentBanner =
    0;

let bannerInterval;


// ------------------------------------------------------
// VERIFICAR SE EXISTEM BANNERS
// ------------------------------------------------------

if (
    homeBanners &&
    homeBannerItems.length > 1
) {

    // --------------------------------------------------
    // CRIAR CONTROLOS
    // --------------------------------------------------

    const bannerControls =
        document.createElement("div");

    bannerControls.className =
        "rj7-banner-controls";


    // --------------------------------------------------
    // BOTÃO ANTERIOR
    // --------------------------------------------------

    const previousButton =
        document.createElement("button");

    previousButton.type =
        "button";

    previousButton.className =
        "rj7-banner-arrow rj7-banner-prev";

    previousButton.innerHTML =
        "&#10094;";

    previousButton.setAttribute(
        "aria-label",
        "Banner anterior"
    );


    // --------------------------------------------------
    // INDICADORES
    // --------------------------------------------------

    const bannerDots =
        document.createElement("div");

    bannerDots.className =
        "rj7-banner-dots";


    homeBannerItems.forEach(
        function (banner, index) {

            const dot =
                document.createElement("button");

            dot.type =
                "button";

            dot.className =
                "rj7-banner-dot";

            dot.dataset.index =
                index;

            dot.setAttribute(
                "aria-label",
                `Ir para o banner ${index + 1}`
            );


            if (index === 0) {

                dot.classList.add(
                    "active"
                );

            }


            dot.addEventListener(
                "click",
                function () {

                    goToBanner(
                        Number(
                            this.dataset.index
                        )
                    );

                    restartBanner();

                }
            );


            bannerDots.appendChild(dot);

        }
    );


    // --------------------------------------------------
    // BOTÃO SEGUINTE
    // --------------------------------------------------

    const nextButton =
        document.createElement("button");

    nextButton.type =
        "button";

    nextButton.className =
        "rj7-banner-arrow rj7-banner-next";

    nextButton.innerHTML =
        "&#10095;";

    nextButton.setAttribute(
        "aria-label",
        "Próximo banner"
    );


    // --------------------------------------------------
    // MONTAR CONTROLOS
    // --------------------------------------------------

    bannerControls.appendChild(
        previousButton
    );

    bannerControls.appendChild(
        bannerDots
    );

    bannerControls.appendChild(
        nextButton
    );


    homeBanners.appendChild(
        bannerControls
    );


    // --------------------------------------------------
    // MOSTRAR BANNER
    // --------------------------------------------------

    function goToBanner(index) {

        if (
            index < 0
        ) {

            index =
                homeBannerItems.length - 1;

        }


        if (
            index >=
            homeBannerItems.length
        ) {

            index = 0;

        }


        currentBanner =
            index;


        homeBannerItems.forEach(
            function (banner, bannerIndex) {

                banner.classList.toggle(
                    "active",
                    bannerIndex === currentBanner
                );

            }
        );


        bannerDots
            .querySelectorAll(
                ".rj7-banner-dot"
            )
            .forEach(
                function (dot, dotIndex) {

                    dot.classList.toggle(
                        "active",
                        dotIndex === currentBanner
                    );

                }
            );

    }


    // --------------------------------------------------
    // ANTERIOR
    // --------------------------------------------------

    previousButton.addEventListener(
        "click",
        function () {

            goToBanner(
                currentBanner - 1
            );

            restartBanner();

        }
    );


    // --------------------------------------------------
    // SEGUINTE
    // --------------------------------------------------

    nextButton.addEventListener(
        "click",
        function () {

            goToBanner(
                currentBanner + 1
            );

            restartBanner();

        }
    );


    // --------------------------------------------------
    // TROCA AUTOMÁTICA
    // --------------------------------------------------

    function startBanner() {

        bannerInterval =
            setInterval(
                function () {

                    goToBanner(
                        currentBanner + 1
                    );

                },
                5000
            );

    }


    // --------------------------------------------------
    // REINICIAR CONTADOR
    // --------------------------------------------------

    function restartBanner() {

        clearInterval(
            bannerInterval
        );

        startBanner();

    }


    // --------------------------------------------------
    // SWIPE NO TELEMÓVEL
    // --------------------------------------------------

    let touchStartX =
        0;

    let touchEndX =
        0;


    homeBanners.addEventListener(
        "touchstart",
        function (event) {

            touchStartX =
                event.touches[0].clientX;

        },
        {
            passive: true
        }
    );


    homeBanners.addEventListener(
        "touchend",
        function (event) {

            touchEndX =
                event.changedTouches[0].clientX;


            const difference =
                touchStartX -
                touchEndX;


            if (
                Math.abs(difference) < 50
            ) {

                return;

            }


            if (
                difference > 0
            ) {

                goToBanner(
                    currentBanner + 1
                );

            } else {

                goToBanner(
                    currentBanner - 1
                );

            }


            restartBanner();

        },
        {
            passive: true
        }
    );


    // --------------------------------------------------
    // PAUSAR QUANDO O UTILIZADOR ESTÁ COM O RATO
    // --------------------------------------------------

    homeBanners.addEventListener(
        "mouseenter",
        function () {

            clearInterval(
                bannerInterval
            );

        }
    );


    homeBanners.addEventListener(
        "mouseleave",
        function () {

            startBanner();

        }
    );


    // --------------------------------------------------
    // INICIAR
    // --------------------------------------------------

    goToBanner(0);

    startBanner();

}

// ======================================================
// 11. PRODUTO INDIVIDUAL
// ======================================================

const selectedProduct =
    JSON.parse(
        localStorage.getItem(
            "RJ7_selectedProduct"
        )
    );
// ======================================================
// MOSTRAR INFORMAÇÕES DO PRODUTO
// ======================================================

const productImage =
    document.getElementById("productImage");

const productName =
    document.getElementById("productName");

const productPrice =
    document.getElementById("productPrice");

const productCategory =
    document.getElementById("productCategory");


if (selectedProduct) {

    // ------------------------------------------
    // IMAGEM
    // ------------------------------------------

    if (productImage) {

        productImage.src =
            getImagePath(selectedProduct);

        productImage.alt =
            selectedProduct.name || "Produto RJ7";

    }


    // ------------------------------------------
    // NOME
    // ------------------------------------------

    if (productName) {

        productName.textContent =
            selectedProduct.name || "Produto";

    }


    // ------------------------------------------
    // PREÇO
    // ------------------------------------------

    if (productPrice) {

        const price =
            Number(selectedProduct.price);


        console.log(
            "RJ7 — preço recebido:",
            selectedProduct.price
        );


        if (
            Number.isFinite(price) &&
            price > 0
        ) {

            productPrice.textContent =
                price.toLocaleString("pt-PT") +
                " Kz";

        } else {

            productPrice.textContent =
                "Preço indisponível";

        }

    }


    // ------------------------------------------
    // CATEGORIA
    // ------------------------------------------

    if (productCategory) {

        productCategory.textContent =
            selectedProduct.category || "RJ7";

    }

}

// ======================================================
// GALERIA DE IMAGENS DO PRODUTO
// ======================================================

const productGallery =
    document.getElementById(
        "productGallery"
    );

const productGalleryTrack =
    document.getElementById(
        "productGalleryTrack"
    );

const productGalleryDots =
    document.getElementById(
        "productGalleryDots"
    );


let productImages = [];


// ======================================================
// CARREGAR IMAGENS
// ======================================================

async function loadProductImages() {

    if (
        !selectedProduct ||
        !productGalleryTrack
    ) {
        return;
    }


    try {

        const {
            data: images,
            error
        } = await supabase

            .from("product_images")

            .select(
                "id, product_id, image_url, sort_order, created_at"
            )

            .eq(
                "product_id",
                selectedProduct.id
            )

            .order(
                "sort_order",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "RJ7 GALLERY — erro ao carregar imagens:",
                error
            );

            // Usar a imagem principal existente
            // caso não existam imagens na galeria.

            productImages = [
                selectedProduct.image
            ];

            renderProductGallery();

            return;
        }


        productImages =
            (images || []).map(
                image =>
                    image.image_url
            );


        // --------------------------------------------------
        // FALLBACK
        // --------------------------------------------------

        if (!productImages.length) {

            productImages = [
                selectedProduct.image
            ];

        }


        renderProductGallery();


    } catch (error) {

        console.error(
            "RJ7 GALLERY — erro inesperado:",
            error
        );


        productImages = [
            selectedProduct.image
        ];


        renderProductGallery();

    }

}


// ======================================================
// RENDERIZAR GALERIA
// ======================================================

function renderProductGallery() {

    if (!productGalleryTrack) {
        return;
    }


    productGalleryTrack.innerHTML = "";


    if (productGalleryDots) {

        productGalleryDots.innerHTML = "";

    }


    productImages.forEach(
        (image, index) => {


            // ----------------------------------------------
            // FOTO
            // ----------------------------------------------

            const slide =
                document.createElement(
                    "div"
                );


            slide.className =
                "rj7-gallery-slide";


            const img =
                document.createElement(
                    "img"
                );


            img.src =
                getImagePath({
                    image: image
                });


            img.alt =
                selectedProduct.name;


            img.loading =
                index === 0
                    ? "eager"
                    : "lazy";


            slide.appendChild(
                img
            );


            productGalleryTrack.appendChild(
                slide
            );


            // ----------------------------------------------
            // INDICADOR
            // ----------------------------------------------

            if (productGalleryDots) {

                const dot =
                    document.createElement(
                        "button"
                    );


                dot.type =
                    "button";


                dot.className =
                    "rj7-gallery-dot";


                if (index === 0) {

                    dot.classList.add(
                        "active"
                    );

                }


                dot.dataset.index =
                    index;


                dot.setAttribute(
                    "aria-label",
                    `Ver imagem ${index + 1}`
                );


                dot.addEventListener(
                    "click",
                    function () {

                        goToProductImage(
                            Number(
                                this.dataset.index
                            )
                        );

                    }
                );


                productGalleryDots.appendChild(
                    dot
                );

            }

        }
    );


    setupProductGallerySwipe();

}


// ======================================================
// IR PARA UMA IMAGEM
// ======================================================

let currentProductImage =
    0;


function goToProductImage(index) {

    if (
        !productGalleryTrack ||
        !productImages.length
    ) {
        return;
    }


    if (index < 0) {

        index =
            productImages.length - 1;

    }


    if (
        index >=
        productImages.length
    ) {

        index = 0;

    }


    currentProductImage =
        index;


    productGalleryTrack.style.transform =
        `translateX(-${index * 100}%)`;


    if (productGalleryDots) {

        productGalleryDots
            .querySelectorAll(
                ".rj7-gallery-dot"
            )
            .forEach(
                (dot, dotIndex) => {

                    dot.classList.toggle(
                        "active",
                        dotIndex === index
                    );

                }
            );

    }

}


// ======================================================
// SWIPE NO TELEFONE
// ======================================================

function setupProductGallerySwipe() {

    if (
        !productGallery ||
        productImages.length <= 1
    ) {
        return;
    }


    let startX = 0;
    let endX = 0;


    productGallery.addEventListener(
        "touchstart",
        function (event) {

            startX =
                event.touches[0].clientX;

        },
        {
            passive: true
        }
    );


    productGallery.addEventListener(
        "touchend",
        function (event) {

            endX =
                event.changedTouches[0].clientX;


            const difference =
                startX - endX;


            // Movimento muito pequeno
            if (
                Math.abs(difference) < 50
            ) {
                return;
            }


            // Deslizou para a esquerda
            if (difference > 0) {

                goToProductImage(
                    currentProductImage + 1
                );

            }


            // Deslizou para a direita
            else {

                goToProductImage(
                    currentProductImage - 1
                );

            }

        },
        {
            passive: true
        }
    );

}


// ======================================================
// INICIAR GALERIA
// ======================================================

if (selectedProduct) {

    loadProductImages();

}

// ======================================================
// 11.5. AVALIAÇÕES DO PRODUTO
// ======================================================

async function loadProductReviews() {

    const reviewsAverage =
        document.getElementById("reviewsAverage");

    const reviewsStars =
        document.getElementById("reviewsStars");

    const reviewsCount =
        document.getElementById("reviewsCount");

    const reviewsList =
        document.getElementById("reviewsList");


    // ------------------------------------------
    // VERIFICAR SE ESTAMOS NA PÁGINA DO PRODUTO
    // ------------------------------------------

    if (!selectedProduct || !reviewsList) {
        return;
    }


    try {

        const {
            data: reviews,
            error
        } = await supabase
            .from("product_reviews")
            .select(
                "id, product_id, user_id, rating, comment, created_at"
            )
            .eq(
                "product_id",
                selectedProduct.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "RJ7 REVIEWS — erro ao carregar avaliações:",
                error
            );

            reviewsList.innerHTML = `
                <p class="rj7-reviews-loading">
                    Não foi possível carregar as avaliações.
                </p>
            `;

            return;
        }


        const reviewData =
            reviews || [];


        // ------------------------------------------
        // NÚMERO DE AVALIAÇÕES
        // ------------------------------------------

        if (reviewsCount) {

            reviewsCount.textContent =
                reviewData.length === 1
                    ? "1 avaliação"
                    : `${reviewData.length} avaliações`;

        }


        // ------------------------------------------
        // SEM AVALIAÇÕES
        // ------------------------------------------

        if (!reviewData.length) {

            if (reviewsAverage) {
                reviewsAverage.textContent = "0,0";
            }

            if (reviewsStars) {
                reviewsStars.textContent = "☆☆☆☆☆";
            }

            reviewsList.innerHTML = `
                <p class="rj7-reviews-loading">
                    Ainda não existem avaliações para este produto.
                </p>
            `;

            return;
        }


        // ------------------------------------------
        // CALCULAR MÉDIA
        // ------------------------------------------

        const totalRating =
            reviewData.reduce(
                (sum, review) =>
                    sum + Number(review.rating),
                0
            );


        const average =
            totalRating / reviewData.length;


        if (reviewsAverage) {

            reviewsAverage.textContent =
                average.toFixed(1).replace(".", ",");

        }


        // ------------------------------------------
        // ESTRELAS DA MÉDIA
        // ------------------------------------------

        if (reviewsStars) {

            const roundedAverage =
                Math.round(average);


            reviewsStars.textContent =
                "★".repeat(roundedAverage) +
                "☆".repeat(5 - roundedAverage);

        }


        // ------------------------------------------
        // MOSTRAR AVALIAÇÕES
        // ------------------------------------------

        reviewsList.innerHTML = "";


        reviewData.forEach(review => {

            const rating =
                Number(review.rating);


            const stars =
                "★".repeat(rating) +
                "☆".repeat(5 - rating);


            const date =
                review.created_at
                    ? new Date(
                        review.created_at
                    ).toLocaleDateString(
                        "pt-PT"
                    )
                    : "";


            const comment =
                review.comment || "";


            reviewsList.innerHTML += `

                <article
                    class="rj7-review-card"
                >

                    <div class="rj7-review-card-top">

                        <div
                            class="rj7-review-card-stars"
                        >
                            ${stars}
                        </div>

                        <span>
                            ${date}
                        </span>

                    </div>


                    ${
                        comment
                            ? `
                                <p>
                                    ${comment}
                                </p>
                              `
                            : ""
                    }

                </article>

            `;

        });


        console.log(
            "RJ7 REVIEWS — avaliações carregadas:",
            reviewData
        );


    } catch (error) {

        console.error(
            "RJ7 REVIEWS — erro inesperado:",
            error
        );

        reviewsList.innerHTML = `
            <p class="rj7-reviews-loading">
                Ocorreu um erro ao carregar as avaliações.
            </p>
        `;

    }

}
// ======================================================
// 11.7. FAVORITOS DO PRODUTO
// ======================================================

async function updateFavoriteButton() {

    const favoriteButton =
        document.getElementById("addProductFavorite");

    if (!favoriteButton || !selectedProduct) {
        return;
    }

    try {

        const {
            data: {
                user
            }
        } = await supabase.auth.getUser();


        if (!user) {

            favoriteButton.textContent =
                "♡ Favorito";

            return;

        }


        const {
            data: favorite,
            error
        } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq(
                "product_id",
                selectedProduct.id
            )
            .maybeSingle();


        if (error) {

            console.error(
                "RJ7 FAVORITOS — erro ao verificar favorito:",
                error
            );

            return;
        }


        if (favorite) {

            favoriteButton.textContent =
                "♥ Favorito";

            favoriteButton.classList.add(
                "active"
            );

        } else {

            favoriteButton.textContent =
                "♡ Favorito";

            favoriteButton.classList.remove(
                "active"
            );

        }

    } catch (error) {

        console.error(
            "RJ7 FAVORITOS — erro inesperado:",
            error
        );

    }

}


// ======================================================
// ADICIONAR / REMOVER FAVORITO
// ======================================================

const favoriteButton =
    document.getElementById(
        "addProductFavorite"
    );


if (favoriteButton) {

    favoriteButton.addEventListener(
        "click",
        async function () {

            if (!selectedProduct) {

                rj7Notify(
                    "Produto não encontrado."
                );

                return;

            }


            const {
                data: {
                    user
                }
            } = await supabase.auth.getUser();


            if (!user) {

                rj7Notify(
                    "Inicia sessão para adicionar produtos aos favoritos."
                );

                window.location.href =
                    "login.html";

                return;

            }


            const {
                data: existingFavorite,
                error: checkError
            } = await supabase
                .from("favorites")
                .select("id")
                .eq("user_id", user.id)
                .eq(
                    "product_id",
                    selectedProduct.id
                )
                .maybeSingle();


            if (checkError) {

                console.error(
                    "RJ7 FAVORITOS — erro ao verificar:",
                    checkError
                );

                rj7Notify(
                    "Não foi possível verificar os favoritos."
                );

                return;

            }


            // ------------------------------------------
            // JÁ É FAVORITO → REMOVER
            // ------------------------------------------

            if (existingFavorite) {

                const {
                    error: deleteError
                } = await supabase
                    .from("favorites")
                    .delete()
                    .eq(
                        "id",
                        existingFavorite.id
                    );


                if (deleteError) {

                    console.error(
                        "RJ7 FAVORITOS — erro ao remover:",
                        deleteError
                    );

                    rj7Notify(
                        "Não foi possível remover dos favoritos."
                    );

                    return;

                }


                favoriteButton.textContent =
                    "♡ Favorito";

                favoriteButton.classList.remove(
                    "active"
                );


                return;

            }


            // ------------------------------------------
            // NÃO É FAVORITO → ADICIONAR
            // ------------------------------------------

            const {
                error: insertError
            } = await supabase
                .from("favorites")
                .insert({

                    user_id:
                        user.id,

                    product_id:
                        selectedProduct.id

                });


            if (insertError) {

                console.error(
                    "RJ7 FAVORITOS — erro ao adicionar:",
                    insertError
                );

                rj7Notify(
                    "Não foi possível adicionar aos favoritos."
                );

                return;

            }


            favoriteButton.textContent =
                "♥ Favorito";

            favoriteButton.classList.add(
                "active"
            );

        }
    );

}


// Verificar estado inicial
updateFavoriteButton();
// ======================================================
// 12. QUANTIDADE DO PRODUTO
// ======================================================

let productQuantity = 1;


const quantityDisplay =
    document.getElementById(
        "quantity"
    );

const plusQuantity =
    document.getElementById(
        "plusQuantity"
    );

const minusQuantity =
    document.getElementById(
        "minusQuantity"
    );


function updateProductQuantity() {

    if (quantityDisplay) {

        quantityDisplay.textContent =
            productQuantity;

    }

}


if (plusQuantity) {

    plusQuantity.addEventListener(
        "click",
        function () {

            productQuantity++;

            updateProductQuantity();

        }
    );

}


if (minusQuantity) {

    minusQuantity.addEventListener(
        "click",
        function () {

            if (productQuantity <= 1) {
                return;
            }

            productQuantity--;

            updateProductQuantity();

        }
    );

}


updateProductQuantity();


// ======================================================
// 13. CORES + TAMANHOS + STOCK
// ======================================================

let selectedColor = null;
let selectedSize = null;
let productVariants = [];


// ------------------------------------------------------
// ELEMENTOS
// ------------------------------------------------------

const productColors =
    document.getElementById("productColors");

const productSizes =
    document.getElementById("productSizes");


// ------------------------------------------------------
// CARREGAR VARIANTES DO PRODUTO
// ------------------------------------------------------

async function loadProductVariants() {

    if (!selectedProduct) {
        return;
    }

    if (!productColors || !productSizes) {
        return;
    }

    try {

        const {
            data: variants,
            error
        } = await supabase
            .from("product_variants")
            .select(
                "id, product_id, color, size, stock"
            )
            .eq(
                "product_id",
                selectedProduct.id
            )
            .order(
                "color",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "RJ7 VARIANTS — erro ao carregar:",
                error
            );

            productColors.innerHTML = "";

            productSizes.innerHTML = `
                <p>
                    Não foi possível carregar as opções.
                </p>
            `;

            return;
        }


        productVariants =
            variants || [];


        console.log(
            "RJ7 VARIANTS — variantes carregadas:",
            productVariants
        );


        renderProductColors();

    } catch (error) {

        console.error(
            "RJ7 VARIANTS — erro inesperado:",
            error
        );

    }

}


// ------------------------------------------------------
// CORES
// ------------------------------------------------------

function renderProductColors() {

    if (!productColors) {
        return;
    }


    productColors.innerHTML = "";


    const colors = [
        ...new Set(
            productVariants.map(
                variant => variant.color
            )
        )
    ];


    colors.forEach(color => {

        const colorVariants =
            productVariants.filter(
                variant =>
                    variant.color === color
            );


        const hasStock =
            colorVariants.some(
                variant =>
                    Number(variant.stock) > 0
            );


        const button =
            document.createElement("button");


        button.type = "button";

        button.className =
            "rj7-color-dot";


        button.dataset.color =
            color;


/*
 * CORES VISUAIS
 */

const colorMap = {

    "Preto": "#000000",

    "Branco": "#ffffff",

    "Azul": "#2563eb",

    "Vermelho": "#ef4444",

    "Verde": "#22c55e",

    "Amarelo": "#facc15",

    "Roxo": "#8b5cf6",

    "Cinzento": "#6b7280",

    "Laranja": "#f97316",

    "Rosa": "#ec4899",

    "Castanho": "#92400e",

    "Bege": "#d6b98c"

};


button.style.background =
    colorMap[color] || color;


        /*
         * Se não houver stock
         */

        if (!hasStock) {

            button.disabled = true;

            button.classList.add(
                "out-of-stock"
            );

        }


        button.addEventListener(
            "click",
            function () {

                selectedColor =
                    this.dataset.color;


                selectedSize = null;


                document
                    .querySelectorAll(
                        ".rj7-color-dot"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                this.classList.add(
                    "active"
                );


                renderProductSizes();

            }
        );


        productColors.appendChild(
            button
        );

    });

}


// ------------------------------------------------------
// TAMANHOS DA COR SELECIONADA
// ------------------------------------------------------

function renderProductSizes() {

    if (!productSizes) {
        return;
    }


    productSizes.innerHTML = "";


    if (!selectedColor) {

        productSizes.innerHTML = `
            <p class="rj7-size-message">
                Seleciona uma cor.
            </p>
        `;

        return;
    }


    const colorVariants =
        productVariants.filter(
            variant =>
                variant.color ===
                selectedColor
        );


    colorVariants.forEach(
        variant => {

            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";


            button.className =
                "size-btn";


            button.dataset.size =
                variant.size;


            button.textContent =
                variant.size;


            const stock =
                Number(
                    variant.stock
                );


            if (stock <= 0) {

                button.disabled =
                    true;


                button.classList.add(
                    "out-of-stock"
                );


                button.title =
                    "Esgotado";

            }


            button.addEventListener(
                "click",
                function () {

                    if (
                        Number(
                            variant.stock
                        ) <= 0
                    ) {

                        return;

                    }


                    document
                        .querySelectorAll(
                            "#productSizes .size-btn"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    this.classList.add(
                        "active"
                    );


                    selectedSize =
                        variant.size;

                }
            );


            productSizes.appendChild(
                button
            );

        }
    );

}


// ------------------------------------------------------
// INICIALIZAR VARIANTES
// ------------------------------------------------------

loadProductVariants();


// ======================================================
// 14. ADICIONAR AO CARRINHO
// ======================================================

const addCartButton =
    document.getElementById(
        "addProductCart"
    );


if (addCartButton) {

    addCartButton.addEventListener(
        "click",
        function () {

            if (!selectedProduct) {

                rj7Notify(
                    "Produto não encontrado."
                );

                return;

            }


 if (!selectedColor) {

    rj7Notify(
        "Seleciona uma cor."
    );

    return;

}


if (!selectedSize) {

    rj7Notify(
        "Seleciona um tamanho."
    );

    return;

}

const selectedVariant =
    productVariants.find(
        variant =>
            variant.color === selectedColor &&
            variant.size === selectedSize
    );


if (!selectedVariant) {

    rj7Notify(
        "Esta combinação de cor e tamanho não está disponível."
    );

    return;

}


const availableStock =
    Number(selectedVariant.stock);


if (availableStock <= 0) {

    rj7Notify(
        `A cor selecionada está esgotada no tamanho ${selectedSize}.`
    );

    return;

}


if (productQuantity > availableStock) {

    rj7Notify(
        `Só existem ${availableStock} unidades disponíveis desta combinação.`
    );

    return;

}
            const cart =
                getCart();


            const existing =
    cart.find(
        item =>
            item.id === selectedProduct.id &&
            item.color === selectedColor &&
            item.size === selectedSize
    );


            if (existing) {

                existing.quantity +=
                    productQuantity;

            } else {

 cart.push({

    id:
        selectedProduct.id,

    name:
        selectedProduct.name,

    price:
        selectedProduct.price,

    image:
        selectedProduct.image,

    category:
        selectedProduct.category,

    color:
        selectedColor,

    size:
        selectedSize,

    quantity:
        productQuantity

});

            }


            saveCart(cart);

            updateCartCount();


            rj7Notify(
                "Produto adicionado ao carrinho!"
            );

        }
    );

}


// ======================================================
// 15. CARRINHO
// ======================================================

function renderCart() {

    const cartList =
        document.getElementById(
            "cartList"
        );

    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    if (!cartList || !cartTotal) {
        return;
    }


    const cart =
        getCart();


    cartList.innerHTML = "";


    if (!cart.length) {

        cartList.innerHTML = `

            <div class="empty-cart">

                <h3>
                    O teu carrinho está vazio.
                </h3>

                <p>
                    Adiciona alguns produtos RJ7.
                </p>

                <a href="shop.html">
                    Continuar compras
                </a>

            </div>

        `;


        cartTotal.textContent =
            "Total: 0 Kz";

        return;

    }


    let total = 0;


    cart.forEach(
        (item, index) => {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


            total += itemTotal;


            cartList.innerHTML += `

                <article
                    class="cart-item"
                    data-index="${index}"
                >

                    <div class="cart-item-image">

                        <img
                            src="${getImagePath(item)}"
                            alt="${item.name}"
                        >

                    </div>


                    <div class="cart-item-info">

                        <h3>
                            ${item.name}
                        </h3>

<p>
    Cor: ${item.color || "—"}
</p>

<p>
    Tamanho: ${item.size}
</p>

                        <p>
                            ${Number(item.price).toLocaleString("pt-PT")} Kz
                        </p>


                        <div class="cart-item-controls">

                            <button
                                type="button"
                                class="cart-quantity-minus"
                                data-index="${index}"
                            >
                                −
                            </button>


                            <span>
                                ${item.quantity}
                            </span>


                            <button
                                type="button"
                                class="cart-quantity-plus"
                                data-index="${index}"
                            >
                                +
                            </button>

                        </div>


                        <strong>
                            ${itemTotal.toLocaleString("pt-PT")} Kz
                        </strong>


                        <button
                            type="button"
                            class="remove-cart-item"
                            data-index="${index}"
                        >
                            Remover
                        </button>

                    </div>

                </article>

            `;

        }
    );


    cartTotal.textContent =
        "Total: " +
        total.toLocaleString("pt-PT") +
        " Kz";

}


// ======================================================
// 16. CONTROLOS DO CARRINHO
// ======================================================

document.addEventListener(
    "click",
    function (event) {

        const plus =
            event.target.closest(
                ".cart-quantity-plus"
            );

        const minus =
            event.target.closest(
                ".cart-quantity-minus"
            );

        const remove =
            event.target.closest(
                ".remove-cart-item"
            );


        const button =
            plus || minus || remove;


        if (!button) return;


        const index =
            Number(button.dataset.index);


        const cart =
            getCart();


        if (!cart[index]) return;


        if (plus) {

            cart[index].quantity++;

        }


        if (minus) {

            if (cart[index].quantity > 1) {

                cart[index].quantity--;

            }

        }


        if (remove) {

            cart.splice(index, 1);

        }


        saveCart(cart);

        renderCart();

        updateCartCount();

    }
);


// ======================================================
// 17. CHECKOUT
// ======================================================

const checkoutButton =
    document.getElementById(
        "checkoutButton"
    );


if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        function () {

            const cart =
                getCart();


            if (!cart.length) {

                rj7Notify(
                    "O teu carrinho está vazio."
                );

                return;

            }


            window.location.href =
                "checkout.html";

        }
    );

}

// ======================================================
// 17.5. CHECKOUT — CRIAR PEDIDO
// ======================================================

const checkoutForm =
    document.getElementById("checkoutForm");

const checkoutItems =
    document.getElementById("checkoutItems");

const checkoutTotal =
    document.getElementById("checkoutTotal");


// ======================================================
// MOSTRAR PRODUTOS NO CHECKOUT
// ======================================================

function renderCheckout() {

    if (!checkoutItems || !checkoutTotal) {
        return;
    }

    const cart = getCart();

    checkoutItems.innerHTML = "";

    if (!cart.length) {

        checkoutItems.innerHTML = `
            <p>
                O teu carrinho está vazio.
            </p>
        `;

        checkoutTotal.textContent =
            "Total: 0 Kz";

        return;
    }

    let total = 0;


    cart.forEach(item => {

        const itemTotal =
            Number(item.price) *
            Number(item.quantity);

        total += itemTotal;


        checkoutItems.innerHTML += `

            <div class="checkout-item">

                <img
                    src="${getImagePath(item)}"
                    alt="${item.name}"
                >

                <div>

                    <h3>
                        ${item.name}
                    </h3>

<p>
    Cor: ${item.color || "—"}
</p>

<p>
    Tamanho: ${item.size}
</p>

<p>
    Quantidade: ${item.quantity}
</p>

                    <strong>
                        ${itemTotal.toLocaleString("pt-PT")} Kz
                    </strong>

                </div>

            </div>

        `;

    });


    checkoutTotal.textContent =
        "Total: " +
        total.toLocaleString("pt-PT") +
        " Kz";
}


// ======================================================
// ENVIAR CHECKOUT
// ======================================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const cart = getCart();


            // ------------------------------------------
            // VERIFICAR CARRINHO
            // ------------------------------------------

            if (!cart.length) {

                rj7Notify(
                    "O teu carrinho está vazio."
                );

                return;

            }


            // ------------------------------------------
            // VERIFICAR LOGIN
            // ------------------------------------------

            const {
                data: {
                    user
                },
                error: userError
            } = await supabase.auth.getUser();


            if (userError || !user) {

                rj7Notify(
    "Inicia sessão antes de finalizar a compra."
);

setTimeout(() => {
    window.location.href = "login.html";
}, 2000);

                return;

            }


            // ------------------------------------------
            // DADOS DO CLIENTE
            // ------------------------------------------

            const customerName =
                document.getElementById(
                    "customerName"
                )?.value.trim();


            const customerPhone =
                document.getElementById(
                    "customerPhone"
                )?.value.trim();


            const customerAddress =
                document.getElementById(
                    "customerAddress"
                )?.value.trim();


            if (
                !customerName ||
                !customerPhone ||
                !customerAddress
            ) {

                rj7Notify(
                    "Preenche todos os dados de entrega."
                );

                return;

            }


            // ------------------------------------------
            // CALCULAR TOTAL
            // ------------------------------------------

            const total =
                cart.reduce(
                    (sum, item) =>
                        sum +
                        (
                            Number(item.price) *
                            Number(item.quantity)
                        ),
                    0
                );


            if (total <= 0) {

                rj7Notify(
                    "O valor da compra é inválido."
                );

                return;

            }


            // ------------------------------------------
            // DESATIVAR BOTÃO
            // ------------------------------------------

            const submitButton =
                checkoutForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "A criar pedido...";

            }


            try {

                // --------------------------------------
                // CRIAR PEDIDO
                // --------------------------------------

                const {
                    data: order,
                    error: orderError
                } = await supabase
                    .from("orders")
                    .insert({

                        user_id:
                            user.id,

                        customer_name:
                            customerName,

                        customer_phone:
                            customerPhone,

                        customer_address:
                            customerAddress,

                        total:
                            total,

                        status:
                            "pending"

                    })
                    .select()
                    .single();


                if (orderError) {

                    console.error(
                        "RJ7 CHECKOUT — erro ao criar pedido:",
                        orderError
                    );

                    rj7Notify(
                        "Não foi possível criar o pedido."
                    );

                    return;

                }


                // --------------------------------------
                // CRIAR ITENS DO PEDIDO
                // --------------------------------------

const orderItems =
    cart.map(item => ({

        order_id:
            order.id,

        product_id:
            item.id,

        quantity:
            Number(item.quantity),

        price:
            Number(item.price),

        color:
            item.color,

        size:
            item.size

    }));

                const {
                    error: itemsError
                } = await supabase
                    .from("order_items")
                    .insert(orderItems);


                if (itemsError) {

                    console.error(
                        "RJ7 CHECKOUT — erro ao criar itens:",
                        itemsError
                    );

                    rj7Notify(
                        "O pedido foi criado, mas ocorreu um erro ao guardar os produtos. Não efetues outro pagamento. Contacta o suporte da RJ7."
                    );

                    return;

                }


                // --------------------------------------
                // GUARDAR PEDIDO ATUAL
                // --------------------------------------

                localStorage.setItem(
                    "RJ7_currentOrder",
                    JSON.stringify({

                        id:
                            order.id,

                        total:
                            total,

                        customerName:
                            customerName,

                        customerPhone:
                            customerPhone,

                        customerAddress:
                            customerAddress

                    })
                );


                console.log(
                    "RJ7 CHECKOUT — pedido criado:",
                    order
                );


                // --------------------------------------
                // PRÓXIMA ETAPA
                // --------------------------------------

                window.location.href =
                    "payment.html";


            } catch (error) {

                console.error(
                    "RJ7 CHECKOUT — erro inesperado:",
                    error
                );

                rj7Notify(
                    "Ocorreu um erro ao finalizar a compra."
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Continuar";

                }

            }

        }
    );

}


// ======================================================
// INICIALIZAR CHECKOUT
// ======================================================

renderCheckout();
// ======================================================
// 18. INICIALIZAÇÃO
// ======================================================

loadProducts().then(loadAllProductVariants);

renderCart();

updateCartCount();

loadProductReviews();

// ======================================================
// 11.6. CRIAR AVALIAÇÃO
// ======================================================

let selectedReviewRating = 0;

const reviewRating =
    document.getElementById("reviewRating");

const reviewComment =
    document.getElementById("reviewComment");

const submitReview =
    document.getElementById("submitReview");


// ======================================================
// SELECIONAR ESTRELAS
// ======================================================

if (reviewRating) {

    const ratingButtons =
        reviewRating.querySelectorAll(
            "button"
        );


    ratingButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                selectedReviewRating =
                    Number(
                        this.dataset.rating
                    );


                ratingButtons.forEach(
                    item => {

                        const rating =
                            Number(
                                item.dataset.rating
                            );


                        item.textContent =
                            rating <=
                            selectedReviewRating
                                ? "★"
                                : "☆";

                    }
                );

            }
        );

    });

}


// ======================================================
// ENVIAR AVALIAÇÃO
// ======================================================

if (submitReview) {

    submitReview.addEventListener(
        "click",
        async function () {

            // -------------------------------
            // VERIFICAR PRODUTO
            // -------------------------------

            if (!selectedProduct) {

                rj7Notify(
                    "Produto não encontrado."
                );

                return;

            }


            // -------------------------------
            // VERIFICAR LOGIN
            // -------------------------------

            const {
                data: {
                    user
                }
            } = await supabase.auth.getUser();


            if (!user) {

                rj7Notify(
                    "Inicia sessão para avaliar este produto."
                );

                window.location.href =
                    "login.html";

                return;

            }


            // -------------------------------
            // VERIFICAR ESTRELAS
            // -------------------------------

            if (
                selectedReviewRating < 1 ||
                selectedReviewRating > 5
            ) {

                rj7Notify(
                    "Seleciona uma classificação de 1 a 5 estrelas."
                );

                return;

            }


            // -------------------------------
            // COMENTÁRIO
            // -------------------------------

            const comment =
                reviewComment
                    ? reviewComment.value.trim()
                    : "";


            // -------------------------------
            // EVITAR DUPLICAÇÃO
            // -------------------------------

            const {
                data: existingReview,
                error: existingError
            } = await supabase
                .from("product_reviews")
                .select("id")
                .eq(
                    "product_id",
                    selectedProduct.id
                )
                .eq(
                    "user_id",
                    user.id
                )
                .maybeSingle();


            if (existingError) {

                console.error(
                    "RJ7 REVIEWS — erro ao verificar avaliação:",
                    existingError
                );

                rj7Notify(
                    "Não foi possível verificar a tua avaliação."
                );

                return;

            }


            if (existingReview) {

                rj7Notify(
                    "Já avaliou este produto."
                );

                return;

            }


            // -------------------------------
            // INSERIR AVALIAÇÃO
            // -------------------------------

            const {
                error
            } = await supabase
                .from("product_reviews")
                .insert({

                    product_id:
                        selectedProduct.id,

                    user_id:
                        user.id,

                    rating:
                        selectedReviewRating,

                    comment:
                        comment || null

                });


            if (error) {

                console.error(
                    "RJ7 REVIEWS — erro ao enviar:",
                    error
                );

                rj7Notify(
                    "Não foi possível enviar a avaliação."
                );

                return;

            }


            // -------------------------------
            // SUCESSO
            // -------------------------------

            rj7Notify(
                "Avaliação enviada com sucesso! ⭐"
            );


            if (reviewComment) {

                reviewComment.value = "";

            }


            selectedReviewRating = 0;


            if (reviewRating) {

                reviewRating
                    .querySelectorAll("button")
                    .forEach(
                        button =>
                            button.textContent = "☆"
                    );

            }


            // Atualizar avaliações
            await loadProductReviews();

        }
    );

}

console.log(
    "RJ7 — JavaScript carregado corretamente."
);

// Iniciar
setupNotificationButton();
// ======================================================
// RJ7 — BOTÃO E CONTADOR DE NOTIFICAÇÕES
// APENAS PARA UTILIZADORES LOGADOS
// ======================================================

async function setupNotificationButton() {

    const notificationArea =
        document.getElementById("notificationArea");

    if (!notificationArea) {
        return;
    }


    // ----------------------------------------------
    // VERIFICAR UTILIZADOR
    // ----------------------------------------------

    const {
        data: {
            user
        }
    } = await supabase.auth.getUser();


    // ----------------------------------------------
    // NÃO ESTÁ LOGADO
    // ----------------------------------------------

    if (!user) {

        notificationArea.innerHTML = "";

        return;
    }


    // ----------------------------------------------
    // UTILIZADOR LOGADO
    // ----------------------------------------------

    notificationArea.innerHTML = `

        <a
            href="pages/notifications.html"
            class="notification-button"
            aria-label="Notificações"
        >

            <i class="fa-regular fa-bell"></i>

            <span
                id="notificationCount"
                class="notification-count"
            >
                0
            </span>

        </a>

    `;


    // ----------------------------------------------
    // AGORA "user" EXISTE NESTE ESCOPO
    // ----------------------------------------------

    await updateNotificationCount(user.id);

}


// ======================================================
// CONTADOR DE NOTIFICAÇÕES NÃO LIDAS
// ======================================================

async function updateNotificationCount(userId) {

    const notificationCount =
        document.getElementById(
            "notificationCount"
        );


    if (!notificationCount) {
        return;
    }


    const {
        count,
        error
    } = await supabase

        .from("notifications")

        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )

        .eq(
            "user_id",
            userId
        )

        .eq(
            "is_read",
            false
        );


    if (error) {

        console.error(
            "RJ7 NOTIFICATIONS — erro no contador:",
            error
        );

        return;
    }


    const unread =
        count || 0;


    notificationCount.textContent =
        unread > 99
            ? "99+"
            : unread;


    if (unread === 0) {

        notificationCount.style.display =
            "none";

    } else {

        notificationCount.style.display =
            "flex";

    }

}


// ======================================================
// INICIAR
// ======================================================

setupNotificationButton();
// ======================================================
// RJ7 — CONTADOR DO CARRINHO
// Esconde o "0" e mostra apenas quando houver produtos
// ======================================================

function updateCartBadgeVisibility() {

    const cartCount =
        document.getElementById("cartCount");

    if (!cartCount) {
        return;
    }

    const value =
        parseInt(cartCount.textContent.trim(), 10) || 0;

    if (value <= 0) {

        cartCount.classList.add(
            "cart-count-hidden"
        );

    } else {

        cartCount.classList.remove(
            "cart-count-hidden"
        );

    }
}


// Verifica quando a página carrega
updateCartBadgeVisibility();


// Observa alterações no número do carrinho
const cartCount =
    document.getElementById("cartCount");

if (cartCount) {

    const observer =
        new MutationObserver(
            updateCartBadgeVisibility
        );

    observer.observe(
        cartCount,
        {
            childList: true,
            characterData: true,
            subtree: true
        }
    );

}
// ======================================================
// RJ7 — GUIA DE TAMANHOS
// ======================================================

const sizeGuideButton =
    document.getElementById("sizeGuideButton");

const sizeGuideModal =
    document.getElementById("sizeGuideModal");

const closeSizeGuide =
    document.getElementById("closeSizeGuide");


// ABRIR

if (sizeGuideButton && sizeGuideModal) {

    sizeGuideButton.addEventListener(
        "click",
        function () {

            sizeGuideModal.classList.add("active");

            sizeGuideModal.setAttribute(
                "aria-hidden",
                "false"
            );

            document.body.classList.add(
                "size-guide-open"
            );

        }
    );

}


// FECHAR NO X

if (closeSizeGuide && sizeGuideModal) {

    closeSizeGuide.addEventListener(
        "click",
        function () {

            closeSizeGuideModal();

        }
    );

}


// FECHAR AO CLICAR FORA

if (sizeGuideModal) {

    sizeGuideModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                sizeGuideModal
            ) {

                closeSizeGuideModal();

            }

        }
    );

}


// FECHAR COM ESC

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            sizeGuideModal &&
            sizeGuideModal.classList.contains("active")
        ) {

            closeSizeGuideModal();

        }

    }
);


// FUNÇÃO DE FECHAR

function closeSizeGuideModal() {

    if (!sizeGuideModal) {
        return;
    }

    sizeGuideModal.classList.remove(
        "active"
    );

    sizeGuideModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "size-guide-open"
    );

}
// ======================================================
// RJ7 MODE — EXPERIÊNCIA INTELIGENTE
// ======================================================

(function () {

    const modeModal =
        document.getElementById("rj7ModeModal");

    const openMode =
        document.getElementById("openRJ7Mode");

    const closeMode =
        document.getElementById("closeRJ7Mode");

    const modeSteps =
        document.querySelectorAll(
            "#rj7ModeModal .rj7-mode-step"
        );

    const modeResult =
        document.getElementById("rj7ModeResult");

    const resultTitle =
        document.getElementById(
            "rj7ModeResultTitle"
        );

    const resultDescription =
        document.getElementById(
            "rj7ModeResultDescription"
        );

    const resultProducts =
        document.getElementById(
            "rj7ModeProducts"
        );

    const buildLookButton =
        document.getElementById(
            "buildRJ7Look"
        );


    let selectedMode = null;

    let selectedMood = null;


    // ==================================================
    // ABRIR RJ7 MODE
    // ==================================================

    if (openMode && modeModal) {

        openMode.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                modeModal.classList.add(
                    "active"
                );

                document.body.style.overflow =
                    "hidden";

            }
        );

    }


    // ==================================================
    // FECHAR RJ7 MODE
    // ==================================================

    function closeRJ7Mode() {

        if (!modeModal) return;

        modeModal.classList.remove(
            "active"
        );

        document.body.style.overflow =
            "";

        resetRJ7Mode();

    }


    if (closeMode) {

        closeMode.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                closeRJ7Mode();

            }
        );

    }


    // ==================================================
    // FECHAR AO CLICAR FORA
    // ==================================================

    if (modeModal) {

        modeModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modeModal
                ) {

                    closeRJ7Mode();

                }

            }
        );

    }


    // ==================================================
    // ESC
    // ==================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modeModal &&
                modeModal.classList.contains(
                    "active"
                )
            ) {

                closeRJ7Mode();

            }

        }
    );


    // ==================================================
    // PERGUNTA 1
    // WHAT ARE YOU LOOKING FOR?
    // ==================================================

    const modeButtons =
        document.querySelectorAll(
            "#rj7ModeModal [data-mode]"
        );


    modeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    selectedMode =
                        this.dataset.mode;


                    modeButtons.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );


                    // ----------------------------------
                    // MOSTRAR PERGUNTA 2
                    // ----------------------------------

                    showMoodStep();

                }
            );

        }
    );


    // ==================================================
    // MOSTRAR PERGUNTA 2
    // ==================================================

    function showMoodStep() {

        modeSteps.forEach(
            function (step) {

                step.classList.add(
                    "rj7-mode-step-hidden"
                );

            }
        );


        const moodStep =
            document.getElementById(
                "rj7MoodStep"
            );


        if (moodStep) {

            moodStep.classList.remove(
                "rj7-mode-step-hidden"
            );

        }

    }


    // ==================================================
    // PERGUNTA 2
    // HOW DO YOU WANT TO FEEL?
    // ==================================================

    const moodButtons =
        document.querySelectorAll(
            "#rj7MoodStep [data-mood]"
        );


    moodButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    selectedMood =
                        this.dataset.mood;


                    moodButtons.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );


                    // ----------------------------------
                    // GERAR LOOK
                    // ----------------------------------

                    generateRJ7Look();

                }
            );

        }
    );


    // ==================================================
    // ANALISAR PRODUTOS
    // ==================================================

    function generateRJ7Look() {

        if (
            !Array.isArray(products)
        ) {

            console.error(
                "RJ7 MODE: products não encontrado."
            );

            return;

        }


        let scoredProducts =
            products.map(
                function (product) {

                    return {

                        product:
                            product,

                        score:
                            calculateProductScore(
                                product
                            )

                    };

                }
            );


        // ----------------------------------------------
        // ORDENAR PELO MELHOR MATCH
        // ----------------------------------------------

        scoredProducts.sort(
            function (a, b) {

                return b.score - a.score;

            }
        );


        // ----------------------------------------------
        // PEGAR PRODUTOS COM MELHOR MATCH
        // ----------------------------------------------

        let recommended =
            scoredProducts
                .filter(
                    item =>
                        item.score > 0
                )
                .slice(0, 3)
                .map(
                    item =>
                        item.product
                );


        // ----------------------------------------------
        // FALLBACK
        // ----------------------------------------------

        if (
            recommended.length === 0
        ) {

            recommended =
                products.slice(0, 3);

        }


        renderRJ7Look(
            recommended
        );

    }


    // ==================================================
    // PONTUAÇÃO INTELIGENTE
    // ==================================================

    function calculateProductScore(product) {

    if (!product) {
        return 0;
    }

    // ==================================================
    // TEXTO DO PRODUTO
    // ==================================================

    const text = [
        product.name,
        product.description,
        product.category
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");


    let score = 0;


    // ==================================================
    // FUNÇÃO AUXILIAR
    // ==================================================

    function has(words, points) {

        words.forEach(word => {

            const normalizedWord =
                word
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");

            if (text.includes(normalizedWord)) {
                score += points;
            }

        });

    }


    // ==================================================
    // ESTILO
    // ==================================================

    if (selectedMode === "casual") {

        has([
            "casual",
            "everyday",
            "basic",
            "essential",
            "t-shirt",
            "tshirt",
            "camisola",
            "camiseta",
            "shirt"
        ], 8);

        has([
            "hoodie",
            "sweatshirt"
        ], 6);

    }


    if (selectedMode === "sport") {

        has([
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
            "athletic"
        ], 10);

        has([
            "jogger",
            "shorts",
            "calcoes",
            "tracksuit"
        ], 7);

    }


    if (selectedMode === "premium") {

        has([
            "premium",
            "luxury",
            "luxo",
            "signature",
            "exclusive",
            "elegant",
            "elegante",
            "sofisticado",
            "sophisticated"
        ], 10);

        has([
            "polo",
            "blazer"
        ], 7);

    }


    if (selectedMode === "minimal") {

        has([
            "minimal",
            "minimalist",
            "minimalista",
            "clean",
            "essential",
            "essencial",
            "basic",
            "simple",
            "simples"
        ], 10);

    }


    if (selectedMode === "night") {

        has([
            "night",
            "noite",
            "evening",
            "black",
            "preto",
            "preta",
            "dark"
        ], 10);

        has([
            "premium",
            "signature",
            "luxury",
            "blazer"
        ], 7);

    }


    if (selectedMode === "everyday") {

        has([
            "everyday",
            "daily",
            "diario",
            "casual",
            "essential",
            "essencial",
            "basic",
            "t-shirt",
            "tshirt",
            "camisola",
            "shirt"
        ], 9);

        has([
            "hoodie",
            "sweatshirt"
        ], 6);

    }


    // ==================================================
    // MOOD
    // ==================================================

    if (selectedMood === "confident") {

        has([
            "signature",
            "premium",
            "exclusive",
            "luxury",
            "blazer"
        ], 10);

    }


    if (selectedMood === "powerful") {

        has([
            "performance",
            "sport",
            "sports",
            "desporto",
            "athletic"
        ], 10);

        has([
            "black",
            "preto",
            "preta",
            "dark"
        ], 5);

    }


    if (selectedMood === "relaxed") {

        has([
            "hoodie",
            "oversized",
            "sweatshirt",
            "relaxed",
            "casual"
        ], 10);

    }


    if (selectedMood === "elegant") {

        has([
            "blazer",
            "premium",
            "luxury",
            "signature",
            "elegant",
            "elegante"
        ], 10);

        has([
            "polo"
        ], 7);

    }


    if (selectedMood === "active") {

        has([
            "sport",
            "sports",
            "desporto",
            "performance",
            "training",
            "fitness",
            "running",
            "athletic"
        ], 10);

        has([
            "tracksuit",
            "jogger",
            "shorts",
            "calcoes",
            "leggings"
        ], 7);

    }


    // ==================================================
    // PEÇAS GENÉRICAS
    // ==================================================

    // Se o produto tiver estas palavras,
    // damos uma pequena pontuação adicional.

    has([
        "rj7"
    ], 1);


    return score;

}


    // ==================================================
    // MOSTRAR YOUR RJ7 LOOK
    // ==================================================

    function renderRJ7Look(
        recommended
    ) {

        if (!modeResult) return;

        if (!resultProducts) return;


        resultProducts.innerHTML =
            "";


        recommended.forEach(
            function (product) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "rj7-mode-product";


                card.dataset.id =
                    product.id;


                const image =
                    typeof getImagePath ===
                    "function"
                        ? getImagePath(product)
                        : product.image;


                const price =
                    Number(
                        product.price || 0
                    );


                card.innerHTML = `

                    <img
                        src="${image || ""}"
                        alt="${product.name || "Produto RJ7"}"
                    >

                    <div
                        class="rj7-mode-product-info"
                    >

                        <h3>
                            ${product.name || "RJ7 Product"}
                        </h3>

                        <p>
                            ${price.toLocaleString(
                                "pt-PT"
                            )} Kz
                        </p>

                    </div>

                `;


                resultProducts.appendChild(
                    card
                );


                // --------------------------------------
                // ABRIR PRODUTO
                // --------------------------------------

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
                            window.location.pathname.includes(
                                "/pages/"
                            )
                                ? "product.html"
                                : "pages/product.html";

                    }
                );

            }
        );


        // =================================================
        // TÍTULO
        // =================================================

        if (resultTitle) {

            resultTitle.textContent =
                "YOUR RJ7 LOOK";

        }


        // =================================================
        // DESCRIÇÃO
        // =================================================

        if (resultDescription) {

            resultDescription.textContent =
                getRJ7LookDescription();

        }


        // =================================================
        // MOSTRAR RESULTADO
        // =================================================

        modeSteps.forEach(
            function (step) {

                step.classList.add(
                    "rj7-mode-step-hidden"
                );

            }
        );


        modeResult.classList.remove(
            "rj7-mode-step-hidden"
        );

    }


    // ==================================================
    // DESCRIÇÃO DO LOOK
    // ==================================================

    function getRJ7LookDescription() {

        const style =
            selectedMode
                ? capitalize(
                    selectedMode
                )
                : "RJ7";


        const mood =
            selectedMood
                ? capitalize(
                    selectedMood
                )
                : "";


        return (
            `${style} · ${mood}. ` +
            `Selecionámos peças RJ7 ` +
            `com base nas tuas escolhas.`
        );

    }


    // ==================================================
    // BUILD MY LOOK
    // ==================================================

    if (buildLookButton) {

        buildLookButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                const lookProducts =
                    Array.from(
                        resultProducts.querySelectorAll(
                            ".rj7-mode-product"
                        )
                    );


                if (
                    lookProducts.length === 0
                ) {

                    return;

                }


                const ids =
                    lookProducts.map(
                        card =>
                            card.dataset.id
                    );


                localStorage.setItem(
                    "RJ7_Mode_Look",
                    JSON.stringify({
                        mode:
                            selectedMode,

                        mood:
                            selectedMood,

                        products:
                            ids
                    })
                );


                // --------------------------------------
                // IR PARA A LOJA
                // --------------------------------------

                window.location.href =
                    window.location.pathname.includes(
                        "/pages/"
                    )
                        ? "shop.html"
                        : "pages/shop.html";

            }
        );

    }


    // ==================================================
    // RESET
    // ==================================================

    function resetRJ7Mode() {

        selectedMode =
            null;

        selectedMood =
            null;


        modeButtons.forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );

            }
        );


        moodButtons.forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );

            }
        );


        modeSteps.forEach(
            function (step) {

                step.classList.remove(
                    "rj7-mode-step-hidden"
                );

            }
        );


        if (modeResult) {

            modeResult.classList.add(
                "rj7-mode-step-hidden"
            );

        }

    }


    // ==================================================
    // CAPITALIZE
    // ==================================================

    function capitalize(
        value
    ) {

        if (!value) return "";

        return (
            value.charAt(0).toUpperCase() +
        value.slice(1)
        );

    }

})();
// ======================================================
// RJ7 AI — ASSISTENTE INTELIGENTE
// ======================================================


// ======================================================
// CONFIGURAÇÃO
// ======================================================

const RJ7_AI_FUNCTION_URL =
    "https://rngdtpkakxvunrkyvquo.supabase.co/functions/v1/rj7-ai";


// ======================================================
// ELEMENTOS DA INTERFACE
// ======================================================

const rj7AIButton =
    document.getElementById("rj7AIButton");

const rj7AIPanel =
    document.getElementById("rj7AIPanel");

const rj7AIClose =
    document.getElementById("rj7AIClose");

const rj7AIForm =
    document.getElementById("rj7AIForm");

const rj7AIInput =
    document.getElementById("rj7AIInput");

const rj7AIConversation =
    document.getElementById("rj7AIConversation");

const rj7AIQuickActions =
    document.getElementById("rj7AIQuickActions");


// ======================================================
// ESTADO DA RJ7 AI
// ======================================================

let rj7AIHistory = [];


// ======================================================
// ABRIR RJ7 AI
// ======================================================

if (
    rj7AIButton &&
    rj7AIPanel
) {

    rj7AIButton.addEventListener(
        "click",
        function () {

            rj7AIPanel.classList.add("active");

            rj7AIPanel.setAttribute(
                "aria-hidden",
                "false"
            );

            setTimeout(
                function () {

                    if (rj7AIInput) {

                        rj7AIInput.focus();

                    }

                },
                150
            );

        }
    );

}


// ======================================================
// FECHAR RJ7 AI
// ======================================================

if (
    rj7AIClose &&
    rj7AIPanel
) {

    rj7AIClose.addEventListener(
        "click",
        function () {

            rj7AIPanel.classList.remove("active");

            rj7AIPanel.setAttribute(
                "aria-hidden",
                "true"
            );

        }
    );

}


// ======================================================
// FECHAR COM ESC
// ======================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            rj7AIPanel
        ) {

            rj7AIPanel.classList.remove(
                "active"
            );

            rj7AIPanel.setAttribute(
                "aria-hidden",
                "true"
            );

        }

    }
);


// ======================================================
// ADICIONAR MENSAGEM
// ======================================================

function addRJ7AIMessage(
    message,
    type = "bot"
) {

    if (!rj7AIConversation) {

        return;

    }


    const wrapper =
        document.createElement("div");


    wrapper.className =
        `rj7-ai-message rj7-ai-message-${type}`;


    // ----------------------------------------------
    // MENSAGEM DA RJ7 AI
    // ----------------------------------------------

    if (type === "bot") {

        wrapper.innerHTML = `

            <div class="rj7-ai-message-avatar">

                <img
                    src="../images/logo/logo-rj7.png"
                    alt="RJ7"
                >

            </div>

            <div class="rj7-ai-message-content">

                <p></p>

            </div>

        `;

    }


    // ----------------------------------------------
    // MENSAGEM DO UTILIZADOR
    // ----------------------------------------------

    else {

        wrapper.innerHTML = `

            <div class="rj7-ai-message-content">

                <p></p>

            </div>

        `;

    }


    const paragraph =
        wrapper.querySelector("p");


    paragraph.textContent =
        message;


    rj7AIConversation.appendChild(
        wrapper
    );


    rj7AIConversation.scrollTop =
        rj7AIConversation.scrollHeight;

}


// ======================================================
// INDICADOR "A PENSAR"
// ======================================================

function showRJ7AITyping() {

    if (!rj7AIConversation) {

        return;

    }


    // Evitar criar dois indicadores

    if (
        document.getElementById(
            "rj7AITyping"
        )
    ) {

        return;

    }


    const typing =
        document.createElement("div");


    typing.id =
        "rj7AITyping";


    typing.className =
        "rj7-ai-message rj7-ai-message-bot";


    typing.innerHTML = `

        <div class="rj7-ai-message-avatar">

            <img
                src="../images/logo/logo-rj7.png"
                alt="RJ7"
            >

        </div>

        <div class="rj7-ai-typing">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;


    rj7AIConversation.appendChild(
        typing
    );


    rj7AIConversation.scrollTop =
        rj7AIConversation.scrollHeight;

}


// ======================================================
// REMOVER "A PENSAR"
// ======================================================

function hideRJ7AITyping() {

    const typing =
        document.getElementById(
            "rj7AITyping"
        );


    if (typing) {

        typing.remove();

    }

}


// ======================================================
// PROCESSAR MENSAGEM
// ======================================================

async function processRJ7AIMessage(
    message
) {

    const cleanMessage =
        message.trim();


    if (!cleanMessage) {

        return;

    }


    // ----------------------------------------------
    // EVITAR ENVIO DUPLICADO
    // ----------------------------------------------

    if (
        rj7AIForm &&
        rj7AIForm.dataset.sending === "true"
    ) {

        return;

    }


    if (rj7AIForm) {

        rj7AIForm.dataset.sending =
            "true";

    }


    // ----------------------------------------------
    // GUARDAR PERGUNTA
    // ----------------------------------------------

    rj7AIHistory.push({

        role: "user",

        message:
            cleanMessage

    });


    // ----------------------------------------------
    // MOSTRAR PERGUNTA
    // ----------------------------------------------

    addRJ7AIMessage(
        cleanMessage,
        "user"
    );


    // ----------------------------------------------
    // ESCONDER SUGESTÕES
    // ----------------------------------------------

    if (rj7AIQuickActions) {

        rj7AIQuickActions.style.display =
            "none";

    }


    // ----------------------------------------------
    // MOSTRAR "A PENSAR"
    // ----------------------------------------------

    showRJ7AITyping();


    try {

        // ==========================================
        // ENVIAR PERGUNTA PARA A RJ7 AI
        // ==========================================

        const response =
            await fetch(
                RJ7_AI_FUNCTION_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        question:
                            cleanMessage

                    })

                }
            );


        // ==========================================
        // TENTAR LER A RESPOSTA
        // ==========================================

        let data = null;

        try {

            data =
                await response.json();

        } catch (
            jsonError
        ) {

            console.error(
                "RJ7 AI — resposta não é JSON:",
                jsonError
            );

        }


        // ==========================================
        // REMOVER INDICADOR
        // ==========================================

        hideRJ7AITyping();


        // ==========================================
        // VERIFICAR RESPOSTA
        // ==========================================

        if (
            !response.ok ||
            !data ||
            !data.success
        ) {

            const errorMessage =
                data?.error ||
                `Erro HTTP ${response.status}`;

            throw new Error(
                errorMessage
            );

        }


        // ==========================================
        // RECEBER RESPOSTA DA IA
        // ==========================================

        const answer =
            data.answer;


        if (
            !answer ||
            typeof answer !== "string"
        ) {

            throw new Error(
                "A RJ7 AI não devolveu uma resposta válida."
            );

        }


        // ==========================================
        // GUARDAR RESPOSTA NO HISTÓRICO
        // ==========================================

        rj7AIHistory.push({

            role: "assistant",

            message:
                answer

        });


        // ==========================================
        // MOSTRAR RESPOSTA
        // ==========================================

        addRJ7AIMessage(
            answer,
            "bot"
        );


    } catch (
        error
    ) {

        console.error(
            "RJ7 AI ERROR:",
            error
        );


        hideRJ7AITyping();


        addRJ7AIMessage(
            "Desculpa. Não consegui ligar à RJ7 AI neste momento. Tenta novamente.",
            "bot"
        );

    }


    // ----------------------------------------------
    // LIBERTAR FORMULÁRIO
    // ----------------------------------------------

    if (rj7AIForm) {

        rj7AIForm.dataset.sending =
            "false";

    }

}


// ======================================================
// FORMULÁRIO
// ======================================================

if (rj7AIForm) {

    rj7AIForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            if (!rj7AIInput) {

                return;

            }


            const message =
                rj7AIInput.value.trim();


            if (!message) {

                return;

            }


            // Limpar campo

            rj7AIInput.value =
                "";


            // Enviar para a IA

            processRJ7AIMessage(
                message
            );

        }
    );

}


// ======================================================
// BOTÕES DE SUGESTÃO
// ======================================================

if (rj7AIQuickActions) {

    rj7AIQuickActions
        .querySelectorAll(
            "[data-ai-question]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const question =
                            this.dataset.aiQuestion;


                        if (!question) {

                            return;

                        }


                        processRJ7AIMessage(
                            question
                        );

                    }
                );

            }
        );

}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

console.log(
    "RJ7 AI 2.0 — Interface iniciada."
);
// ======================================================
// RJ7 BUILD YOUR LOOK — INTELLIGENT STYLE SYSTEM
// ======================================================

(function initRJ7BuildYourLook() {

    "use strict";


    // ==================================================
    // ELEMENTOS
    // ==================================================

    const buildSection =
        document.getElementById("rj7BuildLook");

    const styleOptions =
        document.getElementById("rj7StyleOptions");

    const resetButton =
        document.getElementById("rj7BuildLookReset");

    const closeButton =
        document.getElementById("rj7BuildLookClose");

    const productList =
        document.getElementById("productList");

    const searchInput =
        document.getElementById("searchInput");


    // ==================================================
    // SE NÃO ESTIVER NA SHOP, NÃO FAZER NADA
    // ==================================================

    if (!buildSection) {
        return;
    }


    // ==================================================
    // ESTADO
    // ==================================================

    let currentRJ7Style = null;


    // ==================================================
    // PALAVRAS-CHAVE DOS ESTILOS
    // ==================================================

    const RJ7_STYLE_KEYWORDS = {

        casual: [

            "casual",
            "everyday",
            "basic",
            "t-shirt",
            "tshirt",
            "camisola",
            "camiseta",
            "shirt",
            "hoodie",
            "sweatshirt",
            "street"

        ],


        sport: [

            "sport",
            "sports",
            "treino",
            "training",
            "fitness",
            "gym",
            "academia",
            "corrida",
            "running",
            "performance",
            "athletic",
            "jogger",
            "shorts",
            "desporto"

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
            "premium",
            "quality",
            "qualidade"

        ],


        minimal: [

            "minimal",
            "minimalist",
            "minimalista",
            "clean",
            "basic",
            "essencial",
            "essential",
            "simple",
            "simples",
            "clean"

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
            "t-shirt",
            "camisola",
            "shirt"

        ]

    };


    // ==================================================
    // NORMALIZAR TEXTO
    // ==================================================

function normalizeRJ7Text(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

}


    // ==================================================
    // OBTER TEXTO DE UM PRODUTO
    // ==================================================

function getProductSearchText(product) {

    if (!product) {
        return "";
    }

    const values = [

        product.name,
        product.description,
        product.category

    ];

    return values
        .filter(Boolean)
        .map(normalizeRJ7Text)
        .join(" ");

}


    // ==================================================
    // VERIFICAR SE UM PRODUTO COMBINA COM O ESTILO
    // ==================================================

function productMatchesStyle(
    product,
    style
) {

    if (!product || !style) {
        return false;
    }

    const text =
        getProductSearchText(product);

    if (!text) {
        return false;
    }

    const keywords =
        RJ7_STYLE_KEYWORDS[style];

    if (!keywords) {
        return false;
    }

    return keywords.some(
        keyword => {

            const normalizedKeyword =
                normalizeRJ7Text(
                    keyword
                );

            return text.includes(
                normalizedKeyword
            );

        }
    );

}


    // ==================================================
    // OBTER PRODUTOS EXISTENTES
    // ==================================================
    //
    // O sistema tenta encontrar automaticamente
    // os produtos que o teu script já carregou.
    //
    // Não criamos produtos falsos.
    //
    // ==================================================

    function getRJ7Products() {

        const possibleSources = [

            window.products,
            window.allProducts,
            window.rj7Products,
            window.RJ7Products,
            window.shopProducts

        ];


        for (
            const source
            of possibleSources
        ) {

            if (
                Array.isArray(source)
            ) {

                return source;

            }

        }


        return [];

    }


    // ==================================================
    // ESCONDER / MOSTRAR PRODUTOS DO DOM
    // ==================================================

    function filterProductCardsByText(
        style
    ) {

        if (!productList) {
            return false;
        }


        const cards =
            productList.children;


        if (!cards.length) {

            return false;

        }


        let visibleCount = 0;


        Array.from(cards).forEach(
            card => {

                const text =
                    normalizeRJ7Text(
                        card.textContent
                    );


                const keywords =
                    RJ7_STYLE_KEYWORDS[
                        style
                    ] || [];


                const matches =
                    keywords.some(
                        keyword => {

                            return text.includes(
                                normalizeRJ7Text(
                                    keyword
                                )
                            );

                        }
                    );


                if (matches) {

                    card.style.display =
                        "";

                    card.removeAttribute(
                        "data-rj7-hidden"
                    );

                    visibleCount++;

                } else {

                    card.style.display =
                        "none";

                    card.setAttribute(
                        "data-rj7-hidden",
                        "true"
                    );

                }

            }
        );


        return visibleCount > 0;

    }


    // ==================================================
    // RESTAURAR TODOS OS PRODUTOS
    // ==================================================

    function showAllRJ7Products() {

        if (!productList) {
            return;
        }


        Array.from(
            productList.children
        ).forEach(
            card => {

                card.style.display =
                    "";

                card.removeAttribute(
                    "data-rj7-hidden"
                );

            }
        );

    }


    // ==================================================
    // APLICAR ESTILO
    // ==================================================

    function applyRJ7Style(
        style
    ) {

        if (!style) {
            return;
        }


        currentRJ7Style =
            style;


        // ----------------------------------------------
        // ATUALIZAR BOTÕES
        // ----------------------------------------------

        if (styleOptions) {

            styleOptions
                .querySelectorAll(
                    "[data-rj7-style]"
                )
                .forEach(
                    button => {

                        const buttonStyle =
                            button.dataset.rj7Style;


                        button.classList.toggle(
                            "active",
                            buttonStyle === style
                        );

                    }
                );

        }


        // ----------------------------------------------
        // TENTAR FILTRAR OS PRODUTOS
        // ----------------------------------------------

        const products =
            getRJ7Products();


        let matchedProducts = [];


        if (
            products.length
        ) {

            matchedProducts =
                products.filter(
                    product =>
                        productMatchesStyle(
                            product,
                            style
                        )
                );

        }


        // ----------------------------------------------
        // SE OS PRODUTOS JÁ ESTÃO NO DOM
        // ----------------------------------------------

        const domFiltered =
            filterProductCardsByText(
                style
            );


        // ----------------------------------------------
        // ATUALIZAR PESQUISA
        // ----------------------------------------------

        if (searchInput) {

            searchInput.value = "";

        }


        // ----------------------------------------------
        // GUARDAR ESTILO NA URL
        // ----------------------------------------------

        const url =
            new URL(
                window.location.href
            );


        url.searchParams.set(
            "style",
            style
        );


        window.history.replaceState(
            {},
            "",
            url.toString()
        );


        // ----------------------------------------------
        // MARCAR SHOP
        // ----------------------------------------------

        document.body.dataset.rj7Style =
            style;


        // ----------------------------------------------
        // RESULTADO
        // ----------------------------------------------

        updateRJ7BuildResult(
            style,
            matchedProducts.length,
            domFiltered
        );


        // ----------------------------------------------
        // IR ATÉ OS PRODUTOS
        // ----------------------------------------------

        setTimeout(
            function () {

                if (productList) {

                    productList.scrollIntoView({

                        behavior: "smooth",

                        block: "start"

                    });

                }

            },
            250
        );

    }


    // ==================================================
    // RESULTADO VISUAL
    // ==================================================

    function updateRJ7BuildResult(
        style,
        matchedCount,
        domFiltered
    ) {

        let result =
            document.getElementById(
                "rj7BuildResult"
            );


        if (!result) {

            result =
                document.createElement(
                    "div"
                );

            result.id =
                "rj7BuildResult";

            result.className =
                "rj7-build-result";


            const parent =
                productList
                    ? productList.parentElement
                    : null;


            if (parent) {

                parent.insertBefore(
                    result,
                    productList
                );

            }

        }


        const styleName =
            style.charAt(0).toUpperCase()
            + style.slice(1);


        const foundProducts =
            matchedCount > 0 ||
            domFiltered;


        if (foundProducts) {

            result.innerHTML = `

                <div class="rj7-build-result-inner">

                    <span>
                        RJ7 STYLE MATCH
                    </span>

                    <strong>
                        ${styleName}
                    </strong>

                    <p>
                        Encontrámos peças que combinam
                        com esta direção de estilo.
                    </p>

                </div>

            `;

        } else {

            result.innerHTML = `

                <div class="rj7-build-result-inner">

                    <span>
                        RJ7 STYLE MATCH
                    </span>

                    <strong>
                        ${styleName}
                    </strong>

                    <p>
                        Ainda não encontramos produtos
                        classificados especificamente
                        para este estilo.
                    </p>

                </div>

            `;

        }

    }


    // ==================================================
    // LIMPAR ESTILO
    // ==================================================

    function resetRJ7Style() {

        currentRJ7Style =
            null;


        // ----------------------------------------------
        // REMOVER ACTIVE
        // ----------------------------------------------

        if (styleOptions) {

            styleOptions
                .querySelectorAll(
                    "[data-rj7-style]"
                )
                .forEach(
                    button => {

                        button.classList.remove(
                            "active"
                        );

                    }
                );

        }


        // ----------------------------------------------
        // MOSTRAR TODOS
        // ----------------------------------------------

        showAllRJ7Products();


        // ----------------------------------------------
        // LIMPAR PESQUISA
        // ----------------------------------------------

        if (searchInput) {

            searchInput.value = "";

        }


        // ----------------------------------------------
        // REMOVER URL
        // ----------------------------------------------

        const url =
            new URL(
                window.location.href
            );


        url.searchParams.delete(
            "style"
        );


        url.searchParams.delete(
            "build"
        );


        window.history.replaceState(
            {},
            "",
            url.toString()
        );


        // ----------------------------------------------
        // REMOVER DATASET
        // ----------------------------------------------

        delete document.body.dataset.rj7Style;


        // ----------------------------------------------
        // REMOVER RESULTADO
        // ----------------------------------------------

        const result =
            document.getElementById(
                "rj7BuildResult"
            );


        if (result) {

            result.remove();

        }

    }


    // ==================================================
    // MOSTRAR BUILD YOUR LOOK
    // ==================================================

    function openBuildYourLook() {

        buildSection.setAttribute(
            "aria-hidden",
            "false"
        );


        buildSection.classList.add(
            "active"
        );

    }


    // ==================================================
    // FECHAR BUILD YOUR LOOK
    // ==================================================

    function closeBuildYourLook() {

        buildSection.setAttribute(
            "aria-hidden",
            "true"
        );


        buildSection.classList.remove(
            "active"
        );

    }


    // ==================================================
    // CLIQUE NOS ESTILOS
    // ==================================================

    if (styleOptions) {

        styleOptions
            .querySelectorAll(
                "[data-rj7-style]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const style =
                                this.dataset.rj7Style;


                            if (!style) {
                                return;
                            }


                            applyRJ7Style(
                                style
                            );

                        }
                    );

                }
            );

    }


    // ==================================================
    // LIMPAR
    // ==================================================

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            function () {

                resetRJ7Style();

            }
        );

    }


    // ==================================================
    // VER TODA A COLEÇÃO
    // ==================================================

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                resetRJ7Style();

                closeBuildYourLook();

            }
        );

    }


    // ==================================================
    // LER PARÂMETROS DA URL
    // ==================================================

    function readRJ7BuildURL() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const style =
            params.get("style");


        const build =
            params.get("build");


        if (
            build === "true"
        ) {

            openBuildYourLook();

        }


        if (
            style &&
            RJ7_STYLE_KEYWORDS[style]
        ) {

            openBuildYourLook();


            setTimeout(
                function () {

                    applyRJ7Style(
                        style
                    );

                },
                500
            );

        }

    }


    // ==================================================
    // OBSERVAR PRODUTOS
    //
    // Se o script principal carregar os produtos
    // depois deste código, tentamos aplicar novamente.
    // ==================================================

    if (productList) {

        const observer =
            new MutationObserver(
                function () {

                    if (
                        currentRJ7Style
                    ) {

                        filterProductCardsByText(
                            currentRJ7Style
                        );

                    }

                }
            );


        observer.observe(
            productList,
            {
                childList: true,
                subtree: true
            }
        );

    }


    // ==================================================
    // INICIALIZAÇÃO
    // ==================================================

    readRJ7BuildURL();


    console.log(
        "RJ7 BUILD YOUR LOOK — Sistema iniciado."
    );


})();

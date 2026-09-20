// ======================================================
// RJ7 AI — INTELIGÊNCIA OFICIAL RIGHTJOMA7
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
// ESTADO
// ======================================================

let rj7AIHistory = [];

let rj7AIRequestInProgress = false;


// ======================================================
// CAMINHO DO LOGO
// Funciona tanto em páginas dentro de /pages
// como na página principal.
// ======================================================

function getRJ7AILogoPath() {

    const path =
        window.location.pathname;

    if (
        path.includes("/pages/")
    ) {

        return "../images/logo/logo-rj7.png";

    }

    return "images/logo/logo-rj7.png";
}


// ======================================================
// ABRIR RJ7 AI
// ======================================================

function openRJ7AI() {

    if (!rj7AIPanel) {

        return;

    }


    rj7AIPanel.classList.add(
        "active"
    );


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


// ======================================================
// FECHAR RJ7 AI
// ======================================================

function closeRJ7AI() {

    if (!rj7AIPanel) {

        return;

    }


    rj7AIPanel.classList.remove(
        "active"
    );


    rj7AIPanel.setAttribute(
        "aria-hidden",
        "true"
    );

}


// ======================================================
// EVENTO — ABRIR
// ======================================================

if (rj7AIButton) {

    rj7AIButton.addEventListener(
        "click",
        openRJ7AI
    );

}


// ======================================================
// EVENTO — FECHAR
// ======================================================

if (rj7AIClose) {

    rj7AIClose.addEventListener(
        "click",
        closeRJ7AI
    );

}


// ======================================================
// ESC FECHA A RJ7 AI
// ======================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeRJ7AI();

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
        "rj7-ai-message rj7-ai-message-" +
        type;


    if (type === "bot") {

        wrapper.innerHTML = `

            <div class="rj7-ai-message-avatar">

                <img
                    src="${getRJ7AILogoPath()}"
                    alt="RJ7 AI"
                >

            </div>

            <div class="rj7-ai-message-content">

                <p></p>

            </div>

        `;

    } else {

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
// INDICADOR — RJ7 AI A PENSAR
// ======================================================

function showRJ7AITyping() {

    if (!rj7AIConversation) {

        return;

    }


    hideRJ7AITyping();


    const typing =
        document.createElement("div");


    typing.id =
        "rj7AITyping";


    typing.className =
        "rj7-ai-message rj7-ai-message-bot";


    typing.innerHTML = `

        <div class="rj7-ai-message-avatar">

            <img
                src="${getRJ7AILogoPath()}"
                alt="RJ7 AI"
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
// REMOVER INDICADOR
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
// MOSTRAR RESPOSTA DE ERRO
// ======================================================

function showRJ7AIError() {

    addRJ7AIMessage(
        "Desculpa. A RJ7 AI não conseguiu responder neste momento. Tenta novamente daqui a pouco.",
        "bot"
    );

}


// ======================================================
// ENVIAR PERGUNTA PARA A RJ7 AI
// ======================================================

async function askRJ7AI(
    question
) {

    const cleanQuestion =
        question.trim();


    if (!cleanQuestion) {

        return;

    }


    if (
        rj7AIRequestInProgress
    ) {

        return;

    }


    rj7AIRequestInProgress =
        true;


    // ----------------------------------------------
    // HISTÓRICO
    // ----------------------------------------------

    rj7AIHistory.push({

        role: "user",

        message:
            cleanQuestion

    });


    // ----------------------------------------------
    // MOSTRAR PERGUNTA
    // ----------------------------------------------

    addRJ7AIMessage(
        cleanQuestion,
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

        const response =
            await fetch(
                RJ7_AI_FUNCTION_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            question:
                                cleanQuestion,

                            history:
                                rj7AIHistory

                        })

                }
            );


        // ------------------------------------------
        // REMOVER "A PENSAR"
        // ------------------------------------------

        hideRJ7AITyping();


        // ------------------------------------------
        // VERIFICAR RESPOSTA HTTP
        // ------------------------------------------

        if (
            !response.ok
        ) {

            console.error(
                "RJ7 AI HTTP ERROR:",
                response.status
            );

            showRJ7AIError();

            return;

        }


        // ------------------------------------------
        // LER JSON
        // ------------------------------------------

        const data =
            await response.json();


        // ------------------------------------------
        // VERIFICAR ERRO DA FUNÇÃO
        // ------------------------------------------

        if (
            !data ||
            data.success !== true
        ) {

            console.error(
                "RJ7 AI FUNCTION ERROR:",
                data
            );

            showRJ7AIError();

            return;

        }


        // ------------------------------------------
        // RESPOSTA DA IA
        // ------------------------------------------

        const answer =
            typeof data.answer === "string"
                ? data.answer.trim()
                : "";


        if (!answer) {

            showRJ7AIError();

            return;

        }


        // ------------------------------------------
        // GUARDAR RESPOSTA
        // ------------------------------------------

        rj7AIHistory.push({

            role: "assistant",

            message:
                answer

        });


        // ------------------------------------------
        // MOSTRAR RESPOSTA
        // ------------------------------------------

        addRJ7AIMessage(
            answer,
            "bot"
        );


    } catch (error) {

        hideRJ7AITyping();


        console.error(
            "RJ7 AI NETWORK ERROR:",
            error
        );


        showRJ7AIError();


    } finally {

        rj7AIRequestInProgress =
            false;

    }

}


// ======================================================
// FORMULÁRIO
// ======================================================

if (rj7AIForm) {

    rj7AIForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!rj7AIInput) {

                return;

            }


            const message =
                rj7AIInput.value.trim();


            if (!message) {

                return;

            }


            rj7AIInput.value =
                "";


            await askRJ7AI(
                message
            );

        }
    );

}


// ======================================================
// BOTÕES DE PERGUNTAS RÁPIDAS
// ======================================================

if (rj7AIQuickActions) {

    const buttons =
        rj7AIQuickActions.querySelectorAll(
            "[data-ai-question]"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const question =
                        this.dataset.aiQuestion;


                    if (!question) {

                        return;

                    }


                    await askRJ7AI(
                        question
                    );

                }
            );

        }
    );

}


// ======================================================
// FUNÇÕES DISPONÍVEIS GLOBALMENTE
// ======================================================

window.RJ7AI = {

    open:
        openRJ7AI,

    close:
        closeRJ7AI,

    ask:
        askRJ7AI,

    clearHistory:
        function () {

            rj7AIHistory = [];

        }

};


// ======================================================
// INICIALIZAÇÃO
// ======================================================

console.log(
    "RJ7 AI 2.0 — Interface iniciada."
);
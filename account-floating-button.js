// ======================================================
// RJ7 — ACCOUNT FLOATING BUTTON
// ======================================================

import { supabase } from "./supabase.js";


// ======================================================
// CRIAR BOTÃO
// ======================================================

function createAccountFloatingButton() {

    if (
        document.getElementById(
            "rj7FloatingAccount"
        )
    ) {
        return;
    }


    const button =
        document.createElement("a");


    button.id =
        "rj7FloatingAccount";


    button.className =
        "rj7-floating-account";


    button.setAttribute(
        "aria-label",
        "Minha conta"
    );


    // --------------------------------------------------
    // CAMINHO DO LOGO
    // --------------------------------------------------

    const logoPath =
        window.location.pathname.includes("/pages/")
            ? "../images/logo/logo-rj7.png"
            : "images/logo/logo-rj7.png";


    // --------------------------------------------------
    // CAMINHO DO DASHBOARD
    // --------------------------------------------------

    const dashboardPath =
        window.location.pathname.includes("/pages/")
            ? "dashboard.html"
            : "pages/dashboard.html";


    button.href =
        dashboardPath;


    button.innerHTML = `

        <img
            src="${logoPath}"
            alt="RJ7"
        >

    `;


    document.body.appendChild(
        button
    );

}


// ======================================================
// REMOVER BOTÃO
// ======================================================

function removeAccountFloatingButton() {

    const button =
        document.getElementById(
            "rj7FloatingAccount"
        );


    if (button) {

        button.remove();

    }

}


// ======================================================
// VERIFICAR SESSÃO
// ======================================================

async function checkAccountSession() {

    try {

        const {
            data,
            error
        } =
            await supabase.auth.getSession();


        if (error) {

            console.error(
                "RJ7 ACCOUNT — erro:",
                error
            );

            removeAccountFloatingButton();

            return;
        }


        if (
            data &&
            data.session &&
            data.session.user
        ) {

            createAccountFloatingButton();

        } else {

            removeAccountFloatingButton();

        }

    } catch (error) {

        console.error(
            "RJ7 ACCOUNT — erro inesperado:",
            error
        );

        removeAccountFloatingButton();

    }

}


// ======================================================
// LOGIN / LOGOUT
// ======================================================

supabase.auth.onAuthStateChange(
    function (
        event,
        session
    ) {

        if (
            session &&
            session.user
        ) {

            createAccountFloatingButton();

        } else {

            removeAccountFloatingButton();

        }

    }
);


// ======================================================
// INICIAR
// ======================================================

checkAccountSession();


console.log(
    "RJ7 — Account Floating Button carregado."
);
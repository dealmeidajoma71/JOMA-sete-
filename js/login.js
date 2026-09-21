import { supabase } from "./supabase.js";

console.log("RJ7 LOGIN: módulo carregado");

// ======================================================
// VERIFICAR SESSÃO EXISTENTE
// ======================================================

async function checkExistingSession() {

    try {

        const {
            data,
            error
        } = await supabase.auth.getSession();


        if (error) {

            console.error(
                "RJ7 LOGIN — erro ao verificar sessão:",
                error
            );

            return;
        }


        // ==================================================
        // UTILIZADOR JÁ ESTÁ LOGADO
        // ==================================================

        if (data?.session) {

            console.log(
                "RJ7 LOGIN — sessão existente."
            );

            console.log(
                "RJ7 LOGIN — redirecionando para dashboard."
            );


            window.location.replace(
                "dashboard.html"
            );

        }

    } catch (error) {

        console.error(
            "RJ7 LOGIN — erro ao verificar sessão:",
            error
        );

    }

}


checkExistingSession();
const form = document.querySelector("form");


if (!form) {

    console.error(
        "RJ7 LOGIN: formulário não encontrado."
    );

} else {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();


        const email =
            document
                .getElementById("email")
                ?.value
                .trim()
                .toLowerCase();


        const password =
            document
                .getElementById("password")
                ?.value;


        if (!email || !password) {

            alert(
                "Preenche o email e a palavra-passe."
            );

            return;
        }


        const loginButton =
            form.querySelector(
                'button[type="submit"]'
            );


        if (loginButton) {

            loginButton.disabled = true;

            loginButton.textContent =
                "A entrar...";
        }


        try {

            console.log(
                "RJ7 LOGIN: a tentar autenticar:",
                email
            );


            const {
                data,
                error
            } =
                await supabase.auth.signInWithPassword({

                    email: email,

                    password: password

                });


            // ======================================
            // RESPOSTA DO SUPABASE
            // ======================================

            console.log(
                "RJ7 LOGIN — DATA:",
                data
            );


            console.log(
                "RJ7 LOGIN — ERROR:",
                error
            );


            if (error) {

                console.error(
                    "RJ7 LOGIN — mensagem:",
                    error.message
                );


                console.error(
                    "RJ7 LOGIN — código:",
                    error.code
                );


                console.error(
                    "RJ7 LOGIN — status:",
                    error.status
                );


                // ==================================
                // EMAIL NÃO CONFIRMADO
                // ==================================

                if (
                    error.code ===
                    "email_not_confirmed"
                ) {

                    alert(
                        "O email desta conta ainda não foi confirmado. Verifica o email recebido do RJ7."
                    );

                    return;
                }


                // ==================================
                // CREDENCIAIS INCORRETAS
                // ==================================

                if (
                    error.code ===
                    "invalid_credentials"
                ) {

                    alert(
                        "O Supabase rejeitou o email ou a palavra-passe."
                    );

                    return;
                }


                alert(
                    error.message
                );

                return;
            }


            // ======================================
            // UTILIZADOR
            // ======================================

            const user =
                data?.user;


            if (!user) {

                alert(
                    "O login não devolveu um utilizador."
                );

                return;
            }


            console.log(
                "RJ7 LOGIN — utilizador autenticado:",
                user.id
            );


            console.log(
                "RJ7 LOGIN — email:",
                user.email
            );


            // ======================================
            // SESSÃO
            // ======================================

            const {
                data: sessionData,
                error: sessionError
            } =
                await supabase.auth.getSession();


            console.log(
                "RJ7 LOGIN — sessão:",
                sessionData?.session
            );


            if (sessionError) {

                console.error(
                    "RJ7 LOGIN — erro da sessão:",
                    sessionError
                );

                alert(
                    sessionError.message
                );

                return;
            }


            if (!sessionData?.session) {

                alert(
                    "O utilizador foi encontrado, mas não existe uma sessão ativa."
                );

                return;
            }


            console.log(
                "RJ7 LOGIN — sessão criada com sucesso."
            );


            // ======================================
            // DASHBOARD
            // ======================================

            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(
                "RJ7 LOGIN — erro inesperado:",
                error
            );


            alert(
                "Erro: " +
                (
                    error?.message ||
                    error
                )
            );


        } finally {

            if (loginButton) {

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "Entrar";

            }

        }

    });

}
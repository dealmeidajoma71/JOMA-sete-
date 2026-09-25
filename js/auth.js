import { supabase } from "./supabase.js";

console.log("RJ7 AUTH: módulo carregado");
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
const form = document.querySelector("form");

if (!form) {

    console.error(
        "RJ7 AUTH: formulário não encontrado."
    );

} else {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();


        const full_name =
            document
                .getElementById("full_name")
                ?.value
                .trim();


        const email =
            document
                .getElementById("email")
                ?.value
                .trim();


        const phone =
            document
                .getElementById("phone")
                ?.value
                .trim();


        const password =
            document
                .getElementById("password")
                ?.value;


        const confirm_password =
            document
                .getElementById("confirm_password")
                ?.value;


        // ==========================================
        // VALIDAR CAMPOS
        // ==========================================

        if (
            !full_name ||
            !email ||
            !phone ||
            !password ||
            !confirm_password
        ) {

            rj7Notify(
                "Preenche todos os campos."
            );

            return;

        }


        // ==========================================
        // VALIDAR PALAVRAS-PASSE
        // ==========================================

        if (
            password !==
            confirm_password
        ) {

            rj7Notify(
                "As palavras-passe não coincidem."
            );

            return;

        }


        // ==========================================
        // CRIAR UTILIZADOR
        // ==========================================

        try {

            const {
                data,
                error
            } =
                await supabase.auth.signUp({

                    email: email,

                    password: password,

                    options: {

                        data: {

                            full_name:
                                full_name,

                            phone:
                                phone

                        }

                    }

                });


            // ======================================
            // ERRO NO SUPABASE AUTH
            // ======================================

            if (error) {

                console.error(
                    "RJ7 AUTH — erro:",
                    error
                );

                rj7Notify(
                    error.message
                );

                return;

            }


            // ======================================
            // VERIFICAR UTILIZADOR
            // ======================================

            const user =
                data?.user;


            if (!user) {

                rj7Notify(
                    "Não foi possível criar o utilizador."
                );

                return;

            }


            console.log(
                "RJ7 AUTH — utilizador criado:",
                user.id
            );


            // ======================================
            // O PERFIL SERÁ CRIADO PELO TRIGGER
            // ======================================

            console.log(
                "RJ7 AUTH — aguardando criação automática do perfil..."
            );


            // ======================================
            // SUCESSO
            // ======================================

            rj7Notify(
                "Conta criada com sucesso!"
            );


            window.location.href =
                "login.html";


        } catch (error) {

            console.error(
                "RJ7 AUTH — erro inesperado:",
                error
            );


            rj7Notify(
                "Erro: " +
                (
                    error?.message ||
                    error
                )
            );

        }

    });

}
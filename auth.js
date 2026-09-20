import { supabase } from "./supabase.js";

console.log("RJ7 AUTH: módulo carregado");

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

            alert(
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

            alert(
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

                alert(
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

                alert(
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

            alert(
                "Conta criada com sucesso!"
            );


            window.location.href =
                "login.html";


        } catch (error) {

            console.error(
                "RJ7 AUTH — erro inesperado:",
                error
            );


            alert(
                "Erro: " +
                (
                    error?.message ||
                    error
                )
            );

        }

    });

}
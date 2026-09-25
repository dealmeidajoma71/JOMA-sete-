import { supabase } from "./supabase.js";

console.log("RJ7 EDIT PROFILE: módulo carregado");
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
const form = document.getElementById("edit-profile-form");

const nameInput = document.getElementById("full_name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");


if (!form) {

    console.error(
        "RJ7 EDIT PROFILE: formulário não encontrado."
    );

} else {

    carregarPerfil();

    // ==================================================
    // CARREGAR PERFIL
    // ==================================================

    async function carregarPerfil() {

        try {

            const {
                data: { user },
                error: userError
            } = await supabase.auth.getUser();


            if (userError || !user) {

                console.error(
                    "RJ7 EDIT PROFILE — utilizador não autenticado:",
                    userError
                );

                window.location.href = "login.html";

                return;
            }


            console.log(
                "RJ7 EDIT PROFILE — utilizador:",
                user.id
            );


            const {
                data: profile,
                error: profileError
            } = await supabase
                .from("users")
                .select("id, full_name, email, phone")
                .eq("id", user.id)
                .maybeSingle();


            if (profileError) {

                console.error(
                    "RJ7 EDIT PROFILE — erro ao buscar perfil:",
                    profileError
                );

                rj7Notify(
    "Não foi possível carregar o teu perfil."
);

                return;
            }


            console.log(
                "RJ7 EDIT PROFILE — perfil encontrado:",
                profile
            );


            if (nameInput) {

                nameInput.value =
                    profile?.full_name ||
                    user.user_metadata?.full_name ||
                    "";
            }


            if (emailInput) {

                emailInput.value =
                    profile?.email ||
                    user.email ||
                    "";
            }


            if (phoneInput) {

                phoneInput.value =
                    profile?.phone ||
                    user.user_metadata?.phone ||
                    "";
            }


        } catch (error) {

            console.error(
                "RJ7 EDIT PROFILE — erro ao carregar:",
                error
            );

        }

    }


    // ==================================================
    // GUARDAR ALTERAÇÕES
    // ==================================================

    form.addEventListener("submit", async (e) => {

        e.preventDefault();


        const fullName =
            nameInput?.value.trim();

        const phone =
            phoneInput?.value.trim();


        if (!fullName) {

            rj7Notify(
                "Introduz o teu nome completo."
            );

            return;
        }


        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();


        if (userError || !user) {

            rj7Notify(
                "A tua sessão expirou. Inicia sessão novamente."
            );

            window.location.href = "login.html";

            return;
        }


        const button =
            form.querySelector(
                'button[type="submit"]'
            );


        if (button) {

            button.disabled = true;
            button.textContent = "A guardar...";

        }


        try {

            console.log(
                "RJ7 EDIT PROFILE — ID autenticado:",
                user.id
            );


            console.log(
                "RJ7 EDIT PROFILE — novos dados:",
                {
                    full_name: fullName,
                    phone: phone
                }
            );


            // ==================================================
            // 1. ATUALIZAR SUPABASE AUTH
            // ==================================================

            const {
                data: authData,
                error: authError
            } = await supabase.auth.updateUser({

                data: {
                    full_name: fullName,
                    phone: phone
                }

            });


            if (authError) {

                console.error(
                    "RJ7 EDIT PROFILE — erro Auth:",
                    authError
                );

                rj7Notify(
                    "Erro ao atualizar a conta: " +
                    authError.message
                );

                return;
            }


            console.log(
                "RJ7 EDIT PROFILE — Auth atualizado:",
                authData?.user
            );


            // ==================================================
            // 2. ATUALIZAR TABELA users
            // ==================================================

            const {
                data: updatedProfile,
                error: dbError
            } = await supabase
                .from("users")
                .update({

                    full_name: fullName,
                    phone: phone

                })
                .eq("id", user.id)
                .select("id, full_name, email, phone")
                .maybeSingle();


            if (dbError) {

                console.error(
                    "RJ7 EDIT PROFILE — erro ao atualizar users:",
                    dbError
                );

                rj7Notify(
                    "Erro ao atualizar o perfil: " +
                    dbError.message
                );

                return;
            }


            // ==================================================
            // 3. VERIFICAR SE EXISTE PERFIL
            // ==================================================

            if (!updatedProfile) {

                console.error(
                    "RJ7 EDIT PROFILE — nenhuma linha atualizada."
                );

                console.error(
                    "RJ7 EDIT PROFILE — ID procurado:",
                    user.id
                );

                rj7Notify(
                    "O perfil não foi encontrado para este utilizador."
                );

                return;
            }


            console.log(
                "RJ7 EDIT PROFILE — perfil atualizado:",
                updatedProfile
            );


            // ==================================================
            // 4. CONFIRMAR
            // ==================================================

            rj7Notify(
                "Perfil atualizado com sucesso!"
            );


            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(
                "RJ7 EDIT PROFILE — erro inesperado:",
                error
            );

            rj7Notify(
                "Erro: " +
                (
                    error?.message ||
                    error
                )
            );

        } finally {

            if (button) {

                button.disabled = false;
                button.textContent =
                    "Guardar Alterações";

            }

        }

    });

}
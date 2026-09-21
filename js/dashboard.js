import { supabase } from "./supabase.js";

console.log("RJ7 DASHBOARD: módulo carregado");

async function carregarDashboard() {

    try {

        // ==========================================
        // VERIFICAR SESSÃO
        // ==========================================

        const {
            data: { session },
            error: sessionError
        } = await supabase.auth.getSession();


        if (sessionError) {

            console.error(
                "RJ7 DASHBOARD — erro ao verificar sessão:",
                sessionError
            );

            window.location.href = "login.html";

            return;
        }


        // ==========================================
        // UTILIZADOR NÃO ESTÁ AUTENTICADO
        // ==========================================

        if (!session || !session.user) {

            console.log(
                "RJ7 DASHBOARD — utilizador não autenticado."
            );

            window.location.href = "login.html";

            return;
        }


        const authUser = session.user;

        console.log(
            "RJ7 DASHBOARD — utilizador autenticado:",
            authUser.id
        );


        // ==========================================
        // ELEMENTOS DA PÁGINA
        // ==========================================

        const userName =
            document.getElementById("user-name");

        const userEmail =
            document.getElementById("user-email");


        // ==========================================
        // BUSCAR PERFIL NA TABELA users
        // ==========================================

        const {
            data: profile,
            error: profileError
        } = await supabase
            .from("users")
            .select("full_name, email, phone")
            .eq("id", authUser.id)
            .maybeSingle();


        if (profileError) {

            console.error(
                "RJ7 DASHBOARD — erro ao buscar perfil:",
                profileError
            );

            // Mesmo que a tabela dê erro,
            // usamos os dados do Auth.

            if (userName) {
                userName.textContent =
                    authUser.user_metadata?.full_name ||
                    "Utilizador";
            }

            if (userEmail) {
                userEmail.textContent =
                    authUser.email || "";
            }

        } else {

            // ==========================================
            // MOSTRAR DADOS DO PERFIL
            // ==========================================

            if (userName) {

                userName.textContent =
                    profile?.full_name ||
                    authUser.user_metadata?.full_name ||
                    "Utilizador";
            }


            if (userEmail) {

                userEmail.textContent =
                    profile?.email ||
                    authUser.email ||
                    "";
            }

        }


        // ==========================================
        // BOTÃO TERMINAR SESSÃO
        // ==========================================

        const logoutButton =
            document.getElementById("logout-btn");


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async (e) => {

                    e.preventDefault();


                    logoutButton.style.pointerEvents =
                        "none";

                    logoutButton.style.opacity =
                        "0.6";


                    console.log(
                        "RJ7 DASHBOARD — a terminar sessão..."
                    );


                    const {
                        error: logoutError
                    } = await supabase.auth.signOut();


                    if (logoutError) {

                        console.error(
                            "RJ7 DASHBOARD — erro ao terminar sessão:",
                            logoutError
                        );


                        alert(
                            "Não foi possível terminar a sessão."
                        );


                        logoutButton.style.pointerEvents =
                            "auto";

                        logoutButton.style.opacity =
                            "1";

                        return;
                    }


                    console.log(
                        "RJ7 DASHBOARD — sessão terminada."
                    );


                    window.location.href =
                        "login.html";
                }
            );

        }

    } catch (error) {

        console.error(
            "RJ7 DASHBOARD — erro inesperado:",
            error
        );

        window.location.href =
            "login.html";
    }
}


// ==========================================
// INICIAR DASHBOARD
// ==========================================

carregarDashboard();
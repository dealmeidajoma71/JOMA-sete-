import { supabase } from "./supabase.js";


// ==========================================
// VERIFICAR SESSÃO
// ==========================================

const {
    data: { user },
    error: authError
} = await supabase.auth.getUser();


if (authError || !user) {

    window.location.href = "login.html";

} else {

    // ======================================
    // VERIFICAR ADMIN
    // ======================================

    const {
        data: admin,
        error
    } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();


    if (error) {

        console.error(
            "Erro ao verificar administrador:",
            error
        );

        alert(
            "Não foi possível verificar o acesso administrativo."
        );

        window.location.href = "dashboard.html";

    } else if (!admin) {

        alert(
            "Acesso reservado ao administrador."
        );

        window.location.href =
            "dashboard.html";

    } else {

        console.log(
            "RJ7 — Administrador autenticado."
        );

        document.documentElement.classList.add(
            "admin-authorized"
        );

    }

}
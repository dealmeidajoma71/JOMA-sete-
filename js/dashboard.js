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
const profileAvatar =
    document.getElementById("profile-avatar");

const changeProfilePhoto =
    document.getElementById("change-profile-photo");

const profilePhotoInput =
    document.getElementById("profile-photo-input");
    const savedAvatarUrl =
    authUser.user_metadata?.avatar_url;

if (profileAvatar && savedAvatarUrl) {

    profileAvatar.src =
        `${savedAvatarUrl}?t=${Date.now()}`;

}
    if (changeProfilePhoto && profilePhotoInput) {

    changeProfilePhoto.addEventListener("click", () => {
        profilePhotoInput.click();
    });

}
if (profilePhotoInput) {

  profilePhotoInput.addEventListener("change", async () => {

    const file =
        profilePhotoInput.files?.[0];

    if (!file) return;


    // Verificar se é uma imagem
    if (!file.type.startsWith("image/")) {

        console.error(
            "RJ7 DASHBOARD — ficheiro selecionado não é uma imagem."
        );

        profilePhotoInput.value = "";

        return;
    }


    // Limite de 5 MB
    if (file.size > 5 * 1024 * 1024) {

        console.error(
            "RJ7 DASHBOARD — imagem demasiado grande."
        );

        profilePhotoInput.value = "";

        return;
    }


    console.log(
        "RJ7 DASHBOARD — imagem válida:",
        file.name
    );


    try {

        const extension =
            file.name.split(".").pop().toLowerCase();

        const filePath =
            `${authUser.id}/profile-${Date.now()}.${extension}`;


        console.log(
            "RJ7 DASHBOARD — a enviar foto:",
            filePath
        );


        const {
            error: uploadError
        } = await supabase
            .storage
            .from("avatars")
            .upload(
                filePath,
                file,
                {
                    contentType: file.type,
                    upsert: false
                }
            );


        if (uploadError) {

            console.error(
                "RJ7 DASHBOARD — erro no upload:",
                uploadError
            );

            profilePhotoInput.value = "";

            return;
        }


        console.log(
            "RJ7 DASHBOARD — foto enviada com sucesso."
        );
const {
    data: publicUrlData
} = supabase
    .storage
    .from("avatars")
    .getPublicUrl(filePath);

const avatarUrl =
    publicUrlData?.publicUrl;

if (!avatarUrl) {
    console.error(
        "RJ7 DASHBOARD — não foi possível obter o endereço da foto."
    );
    return;
}


const {
    error: avatarUpdateError
} = await supabase.auth.updateUser({
    data: {
        avatar_url: avatarUrl
    }
});


if (avatarUpdateError) {

    console.error(
        "RJ7 DASHBOARD — erro ao guardar foto no perfil:",
        avatarUpdateError
    );

    return;
}


if (profileAvatar) {
    profileAvatar.src =
        `${avatarUrl}?t=${Date.now()}`;
}


console.log(
    "RJ7 DASHBOARD — foto de perfil guardada."
);
    } catch (error) {

        console.error(
            "RJ7 DASHBOARD — erro inesperado ao enviar foto:",
            error
        );

    }

});
}
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
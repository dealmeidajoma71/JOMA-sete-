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
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");
const clearPassword = document.getElementById("clear-password");

const confirmPasswordInput =
    document.getElementById("confirm_password");

const toggleConfirmPassword =
    document.getElementById("toggle-confirm-password");

const clearConfirmPassword =
    document.getElementById("clear-confirm-password");


if (passwordInput && togglePassword) {

    togglePassword.addEventListener("click", () => {

        const isPassword =
            passwordInput.type === "password";

        passwordInput.type =
            isPassword ? "text" : "password";

        const icon =
            togglePassword.querySelector("i");

        if (icon) {

            icon.classList.toggle(
                "fa-eye",
                !isPassword
            );

            icon.classList.toggle(
                "fa-eye-slash",
                isPassword
            );

        }

        togglePassword.setAttribute(
            "aria-label",
            isPassword
                ? "Ocultar palavra-passe"
                : "Mostrar palavra-passe"
        );

    });

}


if (passwordInput && clearPassword) {

    clearPassword.addEventListener("click", () => {

        passwordInput.value = "";
        passwordInput.focus();

    });

}


if (
    confirmPasswordInput &&
    toggleConfirmPassword
) {

    toggleConfirmPassword.addEventListener(
        "click",
        () => {

            const isPassword =
                confirmPasswordInput.type === "password";

            confirmPasswordInput.type =
                isPassword ? "text" : "password";

            const icon =
                toggleConfirmPassword.querySelector("i");

            if (icon) {

                icon.classList.toggle(
                    "fa-eye",
                    !isPassword
                );

                icon.classList.toggle(
                    "fa-eye-slash",
                    isPassword
                );

            }

            toggleConfirmPassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Ocultar palavra-passe"
                    : "Mostrar palavra-passe"
            );

        }
    );

}


if (
    confirmPasswordInput &&
    clearConfirmPassword
) {

    clearConfirmPassword.addEventListener(
        "click",
        () => {

            confirmPasswordInput.value = "";
            confirmPasswordInput.focus();

        }
    );

}
function validateRJ7Phone(countryCode, phone) {

    const number = phone.replace(/\D/g, "");

    // 🇦🇴 Angola — +244
    // Número nacional: 9 dígitos e começa por 9
    if (countryCode === "+244") {

        return /^9\d{8}$/.test(number);
    }

    // 🇳🇦 Namíbia — +264
    // Números de comunicações eletrónicas:
    // 81, 82, 83, 84, 85 ou 86 + 7 dígitos
    if (countryCode === "+264") {

        return /^(81|82|83|84|85|86)\d{7}$/.test(number);
    }

    return false;
}
const form = document.querySelector("form");
function rj7RegisterSuccess() {
    const overlay = document.createElement("div");

    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "100000";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "20px";
    overlay.style.background = "rgba(0, 0, 0, 0.45)";

    const box = document.createElement("div");

    box.style.width = "100%";
    box.style.maxWidth = "380px";
    box.style.padding = "28px";
    box.style.boxSizing = "border-box";
    box.style.background = "#fff";
    box.style.borderRadius = "16px";
    box.style.textAlign = "center";
    box.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.20)";

    box.innerHTML = `
        <h2 style="
            margin: 0 0 12px;
            color: #111;
            font-size: 21px;
        ">
            Conta criada com sucesso!
        </h2>

        <p style="
            margin: 0 0 24px;
            color: #555;
            font-size: 14px;
            line-height: 1.6;
        ">
            Enviámos um e-mail de confirmação para o teu endereço.
            Abre o teu e-mail e clica no link para confirmar a tua conta.
        </p>

        <button
            type="button"
            id="rj7RegisterSuccessOk"
            style="
                width: 100%;
                min-height: 48px;
                border: none;
                border-radius: 999px;
                background: #111;
                color: #fff;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
            "
        >
            OK
        </button>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    document
        .getElementById("rj7RegisterSuccessOk")
        ?.addEventListener("click", () => {
            window.location.href = "login.html";
        });
}
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
const phoneCountry =
    document
        .getElementById("phone_country")
        ?.value;

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
if (!validateRJ7Phone(phoneCountry, phone)) {

    if (phoneCountry === "+244") {

        rj7Notify(
            "Introduz um número de Angola válido. Exemplo: 9××××××××."
        );

    } else if (phoneCountry === "+264") {

        rj7Notify(
            "Introduz um número da Namíbia válido. Exemplo: 8××××××××."
        );

    } else {

        rj7Notify(
            "Seleciona um país válido."
        );
    }

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

            rj7RegisterSuccess();


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
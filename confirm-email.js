import { supabase } from "./supabase.js";

const message = document.getElementById("confirmMessage");

const {
    data: { user },
    error
} = await supabase.auth.getUser();

if (error) {

    message.innerHTML = `
        Não foi possível verificar a confirmação do e-mail.
    `;

} else if (user?.email_confirmed_at) {

    message.innerHTML = `
        O teu e-mail foi confirmado com sucesso.<br><br>
        Já podes entrar na tua conta.
    `;

} else {

    message.innerHTML = `
        O teu e-mail ainda não foi confirmado.<br><br>
        Abre novamente o link enviado para o teu Gmail.
    `;

}
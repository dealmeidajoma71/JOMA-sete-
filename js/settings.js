import { supabase } from "./supabase.js";

const logoutButton = document.getElementById("logout-settings");

if (logoutButton) {

    logoutButton.addEventListener("click", async (e) => {

        e.preventDefault();

        const { error } = await supabase.auth.signOut();

        if (error) {
            alert(error.message);
            return;
        }

        window.location.href = "login.html";

    });

}
/* =========================================================
   RJ7 VOID
   INTRODUCTION SYSTEM
   ========================================================= */

const intro = document.getElementById("rj7Intro");

if (intro) {

    const sessionStarted =
        sessionStorage.getItem("RJ7_SESSION_STARTED");

    if (sessionStarted === "true") {

        // A pessoa já está dentro do site.
        // Não mostrar a intro novamente.
        intro.remove();

    } else {

        // Primeira entrada nesta sessão.
        sessionStorage.setItem(
            "RJ7_SESSION_STARTED",
            "true"
        );

        // A intro aparece normalmente.
        setTimeout(() => {

            intro.classList.add(
                "rj7-intro-finished"
            );

        }, 4800);

        setTimeout(() => {

            intro.remove();

        }, 6200);
    }
}
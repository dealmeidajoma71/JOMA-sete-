import { supabase } from "./supabase.js";


// ======================================================
// ELEMENTOS
// ======================================================

const notificationsList =
    document.getElementById("notificationsList");

const markAllRead =
    document.getElementById("markAllRead");


// ======================================================
// FORMATAR DATA
// ======================================================

function formatNotificationDate(date) {

    if (!date) {
        return "";
    }

    return new Date(date).toLocaleString(
        "pt-AO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ======================================================
// CARREGAR NOTIFICAÇÕES
// ======================================================

async function loadNotifications() {

    if (!notificationsList) {
        return;
    }


    const {
        data: {
            user
        }
    } = await supabase.auth.getUser();


    // ==================================================
    // UTILIZADOR NÃO ESTÁ LOGADO
    // ==================================================

    if (!user) {

        notificationsList.innerHTML = `

            <div class="notifications-empty">

                <i class="fa-regular fa-bell"></i>

                <h2>
                    Inicia sessão
                </h2>

                <p>
                    Inicia sessão para veres as tuas notificações.
                </p>

                <a href="login.html">
                    Entrar na minha conta
                </a>

            </div>

        `;

        return;
    }


    // ==================================================
    // CARREGAR NOTIFICAÇÕES DO UTILIZADOR
    // ==================================================

    const {
        data: notifications,
        error
    } = await supabase

        .from("notifications")

        .select(`
            id,
            user_id,
            order_id,
            title,
            message,
            is_read,
            created_at
        `)

        .eq(
            "user_id",
            user.id
        )

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "RJ7 NOTIFICATIONS — erro:",
            error
        );


        notificationsList.innerHTML = `

            <div class="notifications-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h2>
                    Não foi possível carregar
                </h2>

                <p>
                    Ocorreu um erro ao carregar as notificações.
                </p>

            </div>

        `;

        return;
    }


    // ==================================================
    // NENHUMA NOTIFICAÇÃO
    // ==================================================

    if (
        !notifications ||
        notifications.length === 0
    ) {

        notificationsList.innerHTML = `

            <div class="notifications-empty">

                <i class="fa-regular fa-bell"></i>

                <h2>
                    Nenhuma notificação
                </h2>

                <p>
                    Quando houver novidades sobre os teus pedidos,
                    elas aparecerão aqui.
                </p>

            </div>

        `;

        return;
    }


    // ==================================================
    // RENDERIZAR
    // ==================================================

    notificationsList.innerHTML = "";


    notifications.forEach(
        notification => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "notification-item";


            if (!notification.is_read) {

                item.classList.add(
                    "unread"
                );

            }


            item.dataset.id =
                notification.id;


            item.innerHTML = `

                <div class="notification-icon">

                    <i class="fa-solid fa-bell"></i>

                </div>


                <div class="notification-content">

                    <div class="notification-top">

                        <h3>
                            ${escapeHTML(
                                notification.title
                            )}
                        </h3>

                        ${
                            !notification.is_read
                                ? `
                                    <span class="notification-new">
                                        Nova
                                    </span>
                                  `
                                : ""
                        }

                    </div>


                    <p>
                        ${escapeHTML(
                            notification.message
                        )}
                    </p>


                    <small>
                        ${formatNotificationDate(
                            notification.created_at
                        )}
                    </small>

                </div>


                ${
                    !notification.is_read
                        ? `
                            <button
                                class="notification-read-btn"
                                type="button"
                                title="Marcar como lida"
                            >

                                <i class="fa-solid fa-check"></i>

                            </button>
                          `
                        : ""
                }

            `;


            const readButton =
                item.querySelector(
                    ".notification-read-btn"
                );


            if (readButton) {

                readButton.addEventListener(
                    "click",
                    async function () {

                        await markNotificationAsRead(
                            notification.id
                        );

                    }
                );

            }


            notificationsList.appendChild(
                item
            );

        }
    );

}


// ======================================================
// MARCAR UMA COMO LIDA
// ======================================================

async function markNotificationAsRead(
    notificationId
) {

    const {
        error
    } = await supabase

        .from("notifications")

        .update({
            is_read: true
        })

        .eq(
            "id",
            notificationId
        );


    if (error) {

        console.error(
            "RJ7 NOTIFICATIONS — erro ao marcar como lida:",
            error
        );

        return;
    }


    loadNotifications();

}


// ======================================================
// MARCAR TODAS COMO LIDAS
// ======================================================

if (markAllRead) {

    markAllRead.addEventListener(
        "click",
        async function () {

            const {
                data: {
                    user
                }
            } =
                await supabase.auth.getUser();


            if (!user) {
                return;
            }


            const {
                error
            } = await supabase

                .from("notifications")

                .update({
                    is_read: true
                })

                .eq(
                    "user_id",
                    user.id
                )

                .eq(
                    "is_read",
                    false
                );


            if (error) {

                console.error(
                    "RJ7 NOTIFICATIONS — erro ao marcar todas:",
                    error
                );

                return;
            }


            loadNotifications();

        }
    );

}


// ======================================================
// PROTEÇÃO HTML
// ======================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const div =
        document.createElement("div");


    div.textContent =
        String(value);


    return div.innerHTML;

}


// ======================================================
// INICIAR
// ======================================================
// ======================================================
// BOTÃO DE NOTIFICAÇÕES
// APENAS PARA UTILIZADORES LOGADOS
// ======================================================

async function setupNotificationButton() {

    const notificationArea =
        document.getElementById(
            "notificationArea"
        );


    if (!notificationArea) {
        return;
    }


    const {
        data: {
            user
        }
    } = await supabase.auth.getUser();


    // ----------------------------------------------
    // NÃO ESTÁ LOGADO
    // ----------------------------------------------

    if (!user) {

        notificationArea.innerHTML = "";

        return;

    }


    // ----------------------------------------------
    // ESTÁ LOGADO
    // ----------------------------------------------

    notificationArea.innerHTML = `

        <a
            href="pages/notifications.html"
            class="notification-button"
            aria-label="Notificações"
        >

            <i class="fa-regular fa-bell"></i>

            <span
                id="notificationCount"
                class="notification-count"
            >
                0
            </span>

        </a>

    `;


    await updateNotificationCount(user.id);

}


// ======================================================
// CONTADOR DE NOTIFICAÇÕES NÃO LIDAS
// ======================================================

async function updateNotificationCount(
    userId
) {

    const notificationCount =
        document.getElementById(
            "notificationCount"
        );


    if (!notificationCount) {
        return;
    }


    const {
        count,
        error
    } = await supabase

        .from("notifications")

        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )

        .eq(
            "user_id",
            userId
        )

        .eq(
            "is_read",
            false
        );


    if (error) {

        console.error(
            "RJ7 NOTIFICATIONS — erro no contador:",
            error
        );

        notificationCount.textContent = "0";

        return;
    }


    const unread =
        count || 0;


    notificationCount.textContent =
        unread > 99
            ? "99+"
            : unread;


    if (unread === 0) {

        notificationCount.style.display =
            "none";

    } else {

        notificationCount.style.display =
            "flex";

    }

}


// ======================================================
// INICIAR BOTÃO
// ======================================================

setupNotificationButton();

loadNotifications();
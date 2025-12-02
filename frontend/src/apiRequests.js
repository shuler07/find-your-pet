import { DEBUG, API_PATHS } from "./data";

// Authentication

export async function ApiCheckAuth() {
    try {
        const response = await fetch(API_PATHS.auth, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        const data1 = await response.json();
        if (DEBUG) console.debug("Authentication (access). Data received:", data1);

        if (data1.detail && data1.detail.includes("Токен недействителен")) {
            return await ApiRefreshAuth();
        };

        return data1;
    } catch (error) {
        console.error("Authentication. Error occured:", error);
        return { error: true };
    }
}

export async function ApiRefreshAuth() {
    try {
        const response = await fetch(API_PATHS.refresh, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Refreshing. Data received:", data);

        return data;
    } catch (error) {
        console.error("Refreshing. Error occured:", error);
        return { error: true };
    }
}

export async function ApiRegisterUser(email, password, confirm_password) {
    try {
        const response = await fetch(API_PATHS.register, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ email, password, confirm_password }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Registering. Data received:", data);

        return data;
    } catch (error) {
        console.error("Registering. Error occured:", error);
        return { error: true };
    }
}

export async function ApiLoginUser(email, password) {
    try {
        const response = await fetch(API_PATHS.login, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Logining. Data received:", data);

        return data;
    } catch (error) {
        console.error("Logining. Error occured:", error);
        return { error: true };
    }
}

export async function ApiLogOutUser() {
    try {
        const response = await fetch(API_PATHS.logout, {
            method: "GET",
            credentials: 'include',
            headers: { 'Content-Type':'application/json' }
        });

        const data = await response.json();
        if (DEBUG) console.debug('Logging out. Data received:', data);

        return data;
    } catch (error) {
        console.error('Logging out. Error occured:', error);
        return { error: true };
    };
}

export async function ApiDeleteUser() {
    try {
        const response = await fetch(API_PATHS.delete_user, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type':'application/json' }
        });

        const data = await response.json();
        if (DEBUG) console.debug('Deleting user. Data received:', data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiDeleteUser();
        };

        return data;
    } catch (error) {
        console.error('Deleting user. Error occured:', error);
        return { error: true };
    }
}

export async function ApiResetPassword(email, new_password) {
    try {
        const response = await fetch(API_PATHS.reset_password, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({ email, new_password }),
            headers: { 'Content-Type':'application/json' }
        });

        const data = await response.json();
        if (DEBUG) console.debug('Reseting password. Data received:', data);

        return data;
    } catch (error) {
        console.error('Reseting password. Error occured:', error);
        return { error: true };
    }
}

// User data

export async function ApiGetUser(uid) {
    try {
        const url = `${API_PATHS.user}/?uid=${uid}`;

        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Getting user. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiGetUser(uid);
        };

        return data;
    } catch (error) {
        console.error("Getting user. Error occured:", error);
        return { error: true };
    }
}

export async function ApiChangeAvatar(avatar_delete_url, avatar_display_url) {
    try {
        const response = await fetch(API_PATHS.change_avatar, {
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify({ avatar_delete_url, avatar_display_url }),
            headers: { 'Content-Type':'application/json' }
        });

        const data = await response.json();
        if (DEBUG) console.debug('Changing avatar. Data received:', data);

        return data;
    } catch (error) {
        console.error('Changing avatar. Error occured:', error);
        return { error: true };
    }
}

export async function ApiChangeName(name) {
    try {
        const response = await fetch(API_PATHS.change_name, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({ name }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Changing name. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiChangeName(name);
        };

        return data;
    } catch (error) {
        console.error("Changing name. Error occured:", error);
        return { error: true };
    }
}

export async function ApiChangePhone(phone) {
    try {
        const response = await fetch(API_PATHS.change_phone, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({ phone }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Changing phone. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiChangePhone(phone);
        };

        return data;
    } catch (error) {
        console.error("Changing phone. Error occured:", error);
        return { error: true };
    }
}

export async function ApiChangeEmail(email) {
    try {
        const response = await fetch(API_PATHS.change_email, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({ email }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Changing email. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiChangeEmail(email);
        };

        return data;
    } catch (error) {
        console.error("Changing email. Error occured:", error);
        return { error: true };
    }
}

export async function ApiChangePassword(curPassword, newPassword) {
    try {
        const response = await fetch(API_PATHS.change_password, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({ curPassword, newPassword }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Changing password. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiChangePassword(curPassword, newPassword);
        };

        return data;
    } catch (error) {
        console.error("Changing password. Error occured:", error);
        return { error: true };
    }
}

export async function ApiChangeVk(vk) {
    try {
        const response = await fetch(API_PATHS.change_vk, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({ vk }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Changing vk. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiChangeVk(vk);
        };

        return data;
    } catch (error) {
        console.error("Changing vk. Error occured:", error);
        return { error: true };
    }
}

export async function ApiChangeTg(tg) {
    try {
        const response = await fetch(API_PATHS.change_tg, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({ tg }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Changing tg. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiChangeTg(tg);
        };

        return data;
    } catch (error) {
        console.error("Changing tg. Error occured:", error);
        return { error: true };
    }
}

export async function ApiChangeMax(max) {
    try {
        const response = await fetch(API_PATHS.change_max, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({ max }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Changing max. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiChangeMax(max);
        };

        return data;
    } catch (error) {
        console.error("Changing max. Error occured:", error);
        return { error: true };
    }
}

export async function ApiChangeNotificationsLocation(location) {
    try {
        const response = await fetch(API_PATHS.change_notifications_location, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({ notificationsLocation: location }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Changing notifications location. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiChangeNotificationsLocation(location);
        };

        return data;
    } catch (error) {
        console.error("Changing notifications location. Error occured:", error);
        return { error: true };
    }
}

// Ads

export async function ApiCreateAd(adDetails) {
    try {
        const response = await fetch(API_PATHS.create_ad, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(adDetails),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Creating ad. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiCreateAd(adDetails);
        };

        return data;
    } catch (error) {
        console.error("Creating ad. Error occured:", error);
        return { error: true };
    }
}

export async function ApiGetAds(filters) {
    try {
        const response = await fetch(API_PATHS.get_ads, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(filters),
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Getting ads. Data received:", data);

        return data;
    } catch (error) {
        console.error("Getting ads. Error:", error);
        return { error: true };
    }
}

export async function ApiGetUserAds(uid) {
    try {
        const url = `${API_PATHS.get_user_ads}/?uid=${uid}`;

        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (DEBUG) console.debug("Getting user ads. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiGetUserAds(uid);
        };

        return data;
    } catch (error) {
        console.error("Getting user ads. Error occured:", error);
        return { error: true };
    }
}

export async function ApiGetAdsToCheck() {
    try {
        const response = await fetch(API_PATHS.get_ads_to_check, {
            method: "GET",
            credentials: 'include',
            headers: { 'Content-Type':'application/json' }
        });

        const data = await response.json();
        if (DEBUG) console.debug("Getting ads to check. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiGetAdsToCheck();
        };

        return data;
    } catch (error) {
        console.error("Getting ads to check. Error occured:", error);
        return { error: true };
    }
}

export async function ApiGetReportedAds() {
    try {
        const response = await fetch(API_PATHS.get_ads_reported, {
            method: "GET",
            credentials: 'include',
            headers: { 'Content-Type':'application/json' }
        });

        const data = await response.json();
        if (DEBUG) console.debug("Getting reported ads. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiGetReportedAds();
        };

        return data;
    } catch (error) {
        console.error("Getting reported ads. Error occured:", error);
        return { error: true };
    }
}

export async function ApiGetAdCreator(uid) {
    try {
        const response = await fetch(API_PATHS.get_ad_creator + `?uid=${uid}`, {
            method: "GET",
            credentials: 'include',
            headers: { 'Content-Type':'application/json' }
        });

        const data = await response.json();
        if (DEBUG) console.debug("Getting ad creator. Data received:", data);

        return data;
    } catch (error) {
        console.error("Getting ad creator. Error occured:", error);
        return { error: true };
    }
}

export async function ApiCloseAd(id) {
    try {
        const response = await fetch(API_PATHS.close_ad, {
            method: "PUT",
            credentials: 'include',
            body: JSON.stringify({ ad_id: id }),
            headers: { 'Content-Type':'application/json' }
        });

        const data = await response.json();
        if (DEBUG) console.debug("Closing ad. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiCloseAd(id);
        };

        return data;
    } catch (error) {
        console.error("Closing ad. Error occured:", error);
        return { error: true };
    }
}

export async function ApiApproveAd(id) {
    try {
        const response = await fetch(API_PATHS.approve_ad, {
            method: "PUT",
            credentials: 'include',
            body: JSON.stringify({ ad_id: id }),
            headers: { 'Content-Type':'application/json' }
        });

        const data = await response.json();
        if (DEBUG) console.debug("Approving ad. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiApproveAd(id);
        };

        return data;
    } catch (error) {
        console.error("Approving ad. Error occured:", error);
        return { error: true };
    }
}

export async function ApiDeleteAd(id) {
    try {
        const response = await fetch(API_PATHS.delete_ad, {
            method: "DELETE",
            credentials: 'include',
            body: JSON.stringify({ ad_id: id }),
            headers: { 'Content-Type':'application/json' }
        });

        const data = await response.json();
        if (DEBUG) console.debug("Deleting ad. Data received:", data);

        if (data.detail && data.detail.includes("Токен недействителен")) {
            await ApiRefreshAuth();
            return await ApiDeleteAd(id);
        };

        return data;
    } catch (error) {
        console.error("Deleting ad. Error occured:", error);
        return { error: true };
    }
}

// Server

export async function ApiGetServerStats() {
    try {
        const response = await fetch(API_PATHS.get_server_stats, {
            method: "GET",
            credentials: 'include',
            headers: { 'Content-Type':'application/json' }
        });

        const data = await response.json();
        if (DEBUG) console.debug("Getting server stats. Data received:", data);

        return data;
    } catch (error) {
        console.error("Getting server stats. Error occured:", error);
        return { error: true };
    }
}

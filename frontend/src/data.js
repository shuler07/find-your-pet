const API_BASENAME = "http://localhost:8000";
export const API_PATHS = {
    auth: API_BASENAME + "/me",
    refresh: API_BASENAME + "/refresh",
    register: API_BASENAME + "/register",
    login: API_BASENAME + "/login",
    logout: API_BASENAME + "/logout",
    user: API_BASENAME + "/user",
    delete_user: API_BASENAME + '/user',
    reset_password: API_BASENAME + '/todo',

    create_ad: API_BASENAME + "/ads/create",
    get_ads: API_BASENAME + "/ads",
    get_my_ads: API_BASENAME + "/ads/my",
    get_ads_to_check: API_BASENAME + '/todo',
    get_reported_ads: API_BASENAME + '/todo',
    get_ad_creator: API_BASENAME + '/todo',
    remove_ad: API_BASENAME + '/todo',

    change_name: API_BASENAME + "/user/name",
    change_phone: API_BASENAME + "/user/phone",
    change_email: API_BASENAME + "/user/email",
    change_password: API_BASENAME + "/user/password",
    change_vk: API_BASENAME + '/todo',
    change_tg: API_BASENAME + '/todo',
    change_max: API_BASENAME + '/todo',
    change_notifications_location: API_BASENAME + '/todo',
};

export const DEBUG = true;

export const CREATE_AD_STAGES = [
    "1. Основная информация",
    "2. Информация о животном",
    "3. Место и время",
];

export const AD_INFO_DICT = {
    status: { lost: "Потеряно", found: "Найдено", closed: "Снято", any: "Любой" },
    type: { dog: "Собака", cat: "Кошка", any: "Любое" },
    breed: {
        labrador: "Лабрадор",
        german_shepherd: "Немецкая овчарка",
        poodle: "Пудель",
        metis: "Метис",
        any: "Любая",
    },
    size: {
        little: "Небольшой",
        medium: "Средний",
        big: "Крупный",
        any: "Любой",
    },
    danger: {
        safe: "Безопасен",
        danger: "Может быть опасен",
        unknown: "Опасен или нет неизвестно",
        any: "Любая",
    },
    region: {
        moscow_city: 'город Москва',
        moscow: 'Московская обл.',
        any: 'Любой'
    },
};

export const AD_FILTERS_DICT = {
    status: "Статус",
    type: "Животное",
    breed: "Порода",
    size: "Размер",
    danger: "Опасность",
    region: 'Регион',
    geoloc: 'Геолокация',
    radius: 'Радиус поиска'
};

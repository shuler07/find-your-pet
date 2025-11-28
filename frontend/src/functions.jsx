export function RestartAnim(elem) {
    elem.style.display = 'none';
    void elem.offsetWidth;
    elem.style.display = 'flex';
};

export function getGeolocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) resolve(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const geoloc = [pos.coords.longitude, pos.coords.latitude];
                resolve(geoloc);
            },
            (error) => {
                console.error(
                    "Getting geolocation from browser. Error occured:",
                    error
                );
                resolve(null);
            }
        );
    })
};
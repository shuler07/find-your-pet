export function RestartAnim(elem) {
    elem.style.display = 'none';
    void elem.offsetWidth;
    elem.style.display = 'flex';
};
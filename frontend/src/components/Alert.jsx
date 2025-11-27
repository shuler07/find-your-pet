import "./Alert.css";

export default function Alert({ text, color, ref }) {

    const alert_color = {
        red: '#ef5d5d',
        green: '#3aad3a',
    };

    return (
        <div id="app-alert-container" ref={ref} style={{ display: text ? 'flex' : 'none' }}>
            <div id="app-alert" style={{ background: alert_color[color] }}>
                <h3>{text}</h3>
            </div>
        </div>
    );
}

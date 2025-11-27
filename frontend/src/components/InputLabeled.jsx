import "./InputLabeled.css";

import { useState } from "react";

export default function InputLabeled({
    inputId,
    type,
    placeholder,
    autoComplete,
    label,
    ref,
    value,
}) {
    const [text, setText] = useState(value);

    return (
        <div className="input-labeled">
            <label htmlFor={inputId}>{label}</label>
            <input
                id={inputId}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                ref={ref}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
        </div>
    );
}

import { useState } from "react";
import "./DropdownLabeled.css";

export default function DropdownLabeled({ dropdownId, label, choices, ref, value }) {
    const [choice, setChoice] = useState(value);
    
    return (
        <div className="dropdown-labeled">
            <label htmlFor={dropdownId}>{label}</label>
            <div>
                <select id={dropdownId} ref={ref} value={choice} onChange={(e) => setChoice(e.target.value)}>
                    {choices.map((value, index) => (
                        <option
                            key={`keyOption${dropdownId}${index}`}
                            value={value[0]}
                        >
                            {value[1]}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

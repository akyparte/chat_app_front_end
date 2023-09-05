import { useState } from 'react';
import '../App.css';

function ConditionalComp(params) {
    const stage = params.stage;
    if (stage == 'register-user') {
        return (<div className="get-info-container">
            <input placeholder="enter unique name" onChange={params.onChange} value={params.name} />
            <button onClick={params.sendName}>
                Start chatting !
            </button>
        </div>);
    }
}

export default ConditionalComp;

import React from 'react';
import { SegmentedButtons } from 'react-native-paper';
import { OnOffState } from './on-off-toggle.utils';
export const OnOffToggle = ({ isOn, toggleState, style }) => {
    return (<SegmentedButtons buttons={[
            { value: OnOffState.on, icon: 'play' },
            { value: OnOffState.off, icon: 'stop' },
        ]} style={style} value={isOn ? OnOffState.on : OnOffState.off} onValueChange={toggleState}/>);
};
//# sourceMappingURL=on-off-toggle.js.map
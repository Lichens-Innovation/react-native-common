import { jsx as _jsx } from "react/jsx-runtime";
import { SegmentedButtons } from 'react-native-paper';
import { OnOffState } from './on-off-toggle.utils';
export const OnOffToggle = ({ isOn, toggleState, style }) => {
    return (_jsx(SegmentedButtons, { buttons: [
            { value: OnOffState.on, icon: 'play' },
            { value: OnOffState.off, icon: 'stop' },
        ], style: style, value: isOn ? OnOffState.on : OnOffState.off, onValueChange: toggleState }));
};
//# sourceMappingURL=on-off-toggle.js.map
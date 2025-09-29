import { jsx as _jsx } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { commonStore } from '../../store/common.store';
import { getMonospaceFontName } from '../../utils/font.utils';
import dark from './styles/dark';
import light from './styles/light';
import { CodeTag } from './syntax-coloring-tag-code';
import { PreTag } from './syntax-coloring-tag-pre';
export const SyntaxColoring = observer(({ code, language, maxCodeLength }) => {
    const style = commonStore.isDarkMode ? dark : light;
    const isSyntaxHighlightingEnabled = !maxCodeLength || code.length < maxCodeLength;
    if (isSyntaxHighlightingEnabled) {
        return (_jsx(SyntaxHighlighter, { language: language, style: style, PreTag: PreTag, CodeTag: CodeTag, children: code }));
    }
    return (_jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: true, children: _jsx(Text, { style: styles.codeText, numberOfLines: 0, children: code }) }));
});
const styles = StyleSheet.create({
    codeText: {
        fontFamily: getMonospaceFontName(),
    },
});
//# sourceMappingURL=syntax-coloring.js.map
import { observer } from 'mobx-react-lite';
import React from 'react';
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
        return (<SyntaxHighlighter language={language} style={style} PreTag={PreTag} CodeTag={CodeTag}>
        {code}
      </SyntaxHighlighter>);
    }
    return (<ScrollView horizontal showsHorizontalScrollIndicator={true}>
      <Text style={styles.codeText} numberOfLines={0}>
        {code}
      </Text>
    </ScrollView>);
});
const styles = StyleSheet.create({
    codeText: {
        fontFamily: getMonospaceFontName(),
    },
});
//# sourceMappingURL=syntax-coloring.js.map
import { getDefaultRegistry } from '@rjsf/core';
import type {
  ArrayFieldItemTemplateProps,
  ArrayFieldTemplateProps,
  ErrorListProps,
  FieldErrorProps,
  FieldHelpProps,
  FieldTemplateProps,
  GridTemplateProps,
  ObjectFieldTemplateProps,
} from '@rjsf/utils';
import { getTemplate, getUiOptions } from '@rjsf/utils';
import { useMemo, type ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import {
  AddButton,
  ClearButton,
  CopyButton,
  MoveDownButton,
  MoveUpButton,
  RemoveButton,
  SubmitButton,
} from './rjsf-paper-buttons';

const defaultTemplates = getDefaultRegistry().templates;

/** No-op error list: we omit the top "Erreurs" block; field-level errors still show per field. */
const NoopErrorList = () => null;

const PaperObjectFieldTemplate = ({ title, description, properties }: ObjectFieldTemplateProps) => {
  const styles = useStyles();

  return (
    <View style={styles.fieldSet}>
      {title ? (
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
      ) : null}

      {description ? (
        <Text variant="bodySmall" style={styles.description}>
          {typeof description === 'string' ? description : null}
        </Text>
      ) : null}

      {properties.map((prop) => {
        if (prop.hidden) return null;
        return <View key={prop.name}>{prop.content}</View>;
      })}
    </View>
  );
};

const PaperFieldTemplate = ({ children, errors }: FieldTemplateProps) => {
  const styles = useStyles();

  return (
    <View style={styles.field}>
      {children}
      {errors}
    </View>
  );
};

const PaperFieldErrorTemplate = ({ errors }: FieldErrorProps) => {
  const styles = useStyles();

  if (!errors || errors.length === 0) return null;

  return (
    <View style={styles.errorList}>
      {(errors as string[]).map((msg, index) => (
        <Text key={`error-${index}-${msg}`} variant="bodySmall" style={styles.fieldError}>
          {msg}
        </Text>
      ))}
    </View>
  );
};

const PaperFieldHelpTemplate = ({ help }: FieldHelpProps) => {
  const styles = useStyles();

  if (!help) return null;

  return (
    <Text variant="bodySmall" style={styles.help}>
      {typeof help === 'string' ? help : null}
    </Text>
  );
};

/** Renders a single array item using View (React Native). Default RJSF template uses div and breaks on RN. */
const PaperArrayFieldItemTemplate = ({
  children,
  buttonsProps,
  hasToolbar,
  registry,
  uiSchema,
}: ArrayFieldItemTemplateProps) => {
  const styles = useStyles();
  const uiOptions = getUiOptions(uiSchema);
  const ArrayFieldItemButtonsTemplate = getTemplate('ArrayFieldItemButtonsTemplate', registry, uiOptions);

  return (
    <View style={styles.arrayItemRow}>
      <View style={styles.arrayItemContent}>{children}</View>
      {hasToolbar ? (
        <View style={styles.arrayItemToolbar}>
          <ArrayFieldItemButtonsTemplate {...buttonsProps} />
        </View>
      ) : null}
    </View>
  );
};

const PaperArrayFieldTemplate = ({ title, items, canAdd, onAddClick, registry, uiSchema }: ArrayFieldTemplateProps) => {
  const styles = useStyles();

  return (
    <View style={styles.fieldSet}>
      {title ? (
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
      ) : null}

      {items.map((item, index) => (
        <View key={'key' in item ? String(item.key) : index} style={styles.arrayItem}>
          {item}
        </View>
      ))}

      {canAdd ? (
        <AddButton onClick={onAddClick} registry={registry} uiSchema={uiSchema as Record<string, unknown>} />
      ) : null}
    </View>
  );
};

const PaperGridTemplate = ({ children, column, style, ...rest }: GridTemplateProps) => {
  const styles = useStyles();
  const layoutStyle = column ? styles.gridCol : styles.gridRow;

  return (
    <View style={[layoutStyle, style]} {...rest}>
      {children}
    </View>
  );
};

export const PAPER_TEMPLATES = {
  ...defaultTemplates,
  ObjectFieldTemplate: PaperObjectFieldTemplate as ComponentType<ObjectFieldTemplateProps>,
  FieldTemplate: PaperFieldTemplate as ComponentType<FieldTemplateProps>,
  FieldErrorTemplate: PaperFieldErrorTemplate as ComponentType<FieldErrorProps>,
  FieldHelpTemplate: PaperFieldHelpTemplate as ComponentType<FieldHelpProps>,
  ArrayFieldTemplate: PaperArrayFieldTemplate as ComponentType<ArrayFieldTemplateProps>,
  ArrayFieldItemTemplate: PaperArrayFieldItemTemplate as ComponentType<ArrayFieldItemTemplateProps>,
  ErrorListTemplate: NoopErrorList as ComponentType<ErrorListProps>,
  GridTemplate: PaperGridTemplate as ComponentType<GridTemplateProps>,
  ButtonTemplates: {
    ...defaultTemplates.ButtonTemplates,
    AddButton,
    ClearButton,
    CopyButton,
    MoveDownButton,
    MoveUpButton,
    RemoveButton,
    SubmitButton,
  },
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        fieldSet: {
          marginVertical: theme.spacing(2),
        },
        title: {
          marginBottom: theme.spacing(1),
        },
        description: {
          marginBottom: theme.spacing(2),
          opacity: 0.8,
        },
        field: {
          marginVertical: theme.spacing(0.5),
          flex: 1,
        },
        errorList: {
          marginTop: theme.spacing(1),
          gap: theme.spacing(0.5),
        },
        fieldError: {
          color: theme.colors.error,
        },
        help: {
          marginTop: theme.spacing(1),
          opacity: 0.8,
        },
        arrayItem: {
          marginVertical: theme.spacing(1),
        },
        arrayItemRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: theme.spacing(1),
        },
        arrayItemContent: {
          flex: 1,
        },
        arrayItemToolbar: {
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: theme.spacing(1),
        },
        gridRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing(1),
        },
        gridCol: {
          flexDirection: 'column',
          flex: 1,
          gap: theme.spacing(1),
        },
      }),
    [theme]
  );
};

import { toDisplayLocale } from '@lichens-innovation/ts-common';
import { formatDateTimeForDisplay, getRjsfDisplayLabel, getRjsfLabelColor } from '@lichens-innovation/ts-common/rjsf';
import type { FieldProps, RJSFSchema } from '@rjsf/utils';
import { useState, type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Button, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../theme';
import { DialogOkCancel } from '../../dialogs';
import { DrawingPad, DrawingView, isEmptyPath } from '../../drawing';
import { VoiceRecognitionTextInput } from '../../voice-recognition';
import {
  hasSignature,
  isSignedByOther,
  normalizeSignatureAnswer,
  readSignatureUiOptions,
  withComment,
  withSignature,
  withoutSignature,
  type SignatureAnswer,
  type SignatureSigner,
} from './signature-field.utils';

/**
 * What the Signature field reads from rjsf's `formContext`: the logged-in user, published by the host
 * screen. Absent until the user's profile has synced, and in hosts that have no user (a builder preview).
 */
export type SignatureFormContext = { currentUser?: SignatureSigner };

type Confirm = 'replace' | 'delete' | null;

/**
 * Signature field (`ui:field: "SignatureField"`, SPOTD-1218): an optional comment, then the signature
 * shown read-only in a 3:1 box, signed on a full-screen pad behind the pencil. The answer contract is
 * in signature-field.utils.
 */
export const SignatureField: FunctionComponent<FieldProps<Record<string, unknown>, RJSFSchema>> = ({
  formData,
  onChange,
  schema,
  uiSchema,
  required,
  disabled,
  readonly,
  fieldPathId,
  id,
  registry,
}) => {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const [padOpen, setPadOpen] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const answer = normalizeSignatureAnswer(formData);
  const signed = hasSignature(answer) ? answer : undefined;
  const { enableComment, commentLabel } = readSignatureUiOptions(uiSchema);
  const currentUser = (registry?.formContext as SignatureFormContext | undefined)?.currentUser;
  const label = getRjsfDisplayLabel({ label: typeof schema.title === 'string' ? schema.title : '', required });
  const labelColor = getRjsfLabelColor(uiSchema?.['ui:options']);
  const locked = !!(readonly || disabled);

  const emit = (next: SignatureAnswer | undefined) => {
    onChange(next as Record<string, unknown> | undefined, fieldPathId?.path ?? [], undefined, fieldPathId?.$id ?? id);
  };

  const onPencil = () => {
    if (!currentUser) {
      Alert.alert(t('common:signature.userNotSyncedTitle'), t('common:signature.userNotSyncedBody'));
      return;
    }
    if (isSignedByOther(answer, currentUser.userUuid)) setConfirm('replace');
    else setPadOpen(true);
  };

  const onSave = (path: string) => {
    setPadOpen(false);
    if (currentUser) emit(withSignature(answer, { path, signer: currentUser, now: new Date() }));
  };

  const signerName = signed?.signer_name ?? '';
  const signedAt = signed ? formatDateTimeForDisplay(signed.signed_at, toDisplayLocale(i18n.language)) : '';

  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="titleMedium" style={[styles.label, labelColor ? { color: labelColor } : undefined]}>
          {label}
        </Text>
      ) : null}

      {enableComment ? (
        <VoiceRecognitionTextInput
          mode="outlined"
          // Empty and unused, drawn as a light stand-in: forms hold many of these (rec 24.C).
          deferUntilUsed
          label={commentLabel ?? t('common:signature.comment')}
          value={answer.comment ?? ''}
          disabled={disabled}
          editable={!readonly}
          persistRecording={false}
          multiline
          onValueChange={({ value }) => emit(withComment(answer, value))}
          style={styles.comment}
          outlineColor={theme.colors.outline}
        />
      ) : null}

      <View style={styles.row}>
        <View style={styles.box}>
          <DrawingView testID="signature-view" path={signed?.path} placeholder={t('common:signature.empty')} />
        </View>
        {locked ? null : (
          <View>
            <IconButton
              testID="signature-edit"
              icon="pencil"
              mode="contained-tonal"
              style={currentUser ? undefined : styles.dimmed}
              accessibilityLabel={t('common:signature.padTitle')}
              onPress={onPencil}
            />
            {signed ? (
              <IconButton
                testID="signature-delete"
                icon="trash-can-outline"
                mode="contained-tonal"
                accessibilityLabel={t('common:signature.deleteTitle')}
                onPress={() => setConfirm('delete')}
              />
            ) : null}
          </View>
        )}
      </View>

      {signed ? (
        <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('common:signature.signedBy', { name: signerName, date: signedAt })}
        </Text>
      ) : null}

      {padOpen ? <SignaturePadModal onCancel={() => setPadOpen(false)} onSave={onSave} /> : null}

      <DialogOkCancel
        isVisible={confirm === 'replace'}
        title={t('common:signature.replaceTitle')}
        description={t('common:signature.replaceBody', { name: signerName })}
        okLabel={t('common:signature.replace')}
        onCancel={() => setConfirm(null)}
        onOk={() => {
          setConfirm(null);
          setPadOpen(true);
        }}
      />
      <DialogOkCancel
        isVisible={confirm === 'delete'}
        title={t('common:signature.deleteTitle')}
        description={t('common:signature.deleteBody', { name: signerName })}
        okLabel={t('common:signature.delete')}
        onCancel={() => setConfirm(null)}
        onOk={() => {
          setConfirm(null);
          emit(withoutSignature(answer));
        }}
      />
    </View>
  );
};

type SignaturePadModalProps = {
  onCancel: () => void;
  onSave: (path: string) => void;
};

/**
 * The full-screen pad. It opens empty, Save stays disabled until something is drawn, and Cancel
 * changes nothing. Every orientation is allowed (iOS locks a Modal to portrait otherwise), and the pad
 * keeps 3:1 in whichever one the device is in.
 */
const SignaturePadModal: FunctionComponent<SignaturePadModalProps> = ({ onCancel, onSave }) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const [path, setPath] = useState('');
  const empty = isEmptyPath(path);

  return (
    <Modal visible animationType="slide" supportedOrientations={['portrait', 'landscape']} onRequestClose={onCancel}>
      {/* Android: a Modal is its own window, out of reach of the app's GestureHandlerRootView. */}
      <GestureHandlerRootView style={styles.fill}>
        <SafeAreaView style={[styles.fill, { backgroundColor: theme.colors.background }]}>
          <Text variant="titleLarge" style={styles.padTitle}>
            {t('common:signature.padTitle')}
          </Text>
          <View style={styles.padArea}>
            <DrawingPad
              testID="signature-pad"
              path={path}
              onChange={setPath}
              caption={t('common:signature.signHere')}
            />
          </View>
          <View style={[styles.actions, { borderTopColor: theme.colors.outlineVariant }]}>
            <PadAction label={t('common:signature.cancel')} outlined onPress={onCancel} />
            <PadAction label={t('common:signature.clear')} outlined disabled={empty} onPress={() => setPath('')} />
            <PadAction label={t('common:signature.save')} disabled={empty} onPress={() => onSave(path)} />
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
};

type PadActionProps = { label: string; onPress: () => void; outlined?: boolean; disabled?: boolean };

/**
 * One button of the pad's action bar, styled like the app's ModalActions in its `row` layout (which
 * lives in the app, out of this package's reach): 48 high, rounded 12, bold label with tight margins.
 */
const PadAction: FunctionComponent<PadActionProps> = ({ label, onPress, outlined, disabled }) => (
  <Button
    mode={outlined ? 'outlined' : 'contained'}
    onPress={onPress}
    disabled={disabled}
    style={styles.action}
    contentStyle={styles.actionContent}
    labelStyle={styles.actionLabel}
  >
    {label}
  </Button>
);

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { marginBottom: 6 },
  comment: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  box: { flex: 1 },
  dimmed: { opacity: 0.4 },
  subtitle: { marginTop: 4 },
  fill: { flex: 1 },
  padTitle: { paddingHorizontal: 16, paddingTop: 12 },
  padArea: { flex: 1, padding: 16 },
  actions: { flexDirection: 'row', gap: 8, padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  action: { flexGrow: 1, flexShrink: 1, borderRadius: 12 },
  actionContent: { height: 48 },
  actionLabel: { fontWeight: 'bold', marginHorizontal: 8 },
});

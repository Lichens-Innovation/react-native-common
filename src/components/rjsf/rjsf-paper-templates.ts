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
import type { ComponentType } from 'react';
import {
  AddButton,
  ClearButton,
  CopyButton,
  MoveDownButton,
  MoveUpButton,
  RemoveButton,
  SubmitButton,
} from './buttons/buttons.index';
import { PaperArrayFieldItemTemplate } from './templates/paper-array-field-item-template';
import { PaperArrayFieldTemplate } from './templates/paper-array-field-template';
import { PaperFieldErrorTemplate } from './templates/paper-field-error-template';
import { PaperFieldHelpTemplate } from './templates/paper-field-help-template';
import { PaperFieldTemplate } from './templates/paper-field-template';
import { PaperGridTemplate } from './templates/paper-grid-template';
import { PaperObjectFieldTemplate } from './templates/paper-object-field-template';

const defaultTemplates = getDefaultRegistry().templates;

// Field-level errors already render under each field, so the top-of-form error summary is dropped. habit-hooks-disable non-essential-comment
const NoopErrorList = () => null;

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

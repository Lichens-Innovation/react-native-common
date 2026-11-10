/** habit-hooks-disable non-essential-comment
 * An action offered on top of the media currently on screen. Deliberately generic: the viewer knows
 * only that someone handed it an icon, a label and something to run. An app that passes nothing gets
 * no button, so consumers that never set it are unaffected.
 */
export interface ViewerFabAction {
  icon: string;
  label: string;
  onPress: () => void;
  busy?: boolean;
}

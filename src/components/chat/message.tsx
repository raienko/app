import { memo, type ComponentProps } from "react";
import {
  Pressable,
  View,
  type AccessibilityActionEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Avatar from "@/components/avatar";
import Icon from "@/components/icon";
import If from "@/components/if";
import Text from "@/components/text";
import {
  controlA11yProps,
  disabledA11yProps,
  useAnimationDuration,
} from "@/features/accessibility";
import { formatNumber, useLocale } from "@/features/localization";
import { createStyles, useSizes } from "@/features/responsive";
import { useTheme } from "@/features/theme";
import { isWeb } from "@/utils";

import Attachments from "./attachments";
import { formatMessageTime } from "./format";
import Receipt from "./receipt";
import { endsGroup, startsGroup, toTime, type GroupPosition } from "./rows";
import type { ChatMessage, ChatParticipant } from "./types";

type AttachmentHandlers = Pick<
  ComponentProps<typeof Attachments>,
  "onOpenImage" | "onOpenVideo" | "onOpenFile"
>;

export type MessageProps = AttachmentHandlers & {
  message: ChatMessage;
  /** Who sent it. Falls back to the sender id as a name. */
  sender?: ChatParticipant;
  /** The current user's own message: drawn on the end side, with a receipt. */
  own: boolean;
  /** Its place in a run from the same sender. Defaults to `"single"`. */
  position?: GroupPosition;
  /**
   * Show the sender's name and avatar at the start of a group — for group
   * chats. A one-to-one chat doesn't need telling who the other person is
   * on every message. Defaults to `true`.
   */
  showSender?: boolean;
  /** The message this one answers, quoted above the text. */
  replyTarget?: { message: ChatMessage; senderName: string };
  /** Used to highlight the reactions the current user made. */
  currentUserId?: string;
  /** Long-press, or the screen reader's "Message actions" action. */
  onOpenActions?: (message: ChatMessage) => void;
  /** Swipe toward the end side, or the screen reader's "Reply" action. */
  onReply?: (message: ChatMessage) => void;
  onRetry?: (message: ChatMessage) => void;
  /** A press on an existing reaction chip — usually toggles the user's own. */
  onReact?: (message: ChatMessage, emoji: string) => void;
  /**
   * A press on the sender's avatar or name — usually navigates to their
   * profile. Others' messages only. Also a screen-reader action, so it
   * works in a one-to-one chat, where neither is drawn.
   */
  onOpenProfile?: (sender: ChatParticipant, message: ChatMessage) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** How far a swipe has to travel, in points, before letting go replies. */
const REPLY_THRESHOLD = 56;
const REPLY_MAX = 72;

/**
 * One message in a thread: the bubble, and everything that hangs off it.
 *
 * **Own and others' differ by side, fill and edge** — own messages sit on
 * the end side in the `selected` tint with an `accent` bar on their outer
 * edge (the kit's selection language, never an inverted block); others sit
 * on the start side in `backgroundElement`. Square corners, as everywhere
 * in Graphite, through `radius.surface` so rounding stays one edit away.
 *
 * **Grouping is decided outside** (`./rows.ts`) and arrives as `position`:
 * the name and avatar go on the first message of a run, the time and
 * receipt on the last, and the gap after a run is wider than inside one. A
 * failed message shows its receipt wherever it is, because it needs acting
 * on.
 *
 * **Actions are one gesture away, and reachable without it.** A long-press
 * calls `onOpenActions`; a swipe toward the end side calls `onReply`
 * (native only — on the web a horizontal drag is text selection). Screen
 * readers get both as named custom actions on the message text, so neither
 * depends on a gesture they can't make.
 *
 * **The sender opens their profile**: the avatar is a button, the name is
 * pressable, and both call `onOpenProfile` with the participant.
 *
 * **To a screen reader the text is one element**: "Ada, 14:05. See you
 * there. Read." — sender, time, body and state in reading order, with the
 * visual pieces hidden. Attachments, reactions and a retry stay separate
 * elements, since each can be acted on.
 */
function Message({
  message,
  sender,
  own,
  position = "single",
  showSender = true,
  replyTarget,
  currentUserId,
  onOpenActions,
  onReply,
  onRetry,
  onReact,
  onOpenProfile,
  onOpenImage,
  onOpenVideo,
  onOpenFile,
  style,
  testID,
}: MessageProps) {
  const theme = useTheme();
  const styles = useStyles();
  const { spacing } = useSizes();
  const { t, locale, isRTL } = useLocale();
  const duration = useAnimationDuration();

  const name = sender?.name ?? message.senderId;
  const profile = own ? undefined : onOpenProfile;
  const openProfile = () =>
    profile?.(
      sender ?? { id: message.senderId, name: message.senderId },
      message,
    );
  const profileLabel = t("chat.openProfile", { name });
  const time = formatMessageTime(toTime(message.createdAt), locale);
  const first = startsGroup(position);
  const last = endsGroup(position);
  const showName = !own && showSender && first;
  const showAvatarSlot = !own && showSender;
  const showReceipt =
    own &&
    message.status !== undefined &&
    !message.deleted &&
    (last || message.status === "failed");

  // ---- swipe to reply --------------------------------------------------
  // Toward the end side: right in LTR, left in RTL.
  const direction = isRTL ? -1 : 1;
  const translateX = useSharedValue(0);
  const canSwipe = !isWeb && onReply !== undefined && !message.deleted;
  const reply = () => onReply?.(message);

  const swipe = Gesture.Pan()
    .enabled(canSwipe)
    .activeOffsetX(direction > 0 ? [-1000, 16] : [-16, 1000])
    .failOffsetY([-12, 12])
    .onUpdate((event) => {
      const travel = event.translationX * direction;
      translateX.value = Math.max(0, Math.min(REPLY_MAX, travel)) * direction;
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) >= REPLY_THRESHOLD) runOnJS(reply)();
      translateX.value = withTiming(0, { duration: duration(160) });
    });

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const hintStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / REPLY_THRESHOLD),
  }));

  // ---- accessibility ---------------------------------------------------
  const statusLabel = showReceipt
    ? t(`chat.receipt.${message.status ?? "sent"}`)
    : undefined;
  const body = message.deleted ? t("chat.deleted") : message.text;
  const reactionsLabel =
    message.reactions && message.reactions.length > 0
      ? t("chat.message.reactions", {
          reactions: message.reactions
            .map(
              (reaction) =>
                `${reaction.emoji} ${formatNumber(reaction.userIds.length, locale)}`,
            )
            .join(", "),
        })
      : undefined;
  const label = [
    t("chat.message.label", { name: own ? t("chat.you") : name, time }),
    replyTarget
      ? t("chat.replyingTo", { name: replyTarget.senderName })
      : undefined,
    body,
    message.editedAt === undefined || message.deleted
      ? undefined
      : t("chat.edited"),
    reactionsLabel,
    statusLabel,
  ]
    .filter(Boolean)
    .join(". ");

  const actionable = !message.deleted;
  const accessibilityActions = actionable
    ? [
        ...(onOpenActions
          ? [{ name: "actions", label: t("chat.actions.title") }]
          : []),
        ...(onReply ? [{ name: "reply", label: t("chat.actions.reply") }] : []),
        ...(profile ? [{ name: "profile", label: profileLabel }] : []),
      ]
    : [];
  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === "actions") onOpenActions?.(message);
    if (event.nativeEvent.actionName === "reply") onReply?.(message);
    if (event.nativeEvent.actionName === "profile") openProfile();
  };

  const bubbleColors = own
    ? {
        backgroundColor: theme.colors.selected,
        borderColor: theme.colors.accent,
      }
    : { backgroundColor: theme.colors.backgroundElement };
  const hasAttachments =
    !message.deleted && (message.attachments?.length ?? 0) > 0;

  return (
    <View
      testID={testID}
      style={[
        styles.row,
        own ? styles.rowOwn : null,
        last ? styles.groupEnd : styles.groupInner,
        style,
      ]}
    >
      <If condition={showAvatarSlot}>
        <View style={styles.avatarSlot}>
          <If condition={first && profile}>
            <Pressable
              {...controlA11yProps({ label: profileLabel })}
              onPress={openProfile}
              hitSlop={spacing.x4}
              style={({ pressed }) => (pressed ? styles.pressedProfile : null)}
            >
              <View {...disabledA11yProps()}>
                <Avatar name={name} source={sender?.avatar} size="small" />
              </View>
            </Pressable>
          </If>
          <If condition={first && !profile}>
            <View {...disabledA11yProps()}>
              <Avatar name={name} source={sender?.avatar} size="small" />
            </View>
          </If>
        </View>
      </If>

      <View style={[styles.column, own ? styles.columnOwn : null]}>
        <If condition={canSwipe}>
          <Animated.View
            {...disabledA11yProps()}
            style={[styles.replyHint, hintStyle]}
          >
            <Icon
              name="corner-up-left"
              size={spacing.x20}
              color={theme.colors.textSecondary}
            />
          </Animated.View>
        </If>

        <GestureDetector gesture={swipe}>
          <Animated.View style={swipeStyle}>
            <Pressable
              accessible={false}
              disabled={!actionable || onOpenActions === undefined}
              onLongPress={() => onOpenActions?.(message)}
              delayLongPress={350}
              style={({ pressed }) => [
                styles.bubble,
                own ? styles.bubbleOwn : null,
                bubbleColors,
                pressed ? { opacity: 0.85 } : null,
              ]}
            >
              <View
                accessible
                accessibilityLabel={label}
                accessibilityHint={
                  accessibilityActions.length > 0
                    ? t("chat.actions.hint")
                    : undefined
                }
                accessibilityActions={accessibilityActions}
                onAccessibilityAction={onAccessibilityAction}
                style={styles.content}
              >
                <View {...disabledA11yProps()} style={styles.content}>
                  <If condition={showName}>
                    {/* Pointer-only: screen readers reach the profile through
                        the avatar button and the message's custom action,
                        and this sits inside the message's hidden visuals. */}
                    <Pressable
                      accessible={false}
                      disabled={!profile}
                      onPress={openProfile}
                      style={styles.name}
                    >
                      <Text
                        value={name}
                        type="footnote"
                        numberOfLines={1}
                        style={{ color: theme.colors.accent }}
                      />
                    </Pressable>
                  </If>

                  <If condition={replyTarget && !message.deleted}>
                    <View
                      style={[
                        styles.quote,
                        {
                          borderColor: theme.colors.accent,
                          backgroundColor: theme.colors.pressed,
                        },
                      ]}
                    >
                      <Text
                        value={replyTarget?.senderName ?? ""}
                        type="caption1"
                        numberOfLines={1}
                        style={{ color: theme.colors.accent }}
                      />
                      <Text
                        value={
                          replyTarget?.message.deleted
                            ? t("chat.deleted")
                            : (replyTarget?.message.text ??
                              t("chat.attachment.file"))
                        }
                        type="footnote"
                        numberOfLines={2}
                        style={{ color: theme.colors.textSecondary }}
                      />
                    </View>
                  </If>

                  <If condition={body}>
                    <Text
                      value={body ?? ""}
                      selectable={isWeb}
                      style={
                        message.deleted
                          ? [
                              styles.deleted,
                              { color: theme.colors.textSecondary },
                            ]
                          : null
                      }
                    />
                  </If>
                </View>
              </View>

              <If condition={hasAttachments}>
                <Attachments
                  attachments={message.attachments ?? []}
                  onOpenImage={onOpenImage}
                  onOpenVideo={onOpenVideo}
                  onOpenFile={onOpenFile}
                />
              </If>

              <If condition={last || showReceipt}>
                <View style={[styles.meta]}>
                  <View {...disabledA11yProps()} style={styles.metaText}>
                    <If
                      condition={
                        message.editedAt !== undefined && !message.deleted
                      }
                    >
                      <Text
                        value={t("chat.edited")}
                        type="caption2"
                        style={{ color: theme.colors.textSecondary }}
                      />
                    </If>
                    <Text
                      value={time}
                      type="caption2"
                      style={{ color: theme.colors.textSecondary }}
                    />
                  </View>
                  <If condition={showReceipt}>
                    <Receipt
                      status={message.status ?? "sent"}
                      onRetry={onRetry ? () => onRetry(message) : undefined}
                    />
                  </If>
                </View>
              </If>
            </Pressable>
          </Animated.View>
        </GestureDetector>

        <If condition={message.reactions?.length && !message.deleted}>
          <View style={[styles.reactions, own ? styles.reactionsOwn : null]}>
            {(message.reactions ?? []).map((reaction) => {
              const mine =
                currentUserId !== undefined &&
                reaction.userIds.includes(currentUserId);
              const count = formatNumber(reaction.userIds.length, locale);
              return (
                <Pressable
                  key={reaction.emoji}
                  disabled={onReact === undefined}
                  onPress={() => onReact?.(message, reaction.emoji)}
                  {...controlA11yProps({
                    label: `${reaction.emoji} ${count}`,
                    selected: mine,
                    disabled: onReact === undefined,
                  })}
                  style={({ pressed }) => [
                    styles.reaction,
                    {
                      backgroundColor: mine
                        ? theme.colors.selected
                        : theme.colors.background,
                      borderColor: mine
                        ? theme.colors.accent
                        : theme.colors.divider,
                    },
                    pressed ? { backgroundColor: theme.colors.pressed } : null,
                  ]}
                >
                  <Text value={`${reaction.emoji} ${count}`} type="caption1" />
                </Pressable>
              );
            })}
          </View>
        </If>
      </View>
    </View>
  );
}

export default memo(Message);

const useStyles = createStyles(({ units, spacing, radius, isRTL }) => {
  const row = isRTL ? "row-reverse" : "row";
  const start = isRTL ? "flex-end" : "flex-start";
  const end = isRTL ? "flex-start" : "flex-end";
  // The bar on an own bubble goes on its outer edge — the screen edge it
  // sits against.
  const outerEdge = isRTL ? "borderLeftWidth" : "borderRightWidth";

  return {
    row: {
      flexDirection: row,
      alignItems: "flex-start",
      gap: spacing.x8,
      paddingHorizontal: spacing.x16,
    },
    rowOwn: {
      justifyContent: end,
    },
    groupInner: {
      paddingBottom: units(2),
    },
    groupEnd: {
      paddingBottom: spacing.x12,
    },
    // Shrink-wrapped, so only the name itself is the hit target, not the
    // whole row above the text.
    name: {
      alignSelf: start,
    },
    pressedProfile: {
      opacity: 0.7,
    },
    avatarSlot: {
      width: units(32),
    },
    column: {
      maxWidth: "80%",
      flexShrink: 1,
      alignItems: start,
    },
    columnOwn: {
      alignItems: end,
    },
    bubble: {
      paddingHorizontal: spacing.x12,
      paddingVertical: spacing.x8,
      gap: spacing.x4,
      borderRadius: radius.surface,
      minWidth: units(64),
    },
    bubbleOwn: {
      [outerEdge]: units(2),
    },
    content: {
      gap: spacing.x4,
    },
    quote: {
      paddingHorizontal: spacing.x8,
      paddingVertical: spacing.x4,
      borderRadius: radius.surface,
      [isRTL ? "borderRightWidth" : "borderLeftWidth"]: units(2),
    },
    deleted: {
      fontStyle: "italic",
    },
    meta: {
      flexDirection: row,
      alignItems: "center",
      justifyContent: end,
      gap: spacing.x4,
    },
    metaText: {
      flexDirection: row,
      gap: spacing.x4,
    },
    replyHint: {
      position: "absolute",
      top: 0,
      bottom: 0,
      justifyContent: "center",
      [isRTL ? "right" : "left"]: -spacing.x4,
    },
    reactions: {
      flexDirection: row,
      flexWrap: "wrap",
      gap: spacing.x4,
      marginTop: units(-4),
      paddingHorizontal: spacing.x8,
    },
    reactionsOwn: {
      justifyContent: end,
    },
    reaction: {
      paddingHorizontal: spacing.x8,
      minHeight: units(28),
      justifyContent: "center",
      borderWidth: units(1),
      borderRadius: radius.control,
    },
  };
});
